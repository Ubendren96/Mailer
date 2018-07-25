#!/usr/bin/env node
const commands = require("commander");
const csv = require("csv");
const inquirer = require("inquirer");
const fs = require("fs");
const async = require("async");
const nodemailer = require("nodemailer");

function validateEmail(email) {
  if (email.match(/\w+@\w+.com/)) return true;
  else console.log(chalk.red("\tvalue must be email"));
  return false;
}

let questions = [
  {
    type: "input",
    name: "sender.email",
    message: "Sender's email address - ",
    validate: validateEmail
  },
  {
    type: "input",
    name: "sender.name",
    message: "Sender's name - "
  },
  {
    type: "input",
    name: "subject",
    message: "Subject - "
  },
  {
    type: "password",
    name: "pass",
    message: "Enter the password"
  }
];

contactList = [];

commands
  .version("0.0.1")
  .option("-l, --list [list]", "list of customers in CSV file")
  .option("-h, --help [help]", "helps the options and commands")
  .parse(process.argv);

if (commands.list) {
  console.log(commands.list);
  if (
    fs.stat(commands.list, function(err) {
      console.log(err);
    })
  ) {
    let stream = fs
      .createReadStream(commands.list)
      .pipe(csv.parse({ delimiter: "," }));

    stream
      .on("error", function(err) {
        return console.error(err.response);
      })
      .on("data", function(data) {
        let name = data[0] + " " + data[1];
        let email = data[2];
        contactList.push({ name: name, email: email });
      })
      .on("end", function() {
        console.log(contactList);
        inquirer.prompt(questions).then(function(ans) {
          async.each(
            contactList,
            function(recipient, fn) {
              config = {
                service: "gmail",
                port: 465,
                secure: true,
                host: "smtp.gmail.com",
                auth: {
                  user: ans.sender,
                  pass: ans.pass
                }
              };
              mailOptions = {
                from: ans.sender,
                to: recipient.email,
                subject: ans.subject
              };
              console.log(ans);
              sendEmail(config, mailOptions);
            },
            function(err) {
              if (err) {
                return console.error(chalk.red(err.message));
              }
              console.log(chalk.green("Success"));
            }
          );
        });
      });
  }
} else if (commands.help) {
  console.log(
    `usage :\n\t-h ,--help :for help\n\t-l ,--list [input-file]:  embed the input file`
  );
} else {
  console.log("see --help");
}
function sendEmail(config, mailOptions) {
  var transporter = nodemailer.createTransport(config);
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("Login failed");
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
