const nodemailer = require('nodemailer')

const sendMail = nodemailer.createTransport({
  pool: true, 
  maxConnections: 1,
  service: 'naver',
  host: 'smtp.naver.com',
  port: 465,
  auth: {
    user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASS
  },
})

module.exports = sendMail