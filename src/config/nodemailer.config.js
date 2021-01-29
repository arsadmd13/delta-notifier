const nodemailer = require("nodemailer");
const Setting = require("../models/settings");

const hbs = require("nodemailer-express-handlebars");
const handlebars = require("express-handlebars");

exports.sendMail = async (optionsInfo, responseFunction = null, res) => {

    const gmailTransport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.senderMail,
            pass: process.env.senderPassword
        }
    });

    viewEngine = handlebars.create({
        partialsDir: 'partials/',
            defaultLayout: false
        });
            
    gmailTransport.use('compile', hbs({
        viewEngine: viewEngine,
        viewPath: './src/views/',
        extName: '.hbs'
    }));
    
    gmailTransport.sendMail(optionsInfo, (error) => {
        if(error) { 
            throw new Error(error)
        } else {
            resolve({status: 200});
        }
    });

}

//************ The below function fetches email setting from Mongo ************//

async function mailFromDb() {
    await new Promise((resolve, reject) => {

        let emailSettings = {};

        Setting.find({group: "email"}, {_id: 0, group: 0}, (err, settings) => { 
            if(err){
                throw new Error(err)
            }

            settings.forEach((emailSetting) => {
                emailSettings[emailSetting.name] = emailSetting.value;
            });

            const gmailTransport = nodemailer.createTransport({
                host: emailSettings.host,
                port: emailSettings.port,
                secure: false,
                auth: {
                    user: emailSettings.senderMail,
                    pass: emailSettings.senderPassword 
                }
            });

            viewEngine = handlebars.create({
                partialsDir: 'partials/',
                defaultLayout: false
            });
            
            gmailTransport.use('compile', hbs({
                viewEngine: viewEngine,
                viewPath: './src/views/',
                extName: '.hbs'
            }));

            gmailTransport.sendMail(optionsInfo, (error) => {
                if(error) { 
                    throw new Error(err);
                } else {
                    resolve({status: 200});
                }
            });
        })
    });
}