var config = require('./dbconfig');
const mssql = require('mssql');

var connection = new mssql.ConnectionPool(config);
console.log(config);

connection.connect(function (err, next) {
    if (err) {
        console.log("dboperation error" + err);
    } else {
        console.log("connected to the database");

    }
});



module.exports = connection;




// async function getItems() {
//     try {
//         let pool = await sql.connect(config);
//         let items = await pool.request().query("SELECT * from Items");
//         return items.recordsets;
//     }
//     catch (error) {
//         console.log(error);
//     }
// }

// module.exports = {
//     getItems: getItems
// }