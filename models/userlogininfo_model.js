const db = require("../dboperations");

exports.insertUserLoginInfo = async function (Id, UserId, DeviceId, RefreshToken, SessionExpiryTime, LastAccessTime) {
    console.log("Start-[userlogininfo-model]-inserUserLoginInfo()");
    var dbQuery = `INSERT INTO [user_log_info] ( Id, UserId, DeviceId, RefreshToken, SessionExpiryTime, LastAccessTime )
    VALUES ( '${Id}', '${UserId}', '${DeviceId}', '${RefreshToken}', '${SessionExpiryTime}', '${LastAccessTime}')`
    var result = await db.query(dbQuery);
    console.log("End-[userlogininfo-model]-inserUserLoginInfo()");
    return result.recordset;
};