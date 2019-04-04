var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
var connection = mysql.createConnection({
    host: "localHost",
    user: "root",
    password: "root",
    port: 8889,
    database: "bamazon"
})

function supervisorView() {
    inquirer.prompt([{
        type: "list",
        name: "cmd",
        message: "Hello supervisor person, what would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "Exit"]
    }]).then(function (iResp) {
        switch (iResp.cmd) {

            case "View Product Sales by Department":
                connection.query("SELECT departments.department_id, departments.department_name, 	departments.over_head_costs, SUM(products.product_sales) AS product_sales, SUM(products.product_sales)-departments.over_head_costs AS total_profit FROM departments LEFT JOIN products ON departments.department_name=products.dept_name GROUP BY departments.department_id", function (err, res) {
                    if (err) throw err;
                    var values = []
                    for (var i = 0; i < res.length; i++) {
                        var pSales = res[i].product_sales;
                        var profits = res[i].total_profit;
                        if (!pSales) {
                            pSales = 0;
                            profits = 0 - res[i].over_head_costs;
                        }
                        values.push([res[i].department_id, res[i].department_name,res[i].over_head_costs, pSales, profits])
                    }
                    console.table(["Department ID", "Department Name", "Overhead", "Sales","Profit"], values);
                    inquirer.prompt([{
                        name: "N/A",
                        message: "\nPress enter to return to main menu.\n",
                    }]).then(function (iResp) {
                        supervisorView();
                    })
                })
                break;

            case "Create New Department":
                inquirer.prompt([{
                        name: "name",
                        message: "What is the new department's name?"
                    },
                    {
                        name: "overhead",
                        message: "What is the department's overhead?"
                    }
                ]).then(function (iResp) {
                    connection.query("INSERT INTO departments SET ?", {
                        department_name: iResp.name,
                        over_head_costs: iResp.overhead
                    }, function (err, res) {
                        if (err) throw err;
                        inquirer.prompt([{
                            name: "N/A",
                            message: "\nDepartment added. Press enter to return to main menu.\n",
                        }]).then(function (iResp) {
                            supervisorView()
                        })
                    })
                })
                break;

            default:
                connection.end(function (err) {
                    if (err) throw err;
                });
        }
    });
}

connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected: id ${connection.threadId}`)
    supervisorView();
})