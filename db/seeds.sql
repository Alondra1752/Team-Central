-- Insert initial departments
INSERT INTO department (name) VALUES ('Engineering'), ('Sales'), ('Marketing');

-- Insert initial roles
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Sales Manager', 90000, 2),
('Marketing Coordinator', 60000, 3);

-- Insert initial employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Alice', 'Smith', 1, NULL),
('Bob', 'Jones', 2, 1),
('Charlie', 'Brown', 3, 1);
