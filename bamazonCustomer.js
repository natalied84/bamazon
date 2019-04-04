var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: "localHost",
    user: "root",
    password: "root",
    port: 8889,
    database: "bamazon"
})

function bamazonStart() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`Product ID: ${res[i].item_id} || Product Name: ${res[i].product_name} || Department: ${res[i].dept_name} || Price (CAD): ${res[i].price} || ${res[i].stock_qty} left`)
        }
        inquirer.prompt([{
                name: "itemId",
                message: "What is the ID of the item you'd like to purchase?"
            },
            {
                name: "qty",
                message: "How many would you like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("Please enter a number");
                    return false;
                }
            }
        ]).then(function (iResp) {
            var itemExists = false;
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id === iResp.itemId) {
                    itemExists = true;
                }
            }
            if (itemExists === true) {
                connection.query("SELECT * FROM products WHERE item_id=?", [iResp.itemId], function (err, res) {
                    if (err) throw err;
                    if (iResp.qty > res[0].stock_qty) {
                        console.log("Insufficient quantity!")
                        bamazonStart()
                    } else {
                        var salePrice = parseFloat(res[0].price).toFixed(2) * iResp.qty
                        var newQty = parseInt(res[0].stock_qty) - parseInt(iResp.qty)
                        var query = `UPDATE products set ? WHERE item_id = ${iResp.itemId}`
                        var cost = iResp.qty * res[0].price
                        connection.query(query,
                            [{
                                stock_qty: newQty,
                                product_sales: salePrice
                            }])
                        console.log(`Total cost of your purchase: ${cost}`)
                        inquirer.prompt([{
                            type: "confirm",
                            message: "Would you like to make another purchase?",
                            name: "boolean",
                            default: true
                        }]).then(function (iResp) {

                            if (iResp.boolean) {
                                bamazonStart()
                            } else {
                                connection.end(function (err) {
                                    if (err) throw err;
                                })
                            }
                        })
                    }
                })
            } else {
                inquirer.prompt([{
                    name: "N/A",
                    message: "\nItem specified does not exist. Press enter to return to main menu.\n",
                }]).then(function (iResp) {
                    bamazonStart()
                })
            }
        })
    })
}

connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected: id ${connection.threadId}`)
    bamazonStart()
})