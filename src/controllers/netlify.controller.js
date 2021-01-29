const jwt = require('jsonwebtoken');
const mailer = require('../config/nodemailer.config');
const Recipient = require("../models/receipients");

exports.notify = async (req, res) => {

	if(req.params.token !== process.env.TOKEN){
		res.status(401).send({ error: 'Unauthorized Request!' });
        return;
	}

    let webhookSignature = req.headers['x-webhook-signature'];
    let webhookEvent = req.headers['x-netlify-event'];

    let options = {iss: "netlify", verify_iss: true, algorithm: "HS256"}

    jwt.verify(webhookSignature, process.env.NETLIFY_JWT_SECRET_KEY, options, (err, data) => {
        if(!err) {
            // Success
			// return res.send().status(200)
			// The 'api:release' data is sent so that it can be checked whether to notify user on this particular event [based on heroku webhook events]
			sendMail(webhookEvent, req.body, 'api:release', res)
        } else {
			// Invalid secret key
            return res.status(401).send()
        }
    })
}

async function sendMail(event, data, api, res){
	Recipient.find({app: data.name, platform: 'netlify'}, async (err, recipients) => {

		if(err) { return res.status(500).send({}) }
		if(!recipients || recipients.length === 0) return res.status(200).send({})

		let toList = [];
		let ccList = [];
		let bccList = [];

		recipients[0].to.forEach((recipient) => {
			if(recipient.events.includes(api)){
				recipient.status === 1 ? toList.push(recipient.address) : '';
			}
		})
		recipients[0].cc.forEach((recipient) => {
			if(recipient.events.includes(api)){
				recipient.status === 1 ? ccList.push(recipient.address) : '';
			}
		})
		recipients[0].bcc.forEach((recipient) => {
			if(recipient.events.includes(api)){
				recipient.status === 1 ? bccList.push(recipient.address) : '';
			}
		})

		if(toList.length === 0 && ccList.length === 0 && bccList.length === 0) {
			return res.send().status(200)
		}

		let templateFile = "netlify-notifier-default";

		let mailData = {
			appName: data.name,
			appLink: data.links.alias,
			deployedBy: data.committer,
			updatedAt: data.published_at ? data.published_at : "NA"
			// If you need need to add other data, add here and change accordingly in the template file
		};

		let optionsInfo = {
			from: '"Delta Notifier by MDA" <mailer@gmail.com>',
			to: toList,
			cc: ccList,
			bcc: bccList,
			subject: data.name + " app updated!",
			template: templateFile,
			context: mailData
		}

		await mailer.sendMail(optionsInfo, null, res)
			.then(() => {
				return res.status(200).send()
			})
			.catch((err) => {
				return res.status(500).send()
			})
	})
}