import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
   try {
      const transporter = nodemailer.createTransport({
         service: 'gmail', // Change if using another service
         auth: {
            user: process.env.MAIL_SMTP_USER, // Your email (set this in .env)
            pass: process.env.MAIL_SMTP_PASS, // App password (not regular password)
         },
      });

      const mailOptions = {
         from: process.env.MAIL_SMTP_USER,
         to,
         subject,
         html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
   } catch (error) {
      console.error('Error sending email:', error);
   }
}
