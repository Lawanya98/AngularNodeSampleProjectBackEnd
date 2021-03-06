const db = require("../dboperations");
const { v1: uuidv1 } = require('uuid');
const sql = require("mssql");
const async = require("async");
const basicutil = require("../util/basicutil");

exports.saveUser = async function (user) {
    console.log("Start-[user-model]-saveUser");
    console.log(user);
    var Id = uuidv1();
    var dbQuery = `INSERT INTO [users] (Id, Username, Email, Password, Phone, PasswordExpiryTime, isAuthenticated, OTPCode)
    VALUES ( '${Id}','${user.Username}', '${user.Email}','${user.Password}','${user.Phone}','${user.PasswordExpiryTime}','0', '${user.OTPCode}')`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-saveUser");
    console.log("return -->" + Id);
    return Id;
}

exports.authenticateUser = async function (userId) {
    console.log("Start-[user-model]-authenticateUser");
    var dbQuery = `UPDATE [users] SET isAuthenticated = '1' WHERE Id= '${userId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-authenticateUser");
    return result.recordset;
}

exports.updateOTP = async function (userId, newOTP) {
    console.log("Start-[user-model]-updateOTP()");
    var dbQuery = `UPDATE [users] SET OTPCode = '${newOTP}' WHERE Id= '${userId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-updateOTP()");
    return result.recordset;
}

exports.checkUserNameAvailability = async function (name) {
    console.log("Start-[user-model]-checkUserNameAvailability");
    var dbQuery = 'SELECT "usernameAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [users] WHERE UserName= \'' + name + '\') AS y) AS x'
    var result = await db.query(dbQuery, [name]);
    console.log("End-[user-model]-checkUserNameAvailability");
    return result.recordset;
}

exports.checkEmailAvailability = async function (email) {
    console.log("Start-[user-model]-checkEmailAvailability");
    var dbQuery = 'SELECT "emailAvailable" = CASE WHEN NumberofUsers = 0 THEN 1 ELSE 0 END FROM ( SELECT COUNT(Id) AS NumberofUsers FROM (SELECT [Id] FROM [users] WHERE Email= \'' + email + '\') AS y) AS x';
    var result = await db.query(dbQuery, [email]);
    console.log("End-[user-model]-checkEmailAvailability");
    return result.recordset;
}

exports.loginUser = async function (Username) {
    console.log("Start-[user-model]-loginUser()");
    console.log("mOdel-->" + Username);
    var dbQuery = `SELECT * FROM [users] WHERE Username= '${Username}'`;
    var result = await db.query(dbQuery);
    console.log("mOdel-->" + result);
    console.log("End-[user-model]-loginUser()");
    return result.recordset;
};

//Get user by their Id
exports.getUserById = async function (id) {
    console.log("Start-[user-model]-getUserById()");
    console.log("getUser id>>>>>" + id)
    var dbQuery = `SELECT * FROM [users] WHERE Id= '${id}'`;
    console.log(dbQuery);
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-getUserById()");
    console.log("getUser RESULT.RECORDSET>>>>>" + result);
    return result.recordset;
}

exports.getUserByEmail = async function (userName, email) {
    console.log("Start-[user-model]-getUserByEmail()");
    var dbQuery = `SELECT * FROM [users] WHERE Username= '${userName}' AND Email= '${email}'`;
    var result = await db.query(dbQuery);
    console.log("Start-[user-model]-getUserByEmail()");
    return result.recordset;
}

exports.getUserByName = async function (userName) {
    console.log("Start-[user-model]-getUserByName()");
    var dbQuery = `SELECT * FROM [users] WHERE Username= '${userName}' `;
    var result = await db.query(dbQuery);
    console.log("Start-[user-model]-getUserByName()");
    return result.recordset;
}

exports.resetPassword = async function (userId, newPwd, expiryTime) {
    console.log("Start-[user-model]-resetPassword()");
    var dbQuery = `UPDATE [users] SET Password= '${newPwd}', PasswordExpiryTime= '${expiryTime}' WHERE Id= '${userId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-resetPassword()");
    return result.recordset;
}

exports.saveUserOldPassword = async function (userId, currentTime, password) {
    console.log("Start-[user-model]-saveUserOldPassword()");
    var Id = uuidv1()
    var dbQuery = `INSERT INTO [user_old_password] ([Id], [UserId], [PasswordTime], [password])
    VALUES ('${Id}', '${userId}', '${currentTime}', '${password}')`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-saveUserOldPassword()");
    return result.recordset;
}

exports.checkPasswordAvailability = async function (userId, count) {
    console.log("Start-[user-model]-checkPasswordAvailability()");
    var dbQuery = `SELECT TOP (${count}) password FROM [user_old_password] WHERE UserId = '${userId}' ORDER BY PasswordTime DESC`
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-checkPasswordAvailability()");
    return result.recordset;
}