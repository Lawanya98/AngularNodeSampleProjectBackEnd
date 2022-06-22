const { Router, response } = require('express');
const dboperations = require('./dboperations');
var Item = require('./item');
const sql = require('mssql');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
const i18n = require("i18n");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

app.use(cors()); //NOTE : if needed we have to configure to allow only certain urls later
i18n.configure({
    locales: ['en'],
    directory: __dirname + '/locales'
});

//set CORS headers 
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Cache-Control', 'private, max-age=0');
    // Pass to next layer of middleware
    next();
})

const auth = require("./middleware/auth");
const userController = require("./controllers/user_controller");
const itemController = require("./controllers/item_controller");
const { getUserById } = require('./models/user_model');

//user routes
router.route('/registerUser').post(userController.registerUser);
router.route('/authenticateUser').post(userController.authenticateUser);
router.route('/loginUser').post(userController.loginUser);
router.route('/updateOTP').post(userController.updateOTP);
router.route('/refreshToken').post(userController.refreshToken);

router.route('/requestPasswordReset').post(userController.requestPasswordReset);
router.route('/resetPassword').post(userController.resetPassword);
router.route('/validatePasswordResetLink/:reqId/:keyCode').get(userController.validatePasswordResetLink);
router.route('/checkPasswordAvailability/:password/:userId/:reqId').get(userController.checkPasswordAvailability);
//item routes
router.route('/getItems').get(itemController.getItems);
router.route('/getItemById/:id').get(auth, itemController.getItemById);
router.route('/deleteItem/').post(auth, itemController.deleteItem);
router.route('/updateItem/:id').post(auth, itemController.updateItem);
router.route('/insertItem').post(auth, itemController.addNewItem);





// setTimeout(() => {
const port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is running at ' + port);
// }, 3000)

//setTimeout added to connect to db before running API



// //CONNECT TO DATABASE AND RETRIEVE DATA

// // async function getItems() {
// //     dboperations.query("SELECT * from Items").then(result => {
// //         console.log(result);
// //     })
// // }


// // setTimeout(() => {
// //     getItems();
// // }, 3000)

// /////----------------------------------------------------------/////////



// router.use((request, response, next) => {
//     //middlewear for authentication,authorization
//     console.log('middlewear');
//     next();
// })


// router.route('/items').get((request, response) => {
//     dboperations.query("SELECT * from Items").then(result => {
//         console.log(result.recordset);
//         response.json(result.recordset);
//         return result.recordset;
//     })

// })

// router.route('/items/:id').get((request, response) => {
//     // dboperations.request().input('input_parameter', sql.Int, request.params.id).query("SELECT * from Items where ItemId =@input_parameter").then(result => {
//     //     // console.log(result);
//     //     response.json(result.recordset);
//     //     // output two recordsets
//     // })

//     dboperations.query(`SELECT * from Items where ItemId = ${request.params.id}`).then(result => {
//         response.json(result.recordset);
//     })

// })

// router.route('/items').post((request, response) => {
//     // let item = { ...request.body }
//     // dboperations.request()
//     //     .input('ItemId', sql.Int, item.ItemId)
//     //     .input('ItemName', sql.VarChar, item.ItemName)
//     //     .input('Qauntity', sql.Int, item.Qauntity)
//     //     .input('Price', sql.Int, item.Price)
//     //     .query(
//     //         `INSERT INTO Items
//     // (ItemId, ItemName, Qauntity,Price)
//     // VALUES
//     // (@ItemId,@ItemName,@Qauntity,@Price)`).then(result => {
//     //             console.log(result);
//     //             response.status(201).json(result.recordset);
//     //             // doesn't show the added record
//     //         })

//     const query = `INSERT INTO Items (ItemId, ItemName, Qauntity,Price) VALUES ('${request.body.ItemId}','${request.body.ItemName}','${request.body.Qauntity}','${request.body.Price}')`;
//     dboperations.query(query).then(result => {
//         console.log("inserted --> " + response);
//         // response.status(201).json(result.recordset);
//         return result;
//     })
// })

// //POST USING STORED PROCEDURE
// // router.route('/items').post((request, response) => {
// //     let item = { ...request.body }
// //     dboperations.request().input('ItemId', sql.Int, item.ItemId)
// //         .input('ItemName', sql.VarChar, item.ItemName)
// //         .input('Qauntity', sql.Int, item.Qauntity)
// //         .input('Price', sql.Int, item.Price)
// //         .execute("InsertItems").then(result => { //use stored procedure using execute
// //             console.log(result);
// //             response.status(201).json(result);
// //             // doesn't show the added record


// //         })

// // })


// router.route('/items/:id').delete((request, response) => {
//     // dboperations.request().input('ItemId', sql.Int, request.params.id).query("DELETE FROM Items WHERE ItemId = @ItemId ").then(result => {
//     //     // console.log(result);
//     //     response.json(result);
//     // })

//     dboperations.query(`DELETE FROM Items WHERE ItemId =${request.params.id}`).then(result => {
//         response.json(result);
//         return result;
//     })

// })

// //DELETE USING STORED PROCEDURE
// // router.route('/items/:id').delete((request, response) => {
// //     dboperations.request().input('input_parameter', sql.Int, request.params.id).execute("DeleteItem").then(result => {
// //         // console.log(result);
// //         response.json(result);
// //         // doesn't work in postman
// //     })

// // })


// router.route('/items/:id').put((request, response) => {
//     // let item = { ...request.body }
//     console.log(request.body);
//     // // dboperations.request().input('ItemId', sql.Int, request.params.id)
//     // //     .input('ItemName', sql.VarChar, item.ItemName)
//     // //     .input('Qauntity', sql.Int, item.Qauntity)
//     // //     .input('Price', sql.Int, item.Price)
//     // //     .query("UPDATE Items SET ItemName=@ItemName, Qauntity=@Qauntity, Price=@Price WHERE ItemId = @ItemId").then(result => {
//     // //         console.log(result);
//     // //         response.status(201).json(result.recordset);
//     // //         // doesn't show the added record


//     //     })
//     const query = `UPDATE Items SET ItemName='${request.body.ItemName}', Qauntity='${request.body.Qauntity}', Price='${request.body.Price}' WHERE ItemId = '${request.body.ItemId}'`
//     dboperations.query(query).then(result => {
//         console.log(result);
//         response.status(201).json(result.recordset);
//     })
// })

// //PUT USING STORED PROCEDURE
// // router.route('/items/:id').put((request, response) => {
// //     let item = { ...request.body }
// //     dboperations.request().input('ItemId', sql.Int, request.params.id)
// //         .input('ItemName', sql.VarChar, item.ItemName)
// //         .input('Qauntity', sql.Int, item.Qauntity)
// //         .input('Price', sql.Int, item.Price)
// //         .execute("UpdateItems").then(result => { //use stored procedure using execute
// //             console.log(result);
// //             response.status(201).json(result);
// //             // doesn't show the added record


// //         })

// // })






