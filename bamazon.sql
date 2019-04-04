DROP DATABASE if EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
	item_id INT(4) ZEROFILL NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(70) NOT NULL,
	dept_name VARCHAR(50), 
	price DECIMAL(12,2) NOT NULL,
	stock_qty INT NOT NULL,
	product_sales INT DEFAULT 0,
	PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, dept_name, price, stock_qty)
VALUES ("Banana (single)", "Produce", 0.79, 500), 
("Bananas (bunch)", "Produce", 2.99, 100),
("Small Moon Comprised of Solely Bananas", "Produce", 799999999.98, 5),  
("Hammer (non-Thor's)", "Hardware/Tools", 15, 14),
("Tape Measure", "Hardware/Tools", 8, 37), 
("Mjolnir", "Magical Weapons", 14999999.99, 1),
("Morgul-blade", "Magical Weapons", 12000, 2), 
("Nintendsoft Swatch", "Video Games", 299.99, 7),
("Sory Playbox 4", "Video Games", 299.99, 16),
("Microware X-Station", "Video Games", 399.99, 6),
("Broken 3DO", "Video Games", 68.37, 1);


CREATE TABLE departments (
	department_id INT(2) ZEROFILL NOT NULL AUTO_INCREMENT,
	department_name VARCHAR(70) NOT NULL,
	over_head_costs INT,
	PRIMARY KEY(department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Produce", 17000000), ("Hardware/Tools", 1240), ("Magical Weapons", 72000), ("Video Games", 630);

SELECT * FROM products;
SELECT * FROM departments;
SELECT departments.department_id, 
	departments.department_name, 
	departments.over_head_costs, 
	SUM(products.product_sales) AS product_sales, 
	SUM(products.product_sales)-departments.over_head_costs AS total_profit 
	FROM departments LEFT JOIN products 
	ON departments.department_name=products.dept_name GROUP BY departments.department_id; 
