const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require('console.table');
require("dotenv").config();

const db = mysql2.createConnection(
  process.env.JAWSDB_URL || {
    host: "localhost",
    user: "root",
    password: process.env.sqlPass,
    database: "employee_db",
  },
  console.log(`Connected to the employee database.`)
);