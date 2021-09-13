const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require('console.table');
require("dotenv").config();

const db = mysql2.createConnection(
  {
    host: "localhost",
    user: "root",
    password: process.env.sqlPass,
    database: "employee_db",
  },
  console.log(`Connected to the employee database.`)
);

function viewDepartments() {
    db.query('SELECT * FROM department', (err, data) => {
        console.table(data)
    })
};

module.exports = {
    viewDepartments
}