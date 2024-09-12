const pool = require('./connection');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

const viewDepartments = async () => {
    const result = await pool.query('SELECT * FROM department');
    console.table(result.rows);
};

const viewRoles = async () => {
    const result = await pool.query(`
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
};

const viewEmployees = async () => {
    const result = await pool.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `);
    console.table(result.rows);
};

const addDepartment = async () => {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });

    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Department ${name} added.`);
};

const addRole = async () => {
    const departments = (await pool.query('SELECT * FROM department')).rows;
    const departmentChoices = departments.map(dept => ({ name: dept.name, value: dept.id }));

    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the role title:' },
        { type: 'input', name: 'salary', message: 'Enter the salary for the role:' },
        { type: 'list', name: 'departmentId', message: 'Select the department for this role:', choices: departmentChoices }
    ]);

    await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
    console.log(`Role ${title} added.`);
};

const addEmployee = async () => {
    const roles = (await pool.query('SELECT * FROM role')).rows;
    const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));

    const employees = (await pool.query('SELECT * FROM employee')).rows;
    const managerChoices = employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
    managerChoices.push({ name: 'None', value: null });

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter the employee’s first name:' },
        { type: 'input', name: 'lastName', message: 'Enter the employee’s last name:' },
        { type: 'list', name: 'roleId', message: 'Select the role for the employee:', choices: roleChoices },
        { type: 'list', name: 'managerId', message: 'Select the manager for the employee:', choices: managerChoices }
    ]);

    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);
    console.log(`Employee ${firstName} ${lastName} added.`);
};

const updateEmployeeRole = async () => {
    const employees = (await pool.query('SELECT * FROM employee')).rows;
    const employeeChoices = employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

    const roles = (await pool.query('SELECT * FROM role')).rows;
    const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));

    const { employeeId, roleId } = await inquirer.prompt([
        { type: 'list', name: 'employeeId', message: 'Select the employee to update:', choices: employeeChoices },
        { type: 'list', name: 'roleId', message: 'Select the new role for the employee:', choices: roleChoices }
    ]);

    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
    console.log(`Employee role updated.`);
};

module.exports = {
    viewDepartments,
    viewRoles,
    viewEmployees,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole
};

