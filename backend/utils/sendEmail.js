const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Create a transporter using standard SMTP (e.g., Gmail)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(message);
    console.log("Message sent via Nodemailer. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email via Nodemailer:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
