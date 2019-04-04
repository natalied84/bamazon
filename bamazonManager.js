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

function managerView() {
    inquirer.prompt([{
        type: "list",
        name: "cmd",
        message: "Hello bosslady (or bossman), what would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }]).then(function (iResp) {
        switch (iResp.cmd) {

            case "View Products for Sale":
                connection.query("SELECT * FROM products", function (err, res) {
                    if (err) throw err;
                    var values = [];
                    for (var i = 0; i < res.length; i++) {
                        values.push([res[i].item_id, res[i].product_name, res[i].dept_name, res[i].price,res[i].stock_qty])
                    }
                    console.table(["Product ID", "Product Name", "Department", "Price", "Qty Left"], values);
                    inquirer.prompt([{
                        name: "N/A",
                        message: "\nPress enter to return to main menu.\n",
                    }]).then(function (iResp) {
                        managerView();
                    })
                });
                break;

            case "View Low Inventory":
                connection.query("SELECT item_id, product_name, stock_qty FROM products WHERE stock_qty < 5", function (err, res) {
                    if (err) throw err;
                    var values = [];
                    for (var i = 0; i < res.length; i++) {
                        values.push([res[i].item_id, res[i].product_name, res[i].stock_qty]);
                    }
                    console.table(["Product ID", "Product Name", "Qty Left"], values);
                    inquirer.prompt([{
                        name: "N/A",
                        message: "\nPress enter to return to main menu.\n",
                    }]).then(function (iResp) {
                        managerView();
                    })
                })
                break;

            case "Add to Inventory":
                connection.query("SELECT item_id, product_name, stock_qty FROM products", function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        console.log(`Product ID: ${res[i].item_id} || Product Name: ${res[i].product_name} || ${res[i].stock_qty} left`);
                    }
                    console.log("-------------------\n");
                    inquirer.prompt([{
                            name: "item",
                            message: "What would you like to add stock to? (Item #)"
                        },
                        {
                            name: "qty",
                            message: "How many would you like to add?",
                            validate: function (value) {
                                if (isNaN(value) === false) {
                                    return true;
                                }
                                console.log("\nPlease enter a number");
                                return false;
                            }
                        }
                    ]).then(function (iResp) {
                        connection.query("SELECT item_id FROM products", function (err, res) {
                            if (err) throw err;
                            var itemExists = false;
                            for (var i = 0; i < res.length; i++) {
                                if (res[i].item_id === iResp.item) {
                                    itemExists = true;
                                }
                            }
                            if (itemExists === true) {
                                connection.query("SELECT item_id, stock_qty FROM products WHERE item_id=?", [iResp.item], function (err, res) {
                                    if (err) throw err;
                                    if (!res[0].item_id) {
                                        console.log("Specified item doesn't exist!");
                                        managerView();
                                    }
                                    var newCount = parseInt(res[0].stock_qty) + parseInt(iResp.qty)
                                    connection.query("UPDATE products SET ? WHERE ?", [{
                                        stock_qty: newCount
                                    }, {
                                        item_id: iResp.item
                                    }], function (err, res) {
                                        if (err) throw err;
                                        connection.query("SELECT item_id, stock_qty FROM products WHERE item_id=?", [`"${iResp.item}"`], function (err, res) {
                                            if (err) throw err;
                                            var values = [];
                                            for (var i = 0; i < res.length; i++) {
                                                values.push([res[i].item_id, res[i].product_name, res[i].stock_qty]);
                                            }
                                            console.table(["Product ID", "Product Name", "Qty Left"], values);
                                            inquirer.prompt([{
                                                name: "N/A",
                                                message: "\nPress enter to return to main menu.\n",
                                            }]).then(function (iResp) {
                                                managerView();
                                            })
                                        })
                                    })
                                })
                            } else {
                                inquirer.prompt([{
                                    name: "N/A",
                                    message: "\nItem specified does not exist. Press enter to return to main menu.\n",
                                }]).then(function (iResp) {
                                    managerView();
                                })
                            }
                        })

                    })
                })
                break;

            case "Add New Product":
                inquirer.prompt([{
                        name: "name",
                        message: "What product would you like to add?"
                    },
                    {
                        name: "dept",
                        message: "What department does it belong to?"
                    },
                    {
                        name: "price",
                        message: "What should the price be set at?",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            console.log("\nPlease enter a number");
                            return false;
                        }
                    },
                    {
                        name: "qty",
                        message: "How many do we have in stock?",
                        validate: function (value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            console.log("\nPlease enter a number");
                            return false;
                        }
                        
                    }
                ]).then(function (iResp) {
                    connection.query("INSERT INTO products SET ?", {
                        product_name: iResp.name,
                        dept_name: iResp.dept,
                        price: iResp.price,
                        stock_qty: iResp.qty
                    }, function (err, res) {
                        if (err) throw err;
                        console.log("\nProduct added.\n")
                        inquirer.prompt([{
                            name: "N/A",
                            message: "\nPress enter to return to main menu.\n",
                        }]).then(function (iResp) {
                            managerView();
                        })
                    })
                })
                break;

                case "Exit":
                connection.end(function (err) {
                    if (err) throw err;
                })
                break;

            default:
                console.log("How'd you even get here?");
        }
    })
}

connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected: id ${connection.threadId}`)
    managerView()
})