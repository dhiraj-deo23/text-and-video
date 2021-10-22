const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// send email
const verifyMail = (mail, code) => {
  transporter.sendMail(
    {
      from: "mail2drazzdeo@gmail.com",
      to: mail,
      subject: "Verify",
      text: `Your code is ${code}`,
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent");
    }
  );
};
// const goodbyeMail = (name, mail) => {
//   transporter.sendMail(
//     {
//       from: "namastedental.com",
//       to: mail,
//       subject: "Account Removed",
//       text: `Your account has been removed, ${name}.`,
//     },
//     (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log("Message sent");
//     }
//   );
// };

module.exports = {
  verifyMail,
};
