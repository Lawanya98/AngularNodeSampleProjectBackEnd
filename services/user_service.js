const db = require("../dboperations");
var bcrypt = require('bcryptjs');
const userModel = require("../models/user_model");
const UserLoginInfoModel = require("../models/userlogininfo_model");
const moment = require('moment');
var config = require('config');
const basicutil = require("../util/basicutil");
var empty = require('is-empty');
const { v1: uuidv1 } = require('uuid');

exports.registerUser = async function (user) {
    console.log("Start-[user-service]-registerUser");
    console.log(user);
    const usernameAvailable = await this.checkUsernameAvailability(user.Username)
    const emailAvailable = await this.checkEmailAvailability(user.Email)
    console.log("16" + usernameAvailable[0].usernameAvailable);
    console.log("17" + emailAvailable[0].emailAvailable);
    if (usernameAvailable[0].usernameAvailable == 1 && emailAvailable[0].emailAvailable == 1) {
        // Password encription.
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(user.Password, salt);
        console.log("22-hash" + hash);
        // Calculate password expiry time.
        let PasswordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
        let currentTime = moment();
        let expiryTime = moment(currentTime).add(PasswordExpiryTime, 'days');

        user.Password = hash;
        user.PasswordExpiryTime = expiryTime.utc().format('YYYY-MM-DD HH:mm');
        console.log("29-user" + user);

        const userId = await userModel.saveUser(user);
        console.log("End-[user-service]-registerUser");
        console.log(userId);
        return userId;
    } else {
        console.log("came&&&&&&&&&&&");
        return {
            InvalidUser: true,
            usernameAvailable: usernameAvailable[0].usernameAvailable,
            emailAvailable: emailAvailable[0].emailAvailable
        }
    }
}

exports.checkUsernameAvailability = async function (name) {
    console.log("Start-[user-service]-checkUserNameAvailability");
    const usernameAvailable = await userModel.checkUserNameAvailability(name)
    console.log("End-[user-service]-checkUserNameAvailability");
    return usernameAvailable;
};

exports.checkEmailAvailability = async function (email) {
    console.log("Start-[user-service]-checkEmailAvailability");
    const emailAvailable = await userModel.checkEmailAvailability(email)
    console.log("End-[user-service]-checkEmailAvailability");
    return emailAvailable;
}

exports.loginUser = async function (Username, Password, deviceId) {
    console.log("Start-[user-service]-loginUser");
    console.log(Username);
    console.log(Password);
    console.log(deviceId);
    const users = await userModel.loginUser(Username);
    if (!empty(users)) {
        if (users[0].Password !== null) {
            const isSamePwd = await bcrypt.compare(Password, users[0].Password);
            if (isSamePwd) {
                if (new Date(users[0].PasswordExpiryTime) > new Date()) {
                    //generate the token and send
                    const token = await basicutil.generateJWT(users);
                    const refreshToken = await basicutil.generateRandomNum();
                    var Id = uuidv1()
                    //generate session expiry time
                    let sessionTime = config.get('AppSessionTime')
                    let sessionExpiryTime = sessionTime.replace("h", "");
                    const expiryDate = moment().add(sessionExpiryTime, 'hours');
                    let currentDate = moment();
                    console.log('currentDate' + currentDate);
                    let lastAccessTime = currentDate.utc().format('YYYY-MM-DD HH:mm');
                    console.log('lastAccessTime' + lastAccessTime);
                    const insertUserLoginData = await UserLoginInfoModel.insertUserLoginInfo(Id, users[0].Id,
                        deviceId, refreshToken, expiryDate.utc().format('YYYY-MM-DD HH:mm'), lastAccessTime);
                    console.log("user-service-inseretedloggingdata" + insertUserLoginData);
                    console.log("End-[user-service]-loginUser");
                    return {
                        message: "Success",
                        user: users,
                        token: token,
                        refreshToken: refreshToken
                    }
                } else {
                    return {
                        message: "Password is expired",
                        user: users
                    }
                }
            } else {
                // throw new Error('Invalid User');
                return {
                    message: "Invalid User",
                    user: users
                }
            }
        }
    } else {
        //user does not exists
        // throw new Error('Invalid user');
        return {
            message: "Invalid User",
            user: users
        }
    }
}

exports.refreshToken = async function (userIdEncoded, deviceIdEncoded, refreshToken) {
    console.log("Start-[user-service]-refreshToken()");
    const deviceId = await basicutil.decodeBase64(deviceIdEncoded);
    const userId = await basicutil.decodeBase64(userIdEncoded);
    const logInfo = await UserLoginInfoModel.getUserLoginInfo(userId, deviceId);
    if (!empty(logInfo)) {
        const refreshTok = logInfo[0].refreshToken;
        const user = await userModel.getUserById(userId);
        if (refreshToken === refreshTok) {
            let lastAccessTime = moment(loginInfo[0].LastAccessTime, 'YYYY-MM-DD HH:mm');
            let currentTime = moment(new Date(), 'YYYY-MM-DD HH:mm');
            var duration = moment.duration(currentTime.diff(lastAccessTime));
            var hoursDiff = duration.asHours();
            let sessionInactiveTime = config.get('SessionIdlePeriod').replace("h", "");
            console.log("[user-service]-refreshToken(): sessioninactivetime --> " + sessionInactiveTime);
            console.log("[user-service]-refreshToken(): hoursdiff --> " + hoursDiff);
            if ((sessionInactiveTime > hoursDiff)) {
                let sessionExpiryTime = config.get('AppSessionTime').replace("h", "");
                let currentDate = moment();
                const expiryDate = moment().add(sessionExpiryTime, 'hours');
                let lastAccessTime = currentDate.utc().format('YYYY-MM-DD HH:mm');
                await userLoginInfoModel.updateUserLoginInfo(loginInfo[0].Id, expiryDate.utc().format('YYYY-MM-DD HH:mm'), lastAccessTime);
                const token = await basicutil.generateJWT(user);
                console.log("End-[user-service]-refreshToken()");
                return {
                    token: token
                }
            } else {
                throw new Error('Session Expired');
            }
        }
    } else {
        throw new Error('Invalid Token');
    }
}

exports.getUserById = async function (id) {
    console.log("Start-[user-service]-getUserById()");
    const user = await userModel.getUserById(id)
    console.log("End-[user-service]-getUserById()");
    return user;
}