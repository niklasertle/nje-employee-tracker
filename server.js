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
        viewEmpByDepartment()
    } else if (res.userChoice === "View total salary of a department") {
        
    }
};

// Gets all employees from a specific manager
function viewEmpByManager() {
  // Query to get all employees who do not have a manager
    db.query("SELECT employee.id, employee.first_name ,employee.last_name FROM employee WHERE employee.manager_id IS NULL", (err, data) => {
        if (err) throw err
        // Pushes each name of the employee to an array to prompt the user to see which manager they want to get the employees back for
        let mngrArry = [];
        data.forEach(element => mngrArry.push(`${element.first_name} ${element.last_name}`))
        inquirer.prompt({
            type: "list",
            message: "Which manager do you want employees for?",
            choices: mngrArry,
            name: "manager"
        }).then((res) => {
            // Checks the selected manager against the data and sets the finds the selected managers id to make another query
            let managerId

            data.forEach(element => {
                if (res.manager === `${element.first_name} ${element.last_name}`) {
                    managerId = element.id
                }
            })

            // Gets all the employees based on the id that is passed to it
            db.query('SELECT * FROM employee WHERE manager_id = ?', managerId, (err, data) => {
                if (err) throw err
                console.table(data)
                init()
            })
        })
    })
};

// Gets all employees based on the users selected department
function viewEmpByDepartment() {
    // Gets all departments to prompt the user 
    db.query('SELECT * FROM department', (err, data) => {
        if (err) throw err
        // Uses the data to set up an array to prompt about the department the user wants to select
        let depArry = [];
        data.forEach(element => depArry.push(`${element.department_name}`))
        inquirer.prompt({
            type: "list",
            message: "Which department do you want employees for?",
            choices: depArry,
            name: "department"
        }).then(res => {
          // Gets the delected departments ID to make another query to the database with the number
            let depId;

            data.forEach(element => {
                if (res.department === element.department_name) {
                    depId = element.id
                }
            })

            db.query('SELECT id FROM roles WHERE department_id = ?', depId, (err, data) => {
              // Uses the id of every role associated with a department and uses a promise to get back the employees that work within that role
              // Returns an array to be displayed in a table
              let employees = new Promise((resolve, reject) => {
                let empArry = [];
            
                data.forEach((element, index) => {
                  db.query('SELECT id, first_name, last_name FROM employee WHERE role_id = ?', element.id, (err, results) => {
                    results.forEach(element => empArry.push({"id": element.id, "First Name": element.first_name, "Last Name": element.last_name}))
                    if (index === data.length -1) resolve(empArry);
                  })
                })
              })

              employees.then((data) => {
                console.table(data)
                init()
              })
            })
        })
    })
}

// Calls initializer functions
init();
