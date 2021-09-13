const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require('console.table');
require("dotenv").config();

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
let initialOptions = ["View", "Add", "Update", "Delete", "Cancel"];
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
            viewCalls(res)
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
      } else if (res.userChoice === 'Delete'){
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
      } else {
          console.log("Thanks for using the employee tracker!");
      }
    });
};

// Function to handle when the user selects a view option
function viewCalls(res) {
    if (res.userChoice === "View all departments") {
        db.query('SELECT * FROM department', (err, data) => {
            if (err) throw err
            console.table(data)
            init()
        })
    } else if (res.userChoice === "View all roles") {
        //TODO: RETURN dapartments instead of id#
        db.query('SELECT * FROM roles', (err, data) => {
            if (err) throw err
            console.table(data)
            init()
        })
    } else if (res.userChoice === "View all employees") {
        //TODO: RETURN names for roles and managers instead of a id#
        db.query('SELECT * FROM employee', (err, data) => {
            console.table(data)
        })
    } else if (res.userChoice === "View all employees by manager") {
        
    } else if (res.userChoice === "View all employees by department") {
        
    } else if (res.userChoice === "View total salary of a department") {
        
    }

};

// Calls initializer functions
init();