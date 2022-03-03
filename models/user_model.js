const db = require("../dboperations");
const { v1: uuidv1 } = require('uuid');
const sql = require("mssql");
const async = require("async");

exports.saveUser = async function (user) {
    console.log("Start-[user-model]-saveUser");
    console.log(user);
    var Id = uuidv1();
    var dbQuery = `INSERT INTO [users] (Id, Username, Email, Password, Phone, PasswordExpiryTime)
    VALUES ( '${Id}','${user.Username}', '${user.Email}','${user.Password}','${user.Phone}','${user.PasswordExpiryTime}')`;
    var result = await db.query(dbQuery);
    console.log("End-[user-model]-saveUser");
    return Id, result;
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