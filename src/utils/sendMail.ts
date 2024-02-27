import "dotenv/config";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import ejs from "ejs";
import { EmailOptions } from "../@types/types";




const SendMail = async (options: EmailOptions): Promise<void> => {
  // create transporter
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, template, data } = options;
  //   path for ejs
  const templatePath = path.join(__dirname, "../mail", template);

  try {
    //   render the email
    const html = await ejs.renderFile(templatePath, data);

    // mail options
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending mail:", error);
  }
};

export default SendMail;
