const empty = require('is-empty');
const jwt = require("jsonwebtoken");
const config = require("config");
const userModel = require("../models/user_model");
const userLoginInfoModel = require("../models/userlogininfo_model");
const basicutil = require("../util/basicutil");

module.exports = async function (req, res, next) {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    console.log("****token--------" + token);
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).json({
        status: {
            code: 401,
            name: "Unauthorized",
            message: "Unauthorized"
        },
        payload: null
    });

    try {
        const decodedToken = await jwt.verify(token, config.get("privatekey"))
        let userId = decodedToken.data.id
        console.log("****userId------------" + userId);
        const deviceIdEnc = req.headers['device-id'];
        const deviceId = await basicutil.decodeBase64(deviceIdEnc)
        const result = await userModel.getUserById(userId)
        console.log("****result---------" + result);
        if (empty(result)) {
            console.log("[auth] :: error : Invalid user id");
            res.status(440).json({
                status: {
                    code: 440,
                    name: "Error",
                    message: "Invalid token credential."
                },
                payload: null
            });
        } else {
            const loginInfoData = await userLoginInfoModel.getUserLoginInfo(userId, deviceId);
            console.log("****loginInfo--------" + loginInfoData);
            if (!empty(loginInfoData) && new Date(loginInfoData[0].SessionExpiryTime) > new Date()) {
                console.log("****next()-----------");
                next()
            } else {
                console.log("[auth] :: error : Session Expired");
                res.status(440).json({
                    status: {
                        code: 440,
                        name: "Error",
                        message: "Session Expired."
                    },
                    payload: null
                });
            }
        }
    } catch (ex) {
        console.log("[auth] :: error : " + ex.message);
        if (ex.message === 'jwt expired') {
            console.log("[auth] :: expiredAt : " + ex.expiredAt);
            res.status(440).json({
                status: {
                    code: 440,
                    name: "Error",
                    message: "jwt expired"
                },
                payload: null
            });
        } else {
            res.status(440).json({
                status: {
                    code: 440,
                    name: "Error",
                    message: "Invalid token."
                },
                payload: null
            });

        }
    }
}