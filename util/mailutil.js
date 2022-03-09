const nodemailer = require('nodemailer');
var config = require('config')
var path = require('path')
var fs = require('fs');


exports.sendMail = async function (mailOptions) {
    console.log("Start - [MailUtil] :: sendMail()");
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'chithminilawanya@gmail.com',
                pass: 'chikka981201',
            },
        });
        let message = {
            from: 'chithminilawanya@gmail.com',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html

        };
        console.log("[MailUtil]---->>>" + message.to)
        console.log("[MailUtil]---->>>" + message.subject)
        console.log("[MailUtil]---->>>" + message.html)
        const mailSent = await transporter.sendMail(message);

        console.log("[MailUtil] :: sendMail()" + mailSent);
        return true;
    } catch (error) {
        console.log("[MailUtil] :: sendMail() : error :" + error);
        return true;
    }
}