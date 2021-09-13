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


// ============================== View Option Functions ==============================
// Function to handle when the user selects a view option
function viewCalls(res) {
    if (res.userChoice === "View all departments") {
        // Returns all departments and IDs
        db.query('SELECT * FROM department', (err, data) => {
            if (err) throw err
            console.table(data)
            init()
        })
    } else if (res.userChoice === "View all roles") {
        // Returns all roles with department associated with and IDs
        //TODO: RETURN dapartments instead of id#
        db.query('SELECT roles.id, roles.title, roles.salary, department.department_name FROM roles, department WHERE department.id = roles.department_id ORDER BY roles.id ASC', (err, data) => {
            if (err) throw err
            console.table(data)
            init()
        })
    } else if (res.userChoice === "View all employees") {
        // Returns employee fist and last name, role title, and department name and displays in a table
        db.query('SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.department_name FROM employee, roles, department WHERE department.id = roles.department_id AND roles.id = employee.role_id ORDER BY employee.id ASC', (err, data) => {
            if (err) throw err
            console.table(data)
            init()
        })
    } else if (res.userChoice === "View all employees by manager") {
        viewEmpByManager()
    } else if (res.userChoice === "View all employees by department") {
        
    } else if (res.userChoice === "View total salary of a department") {
        
    }
};

// Gets all employees from a specific manager
function viewEmpByManager() {
    db.query("SELECT employee.id, employee.first_name ,employee.last_name FROM employee WHERE employee.manager_id IS NULL", (err, data) => {
        if (err) throw err
        let mngrArry = [];
        data.forEach(element => mngrArry.push(`${element.first_name} ${element.last_name}`))
        inquirer.prompt({
            type: "list",
            message: "Which manager do you want employees for?",
            choices: mngrArry,
            name: "manager"
        }).then((res) => {
            let managerId

            data.forEach(element => {
                if (res.manager === `${element.first_name} ${element.last_name}`) {
                    managerId = element.id
                }
            })

            db.query('SELECT * FROM employee WHERE manager_id = ?', managerId, (err, data) => {
                if (err) throw err
                console.table(data)
                init()
            })
        })
    })
}

// Calls initializer functions
init();