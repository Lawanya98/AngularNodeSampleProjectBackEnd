const db = require("../dboperations");

exports.insertUserLoginInfo = async function (Id, UserId, DeviceId, RefreshToken, SessionExpiryTime, LastAccessTime) {
    console.log("Start-[userlogininfo-model]-inserUserLoginInfo()");
    var dbQuery = `INSERT INTO [user_log_info] ( Id, UserId, DeviceId, RefreshToken, SessionExpiryTime, LastAccessTime )
    VALUES ( '${Id}', '${UserId}', '${DeviceId}', '${RefreshToken}', '${SessionExpiryTime}', '${LastAccessTime}')`
    var result = await db.query(dbQuery);
    console.log("End-[userlogininfo-model]-inserUserLoginInfo()");
    return result.recordset;
};

exports.getUserLoginInfo = async function (userId, deviceId) {
    console.log("Start-[userlogininfo-model]-getUserLoginInfo()");
    console.log("getUserLoginInfo()---> " + userId, deviceId);
    var dbQuery = `SELECT TOP 1 * FROM [user_log_info] WHERE UserId= '${userId}' AND DeviceId=  '${deviceId}' ORDER BY LastAccessTime DESC`;
    var result = await db.query(dbQuery);
    console.log("End-[userlogininfo-model]-getUserLoginInfo()");
    return result.recordset;
};

exports.updateUserLoginInfo = async function (id, expiryTime, lastAccessTime) {
    console.log("Start-[userlogininfo-model]-updateUserLoginInfo()");
    console.log("updateUserLoginInfo()---> " + id, expiryTime, lastAccessTime);
    var dbQuery = `UPDATE [user_log_info] SET SessionExpiryTime= '${expiryTime}', LastAccessTime= '${lastAccessTime}' WHERE Id= '${id}'`;
    var result = await db.query(dbQuery);
    console.log("End-[userlogininfo-model]-updateUserLoginInfo()");
    return result.recordset;
};