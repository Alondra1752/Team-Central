const inquirer = require('inquirer');
const pool = require('./db');

async function viewDepartments() {
  const result = await pool.query('SELECT * FROM departments');
  console.table(result.rows);
}

async function viewRoles() {
  const result = await pool.query('SELECT * FROM roles');
  console.table(result.rows);
}

async function viewEmployees() {
  const result = await pool.query('SELECT * FROM employees');
  console.table(result.rows);
}

async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the department name:',
  });

  await pool.query('INSERT INTO departments (name) VALUES ($1)', [name]);
  console.log('Department added.');
}

async function addRole() {
  const departments = await pool.query('SELECT * FROM departments');
  const departmentChoices = departments.rows.map(dept => ({
    name: dept.name,
    value: dept.id,
  }));

  const { title, salary, department_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the role title:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department:',
      choices: departmentChoices,
    },
  ]);

  await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log('Role added.');
}

async function addEmployee() {
  const roles = await pool.query('SELECT * FROM roles');
  const roleChoices = roles.rows.map(role => ({
    name: role.title,
    value: role.id,
  }));

  const managers = await pool.query('SELECT * FROM employees');
  const managerChoices = managers.rows.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the first name:',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the last name:',
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the role:',
      choices: roleChoices,
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the manager (or leave blank if none):',
      choices: [...managerChoices, { name: 'None', value: null }],
    },
  ]);

  await pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
  console.log('Employee added.');
}

async function main() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View Departments',
      'View Roles',
      'View Employees',
      'Add Department',
      'Add Role',
      'Add Employee',
      'Exit'
    ],
  });

  switch (action) {
    case 'View Departments':
      await viewDepartments();
      break;
    case 'View Roles':
      await viewRoles();
      break;
    case 'View Employees':
      await viewEmployees();
      break;
    case 'Add Department':
      await addDepartment();
      break;
    case 'Add Role':
      await addRole();
      break;
    case 'Add Employee':
      await addEmployee();
      break;
    case 'Exit':
      process.exit();
  }

  await main(); // Loop back to main menu
}

main();
