const inquirer = require("inquirer");
const mysql2 = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

// Creates a database connection
const db = mysql2.createConnection(
  process.env.JAWSDB_URL || {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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
  "View all employees by department"
];
let addOptions = ["Add a department", "Add a role", "Add employee"];
let updateOptions = ["Update an employee role", "Update an employee manager"];
let deleteOptions = [
  "Delete a department",
  "Delete a role",
  "Delete an employee",
];

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
            viewFunc(res);
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
            addFunc(res);
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
            if (res.userChoice === "Update an employee role") {
              updateRole()
            } else if (res.userChoice === "Update an employee manager") {
              updateManager()
            } else {
              init()
            }
          });
      } else if (res.userChoice === "Delete") {
        inquirer
          .prompt({
            type: "list",
            message: "What do you wish to delete?",
            choices: deleteOptions,
            name: "userChoice",
          })
          .then((res) => {
            if (res.userChoice === "Delete a department") {
              deleteDepartment()
            } else if (res.userChoice === "Delete a role") {
              deleteRole()
            } else if (res.userChoice === "Delete an employee") {
              deleteEmployee()
            } else {
              init()
            }
          });
      } else {
        console.log("Thanks for using the employee tracker!");
      }
    });
}

// ============================== View Option Functions ==============================
// Function to handle when the user selects a view option
function viewFunc(res) {
  if (res.userChoice === "View all departments") {
    // Returns all departments and IDs
    db.query("SELECT * FROM department", (err, data) => {
      if (err) throw err;
      console.table(data);
      init();
    });
  } else if (res.userChoice === "View all roles") {
    // Returns all roles with department associated with and IDs
    db.query(
      "SELECT roles.id, roles.title, roles.salary, department.department_name FROM roles, department WHERE department.id = roles.department_id ORDER BY roles.id ASC",
      (err, data) => {
        if (err) throw err;
        console.table(data);
        init();
      }
    );
  } else if (res.userChoice === "View all employees") {
    // Returns employee fist and last name, role title, and department name and displays in a table
    db.query(
      "SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.department_name FROM employee, roles, department WHERE department.id = roles.department_id AND roles.id = employee.role_id ORDER BY employee.id ASC",
      (err, data) => {
        if (err) throw err;
        console.table(data);
        init();
      }
    );
  } else if (res.userChoice === "View all employees by manager") {
    viewEmpByManager();
  } else if (res.userChoice === "View all employees by department") {
    viewEmpByDepartment();
  } else {
    init();
  }
}

// Gets all employees from a specific manager
function viewEmpByManager() {
  // Query to get all employees who do not have a manager
  db.query(
    "SELECT employee.id, employee.first_name ,employee.last_name FROM employee WHERE employee.manager_id IS NULL",
    (err, data) => {
      if (err) throw err;
      // Pushes each name of the employee to an array to prompt the user to see which manager they want to get the employees back for
      let mngrArry = [];
      data.forEach((element) =>
        mngrArry.push(`${element.first_name} ${element.last_name}`)
      );
      inquirer
        .prompt({
          type: "list",
          message: "Which manager do you want employees for?",
          choices: mngrArry,
          name: "manager",
        })
        .then((res) => {
          // Checks the selected manager against the data and sets the finds the selected managers id to make another query
          let managerId;

          data.forEach((element) => {
            if (res.manager === `${element.first_name} ${element.last_name}`) {
              managerId = element.id;
            }
          });

          // Gets all the employees based on the id that is passed to it
          db.query(
            "SELECT id, first_name, last_name FROM employee WHERE manager_id = ?",
            managerId,
            (err, data) => {
              if (err) throw err;
              console.table(data);
              init();
            }
          );
        });
    }
  );
}

// Gets all employees based on the users selected department
function viewEmpByDepartment() {
  // Gets all departments to prompt the user
  db.query("SELECT * FROM department", (err, data) => {
    if (err) throw err;
    // Uses the data to set up an array to prompt about the department the user wants to select
    let depArry = [];
    data.forEach((element) => depArry.push(`${element.department_name}`));
    inquirer
      .prompt({
        type: "list",
        message: "Which department do you want employees for?",
        choices: depArry,
        name: "department",
      })
      .then((res) => {
        // Gets the delected departments ID to make another query to the database with the number
        let depId;

        data.forEach((element) => {
          if (res.department === element.department_name) {
            depId = element.id;
          }
        });

        db.query(
          "SELECT id FROM roles WHERE department_id = ?",
          depId,
          (err, data) => {
            // Uses the id of every role associated with a department and uses a promise to get back the employees that work within that role
            // Returns an array to be displayed in a table
            let employees = new Promise((resolve, reject) => {
              let empArry = [];

              data.forEach((element, index) => {
                db.query(
                  "SELECT id, first_name, last_name FROM employee WHERE role_id = ?",
                  element.id,
                  (err, results) => {
                    results.forEach((element) =>
                      empArry.push({
                        id: element.id,
                        "First Name": element.first_name,
                        "Last Name": element.last_name,
                      })
                    );
                    if (index === data.length - 1) resolve(empArry);
                  }
                );
              });
            });

            employees.then((data) => {
              console.table(data);
              init();
            });
          }
        );
      });
  });
}

// ============================== Add Option Functions ==============================
// Function to handle when the user selects an option for the add
function addFunc(res) {
  if (res.userChoice === "Add a department") {
    addDepartment();
  } else if (res.userChoice === "Add a role") {
    addRole();
  } else if (res.userChoice === "Add employee") {
    addEmployee();
  } else {
    init();
  }
}

// Adds a department to the table
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "What is the name of the department?",
      name: "newDepartment",
    })
    .then((res) => {
      if (res.newDepartment) {
        db.query(
          "INSERT INTO department(department_name) VALUE (?)",
          res.newDepartment,
          (err, data) => {
            if (err) throw err;
            console.log("Successfully added a new department!");
            init();
          }
        );
      } else {
        console.log("Something went wrong please try again");
        init();
      }
    });
}

//Adds a role to the table
function addRole() {
  // Gets all departments to prompt the user
  db.query("SELECT * FROM department", (err, data) => {
    if (err) throw err;
    // Uses the data to set up an array to prompt about the department the user wants to select
    let depArry = [];
    data.forEach((element) => depArry.push(`${element.department_name}`));
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which department is the role for?",
          choices: depArry,
          name: "department",
        },
        {
          type: "input",
          message: "What is the name of the role?",
          name: "newRole",
        },
        {
          type: "input",
          message: "What is the salary of the role?",
          name: "roleSalary",
        },
      ])
      .then((res) => {
        // Uses the prompt to set up a new array and creates a query to intert into the roles table
        let depId;
        let newRole = [res.newRole, res.roleSalary];

        data.forEach((element) => {
          if (res.department === element.department_name) {
            depId = element.id;
            newRole.push(depId);
          }
        });

        db.query(
          "INSERT INTO roles(title, salary, department_id) VALUES (?, ?, ?)",
          newRole,
          (err, data) => {
            if (err) throw err;
            console.log("Successfully added a new role!");
            init();
          }
        );
      });
  });
}

// Adds an employee to the table
function addEmployee() {
  // Array to save data from different database queries
  let roleArry;
  let mngrArry;

  // Gets all roles and ids
  db.query("SELECT * FROM roles", (err, data) => {
    roleArry = data;
  });

  // Get all employees with no manager as they should be the managers
  db.query("SELECT * FROM employee WHERE manager_id IS NULL", (err, data) => {
    mngrArry = data;

    // Creates prompt arrays using the data from the previous queries
    let rolePrompt = [];
    let mngrPrompt = [];

    roleArry.forEach((element) => rolePrompt.push(element.title));
    mngrArry.forEach((element) =>
      mngrPrompt.push(`${element.first_name} ${element.last_name}`)
    );
    mngrPrompt.push("None");

    // Prompts the user for information of the new employee
    inquirer
      .prompt([
        {
          type: "list",
          message: "What is the employees role?",
          choices: rolePrompt,
          name: "role",
        },
        {
          type: "input",
          message: "What is the first name of the employee",
          name: "newFirst",
        },
        {
          type: "input",
          message: "What is the last name of the employee?",
          name: "newLast",
        },
        {
          type: "list",
          message: "Who is the employees manager?",
          choices: mngrPrompt,
          name: "manager",
        },
      ])
      .then((res) => {
        // Sets up variables to save the id
        let roleId;
        let mngrId;

        //Gets the id for the role that the user selected
        roleArry.forEach((element) => {
          if (element.title === res.role) {
            roleId = element.id;
          }
        });

        // Gets the id for the manager, if none was selected sets it equal to null
        mngrArry.forEach((element) => {
          if (res.manager === "None") {
            mngrId = null;
          } else if (
            res.manager === `${element.first_name} ${element.last_name}`
          ) {
            mngrId = element.id;
          }
        });

        // New employee to pass into the query
        let newEmployee = [res.newFirst, res.newLast, roleId, mngrId];

        // Adds an employee to the employee table in the database
        db.query(
          "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
          newEmployee,
          (err, data) => {
            if (err) throw err;
            console.log("Successfully add a new employee");
            init();
          }
        );
      });
  });
}

// ============================== Update Option Functions ==============================
// Updates and employees role
function updateRole() {
  // Gets all from the employee table and pushes the first name and last name of each employee to an array to be used to prompt the user
  db.query('SELECT * FROM employee', (err, data) => {
    if (err) throw err;

    let empArry = [];
    data.forEach(element => empArry.push(`${element.first_name} ${element.last_name}`))

    inquirer.prompt({
      type: "list",
      message: "Which employee would you like to delete?",
      choices: empArry,
      name: "employeeChoice"
    }).then(res => {
      // Sets empId equal to the ID of the users choice
      let empId;

      data.forEach(element => {
        if (res.employeeChoice === `${element.first_name} ${element.last_name}`) {
          empId = element.id
        }
      });

      // Gets all roles to see which role should be used to update 
      db.query('SELECT * FROM roles', (err, data) => {
        if (err) throw err;
    
        let roleArry = [];
        data.forEach(element => roleArry.push(`${element.title}`))
        inquirer.prompt({
          type: "list",
          message: "Which role should the employee have?",
          choices: roleArry,
          name: "roleChoice"
        }).then((res) => {
          // Compares the user selected role to the data, and sets the ID of the data equal to roleId 
          let roleId;
    
          data.forEach((element) => {
            if (res.roleChoice === element.title) {
              roleId = element.id;
            }
          });
    
          // Updates the role_id in the employee table where id is equal to user choice to the users role choice
          db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, empId], (err, data) => {
            if (err) throw err;
            console.log("Successfully updated  employees role!");
            init();
          })
        })
      })
    })
  })
};

// Updates the employees manager
function updateManager() {
  // Gets all employees from the table and pushes their name to an array to be used to prompt the user
  db.query('SELECT * FROM employee', (err, data) => {
    if (err) throw err;

    let empArry = [];
    data.forEach(element => empArry.push(`${element.first_name} ${element.last_name}`))

    inquirer.prompt({
      type: "list",
      message: "Which employee would you like to delete?",
      choices: empArry,
      name: "employeeChoice"
    }).then(res => {
      // Sets empId equal to the ID of the users choice
      let empId;

      data.forEach(element => {
        if (res.employeeChoice === `${element.first_name} ${element.last_name}`) {
          empId = element.id
        }
      });

      // Gets all managers to see which manager the employee should get
      db.query('SELECT * FROM employee WHERE manager_id IS NULL', (err, data) => {
        if (err) throw err;
    
        let mngrArry = [];
        data.forEach(element => mngrArry.push(`${element.first_name} ${element.last_name}`))
        inquirer.prompt({
          type: "list",
          message: "Which manager should this employee have?",
          choices: mngrArry,
          name: "managerChoice"
        }).then((res) => {
          // Compares the user selected manager to the data, and sets the ID of the data equal to mngrId 
          let mngrId;
    
          data.forEach((element) => {
            if (res.managerChoice === `${element.first_name} ${element.last_name}`) {
              mngrId = element.id;
            }
          });
    
          // Updates the manager_id in the employee table where id is equal to user choice to the users manager choice
          db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [mngrId, empId], (err, data) => {
            if (err) throw err;
            console.log("Successfully updated the employees manager!");
            init();
          })
        })
      })
    })
  })
}

// ============================== Delete Option Functions ==============================
// Deletes the users selected department
function deleteDepartment() {
  db.query("SELECT * FROM department", (err, data) => {
    if (err) throw err;
    // Uses the data to set up an array to prompt about the department the user wants to select
    let depArry = [];
    data.forEach((element) => depArry.push(`${element.department_name}`));
    inquirer
      .prompt({
        type: "list",
        message: "Which department do you want to delete?",
        choices: depArry,
        name: "department",
      })
      .then((res) => {
        // Uses the selected department and compares it to the names from the data array allowing us to get the id
        let depId;

        data.forEach((element) => {
          if (res.department === element.department_name) {
            depId = element.id;
          }
        });

        // Deleted the department where the ID matches the users ID 
        db.query("DELETE FROM department WHERE id = ?", depId, (err, data) => {
          if (err) throw err;
          console.log("Successfully deleted the department!");
          init();
        });
      });
  });
};

// Deletes a role from the database based on user selection
function deleteRole() {
  // Gets all the roles from the database puts the titles into and array to be used to prompt the user
  db.query('SELECT * FROM roles', (err, data) => {
    if (err) throw err;

    let roleArry = [];
    data.forEach(element => roleArry.push(`${element.title}`))
    inquirer.prompt({
      type: "list",
      message: "Which role would you like to delete?",
      choices: roleArry,
      name: "roleChoice"
    }).then((res) => {
      // Compares the user selected role to the data, and sets the ID of the data equal to roleId 
      let roleId;

      data.forEach((element) => {
        if (res.roleChoice === element.title) {
          roleId = element.id;
        }
      });

      // Deletes from role table where the ID is equal to the user choice
      db.query('DELETE FROM roles WHERE id = ?', roleId, (err, data) => {
        if (err) throw err;
        console.log("Successfully deleted the role!");
        init();
      })
    })
  })
}

// Deletes an employee from the database based on user selection
function deleteEmployee() {
  // Selects all from the employee table and puts the names into an array to prompt the user
  db.query('SELECT * FROM employee', (err, data) => {
    if (err) throw err;

    let empArry = [];
    data.forEach(element => empArry.push(`${element.first_name} ${element.last_name}`))

    inquirer.prompt({
      type: "list",
      message: "Which employee would you like to delete?",
      choices: empArry,
      name: "employeeChoice"
    }).then(res => {
      // Sets empId equal to the ID of the users choice
      let empId;

      data.forEach(element => {
        if (res.employeeChoice === `${element.first_name} ${element.last_name}`) {
          empId = element.id
        }
      });

      // Deletes from the employee table where the ID is equal to the employee choice
      db.query('DELETE FROM employee WHERE id = ?', empId, (err, data) => {
        if (err) throw err;
        console.log('Employee successfully deleted!');
        init();
      })
    })
  })
}

// Calls initializer functions
init();
