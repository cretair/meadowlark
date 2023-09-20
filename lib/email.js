const nodemailer = require('nodemailer')
//const htmlToFormattedText = require('html-to-formatted-text')

module.exports = credentials => {

	const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: credentials.gmail.user,
      pass: credentials.gmail.password,
    },
	})

	const from = '"Meadowlark Travel" <info@meadowlarktravel.com>'
	const errorRecipient = 'twojemail@gmail.com'

	return {
    send: (to, subject, html) =>
      mailTransport.sendMail({
        from,
        to,
        subject,
        html,
//        text: htmlToFormattedText(html),
      }),
  }

}
