const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require('console.table');
require("dotenv").config();

// Helper functions
const viewFunc = require('./routes/view');
const addFunc = require('./routes/add');
const updateFunc = require('./routes/update');
const deleteFunc = require('./routes/delete');

// Creates a database connection
const db = mysql2.createConnection(
  process.env.JAWSDB_URL || {
    host: "localhost",
    user: "root",
    password: process.env.sqlPass,
    database: "employee_db",
  },
  console.log(`Connected to the employee database.`)
);

// All questions in an array to be used when prompting the user
let initialOptions = ["View", "Add", "Update", "Delete"];
let viewOptions = [
  "View all departments",
  "View all roles",
  "View all employees",
  "View all employees by manager",
  "View all employees by department",
  "View total salary of a department",
];
let addOptions = ["Add a department", "Add a role", "Add employee"];
let updateOptions = ["Update an employee role", "Update an employee manager"];
let deleteOptions = ["Delete a department", "Delete a role", "Delete an employee"];

// Initialize function to start prompting the user
function init() {
  inquirer
    .prompt({
      type: "list",
      message: "What do you wish to do?",
      choices: initialOptions,
      name: "userChoice",
    })
    .then((res) => {
      if (res.userChoice === "View") {
        inquirer
          .prompt({
            type: "list",
            message: "What do you wish to view?",
            choices: viewOptions,
            name: "userChoice",
          })
          .then((res) => {
            console.log(res);
          });
      } else if (res.userChoice === "Add") {
        inquirer
          .prompt({
            type: "list",
            message: "What do you wish to add?",
            choices: addOptions,
            name: "userChoice",
          })
          .then((res) => {
            console.log(res);
          });
      } else if (res.userChoice === "Update") {
        inquirer
          .prompt({
            type: "list",
            message: "What do you wish to update?",
            choices: updateOptions,
            name: "userChoice",
          })
          .then((res) => {
            console.log(res);
          });
      } else {
        inquirer
          .prompt({
            type: "list",
            message: "What do you wish to delete?",
            choices: deleteOptions,
            name: "userChoice",
          })
          .then((res) => {
            console.log(res);
          });
      }
    });
}

// Calls initializer functions
init();