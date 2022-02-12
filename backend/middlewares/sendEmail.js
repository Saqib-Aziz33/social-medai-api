const nodeMailer = require('nodemailer')

exports.sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.APP_EMAIL,
          pass: process.env.APP_PASSWORD
        }
      });
    
    const mailOptions = {
        from: process.env.APP_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions)
}