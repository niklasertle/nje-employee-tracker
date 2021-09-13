const express = require('express');
const inquirer = require('inquirer');
const mysql2 = require('mysql2');
const ct = require('console.table');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql2.createConnection(
    process.env.JAWSDB_URL || 
    {
        host: 'localhost', 
        user: 'root', 
        password: process.env.sqlPass, 
        database: 'employee_db'
    },
    console.log(`Connected to the employee database.`)
);