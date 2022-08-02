const nodemailer = require('nodemailer')

const sendMail = nodemailer.createTransport({
  service: 'naver',
  host: 'smtp.naver.com',
  port: 587,
  auth: {
    user: process.env.MAILER,
		pass: process.env.MAILER_PASSWORD
  },
})

module.exports = sendMail