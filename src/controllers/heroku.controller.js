const mailer = require('../config/nodemailer.config');
const Recipient = require("../models/receipients");

exports.notify = (req, res) => {
	
	// Basic auth
    if(req.params.token !== process.env.AUTH_TOKEN){
		res.status(401).send({ error: 'Unauthorized Request!' });
        return;
	}
	if (req.headers['authorization'] !== process.env.HEADER_AUTH_TOKEN) {
        res.status(401).send({ error: 'Unauthorized!' });
        return;
	}

	let webhook_data = req.body;

	if(webhook_data.webhook_metadata.event.include === "api:release"){
		// console.log(`A new version of ${webhook_data.data.app.name} (v${webhook_data.data.version}) is released!`);
		sendMail(webhook_data.data.app.name, webhook_data, "api:release", res);
	} else if(webhook_data.webhook_metadata.event.include === "api:build"){
		// console.log(`App is being built!`);
		sendMail(webhook_data.data.app.name, webhook_data, "api:build", res)
	} else if(webhook_data.webhook_metadata.event.include === "api:app"){
		// console.log(`App is deleted or its details have been updated!`);
		sendMail(webhook_data.data.name, webhook_data, "api:app", res)
    } 
    
}

async function sendMail(appName, data, api, res){
	Recipient.find({app: appName, platform: 'heroku'}, async (err, recipients) => {

		if(err) return res.status(500).send({})
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

		let templateFile = "heroku-notifier-default";

		let mailData = {
			appName: appName,
			appLink: "https://" + appName + ".herokuapp.com/",
			updatedAt: data.data.created_at ? data.data.created_at : "NA"
		};

		if(api === 'api:build' || api === 'api:release'){
			mailData['version'] = data.data.version ? data.data.version : "NA";
			mailData['commit_description'] = data.data.slug === null ? "NA" : (data.data.slug.commit_description ? data.data.slug.commit_description : "NA");
			mailData['description'] = data.data.description ? data.data.description : "NA";
		} else{
			templateFile = "notifier-maintenance";
			if(data.data.maintenance && !data.previous_data.maintenance){
				mailData['status'] = "pulled off for maintenance";
				mailData["maintenanceStatus"] = 1;
			} else if(!data.data.maintenance && data.previous_data.maintenance){
				mailData['status'] = "back up and running";
				mailData["maintenanceStatus"] = 2;
			} else {
				return res.status(200).send({});
			}
		}

		let optionsInfo = {
			from: '"Delta Notifier by MDA" <mailer@gmail.com>',
			to: toList,
			cc: ccList,
			bcc: bccList,
			subject: appName + " app updated!",
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