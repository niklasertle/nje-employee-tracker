INSERT INTO department (department_name)
VALUES
('Sales'),
('Service'),
('Parts'),
('Human Resoures'),
('Finance');

INSERT INTO roles (title, salary, department_id)
VALUES
('Sales Manager', 120000, 1),
('Service Manager', 120000, 2),
('Parts Manager', 90000, 3),
('HR Manager', 120000, 4),
('Finance Manager', 120000, 5),
('Salesman', 100000, 1),
('Service Advisor', 80000, 2),
('Technician', 75000, 2),
('Sales Porter', 25000, 1),
('Service Porter', 25000, 2),
('Parts Advisor', 50000, 3),
('Training', 60000, 4),
('Safety', 80000, 4),
('Financer', 60000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Enid', 'Arnold', 1, null),
('Rosalind', 'Mora', 2, null),
('Nathanial', 'Todd', 3, null),
('Jeremy', 'Nelson', 4, null),
('Sian', 'Lake', 5, null),
('Wiktor', 'Rigby', 6, 1),
('Kairo', 'Barber', 6, 1),
('Conna', 'Herring', 7, 2),
('Haiden', 'Archer', 7, 2),
('Trystan', 'Wynn', 8, 2),
('Aadil', 'Skinner', 8, 2),
('Janelle', 'Farrow', 9, 1),
('Penny', 'Montes', 10, 2),
('Charlene', 'Redman', 11, 3),
('Shola', 'McNally', 12, 4),
('Ivor', 'Person', 13, 4),
('Emme', 'Huang', 14, 5),
('Kelise', 'Piper', 14, 5);