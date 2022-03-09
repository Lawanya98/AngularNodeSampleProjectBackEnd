const db = require("../dboperations");

exports.insertPasswordRequest = async function (id, userId, expiryTime, keyCode) {
    console.log("Start-[user_pw_reset-model]-insertPasswordRequest()")
    var dbQuery = `INSERT INTO [user_reset_password] ( Id, UserId, ResetExpiryTime, KeyCode, RequestIp, IsActivated )
    VALUES ('${id}', '${userId}', '${expiryTime}', '${keyCode}', '', '0');`
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-insertPasswordRequest()")
    return result.recordset;
};

exports.getPWResetData = async function (reqId, keyCode, deviceIp) {
    console.log("Start-[user_pw_reset-model]-getPWResetData()")
    var dbQuery = `SELECT * FROM [user_reset_password] WHERE Id= '${reqId}' AND KeyCode= '${keyCode}' AND RequestIp= '${deviceIp}' AND IsActivated = '0'`;
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-getPWResetData()")
    return result.recordset;
};

exports.getPWResetDataByReqId = async function (reqId, keyCode) {
    console.log("Start-[user_pw_reset-model]-getPWResetDataByReqId()")
    var dbQuery = `SELECT * FROM [user_reset_password] WHERE Id= '${reqId}' AND KeyCode= '${keyCode}' AND IsActivated = '0'`;
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-getPWResetDataByReqId()")
    return result.recordset;
};

exports.updateIsActivated = async function (reqId) {
    console.log("Start-[user_pw_reset-model]-updateIsActivated()")
    var dbQuery = `UPDATE [user_reset_password] SET IsActivated= '1' WHERE Id= '${reqId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-updateIsActivated()")
    return result.recordset;
};

exports.getUserIdByRequestId = async function (reqId) {
    console.log("Start-[user_pw_reset-model]-getUserIdByRequestId()")
    var dbQuery = `SELECT * FROM [user_reset_password] WHERE Id= '${reqId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-getUserIdByRequestId()")
    return result.recordset;
};

exports.updateResetPasswordByUserId = async function (userId) {
    console.log("Start-[user_pw_reset-model]-updateResetPasswordByUserId()")
    var dbQuery = `UPDATE [user_reset_password] SET [IsActivated] = '1' WHERE UserId = '${userId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[user_pw_reset-model]-updateResetPasswordByUserId()")
    return result.recordset;
}