const db = require("../dboperations");
var bcrypt = require('bcryptjs');
const userModel = require("../models/user_model");
const UserLoginInfoModel = require("../models/userlogininfo_model");
const UserPwRestModel = require("../models/user_pw_reset_model");
const moment = require('moment');
var config = require('config');
const basicutil = require("../util/basicutil");
var empty = require('is-empty');
const { v1: uuidv1 } = require('uuid');
const mailUtil = require("../util/mailutil");
const speakeasy = require('speakeasy');
const { TokenExpiredError } = require("jsonwebtoken");
const accountSid = 'AC4a685acb8cd78f28d337238fc411eeee';
const authToken = '3f148bc95e3aa7f0bb3f7c87de372195';
const client = require('twilio')(accountSid, authToken);

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

        const temp_secret = speakeasy.generateSecret({
            step: 100
        });

        //----------------------save temp_secret as it is -----------------------------------
        // user.OTPCode = temp_secret;
        // console.log("OTPPPPPPPPPPPPPPPPPP---->" + user.OTPCode);

        //----------------------save only base32 -----------------------------------
        user.OTPCode = temp_secret.base32;
        console.log("OTPPPPPPPPPPPPPPPPPP---->" + user.OTPCode);


        var token = speakeasy.totp({
            secret: user.OTPCode,
            encoding: 'base32',
            // time : Date.new(),  default is current time.
            // epoch : 0,  default is 0. It is the offset from UNIX epoch.
            // step is used, with time as time + step, to invalidate the token.
            // step: 100
        });
        console.log("OTPPPPPPPPPPPPPPPPPP---->" + token);

        const userId = await userModel.saveUser(user);

        client.messages
            .create({
                body: token,
                from: '+18329667745',
                to: '+94714617570'
            })
            .then(message => console.log(message.sid));

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

exports.authenticateUser = async function (data) {
    console.log("Start-[user-service]-authenticateUser");
    const user = await userModel.getUserByName(data.Username);
    //compare passed value with original otp
    console.log("84--->" + user);
    if (!empty(user)) {
        const userId = user[0].Id;
        const OTPCode = user[0].OTPCode;
        const token = data.OTP;
        console.log("89--->" + token);
        console.log("90--->" + OTPCode);
        const verified = speakeasy.totp.verify({
            secret: OTPCode,
            encoding: 'base32',
            token: token,
            window: 1
        });


        // const { base32: secret } = user[0].OTPCode;
        // console.log("99--->" + secret);
        // const verified = speakeasy.totp.verify({
        //     secret,
        //     encoding: 'base32',
        //     token
        // });

        console.log(verified);
        if (verified) {
            const result = await userModel.authenticateUser(userId);
            console.log("End-[user-service]-authenticateUser");
            return true;
        } else {
            throw new Error('Invalid OTP');
        }

    } else {
        throw new Error('Invalid Username');
    }
}

exports.loginUser = async function (Username, Password, deviceId) {
    console.log("Start-[user-service]-loginUser");
    console.log(Username);
    console.log(Password);
    console.log(deviceId);
    const users = await userModel.loginUser(Username);
    if (!empty(users)) {
        if (users[0].isAuthenticated == '1') {
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
            return {
                message: "OTP is not verified",
                user: users
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

exports.updateOTP = async function (data) {
    console.log("Start-[user-service]-newOTP()");
    console.log(data);
    const user = await userModel.getUserByName(data.Username);
    console.log("194--->" + user);
    if (!empty(user)) {
        const userId = user[0].Id;
        const temp_secret = speakeasy.generateSecret({
            step: 100
        });
        const newOTP = temp_secret.base32;
        var token = speakeasy.totp({
            secret: newOTP,
            encoding: 'base32',
        });
        client.messages
            .create({
                body: token,
                from: '+18329667745',
                to: '+94714617570'
            })
            .then(message => console.log(message.sid));
        const result = await userModel.updateOTP(userId, newOTP);


        console.log("End-[user-service]-newOTP()");
        return true;
    } else {
        //no need because username is already validated in login once
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


exports.requestPasswordReset = async function (userNameEnc, emailEnc, status) {
    console.log("Start-[user-service]-requestPasswordReset()");
    console.log("[user-service]-requestPasswordReset()::::emailENC-----" + emailEnc);
    console.log("[user-service]-requestPasswordReset()::::userNameEnc-----" + userNameEnc);

    let email;
    let userName;
    if (status) {
        email = emailEnc;
        userName = userNameEnc;
    } else {
        email = await basicutil.decodeBase64(emailEnc);
        userName = await basicutil.decodeBase64(userNameEnc)
    }
    console.log("[user-service]-requestPasswordReset()::::email, username-----" + email, userName);
    const user = await userModel.getUserByEmail(userName, email); //capture user email by using user id
    let requestId = uuidv1();
    if (!empty(user)) {
        const updateResetPassword = await UserPwRestModel.updateResetPasswordByUserId(user[0].Id)
        //if user exists by email, send a pwd reset link
        let currentTime = moment();
        let passwordLinkValidTime = config.get('PasswordLinkValidPeriod').replace("h", "");
        const expiryTime = moment(currentTime).add(passwordLinkValidTime, 'hours').utc().format('YYYY-MM-DD HH:mm')
        const keyCode = await basicutil.generateRandomNum();
        await UserPwRestModel.insertPasswordRequest(requestId, user[0].Id, expiryTime, keyCode);

        //send the mail
        let sendUrl = "http://localhost:4200/resetpassword?reqId=" + requestId + "&keyCode=" + keyCode;
        console.log("[user-service]-requestPasswordReset()::190-::sendURL-----" + sendUrl)

        const mailOptions = {
            //from: "", // Sender address
            to: email, // List of recipients
            subject: "Password Reset Request - Sample Project", // Subject line
        };
        console.log("[user-service]-requestPasswordReset()::197-::mailOptions-----" + mailOptions.to);
        let htmlText = "<p>Dear User,Please use the link below within 24 hours</p>" + "<a href='" + sendUrl + "' target='_blank'>Reset password</a>"

        mailOptions.html = htmlText;

        const mailSent = await mailUtil.sendMail(mailOptions);
        console.log("[user-service]-requestPasswordReset()::203-: mailsent : " + mailSent);
        if (mailSent) {
            return true;
        } else {
            console.log("Email sending failed")
            throw new Error('Email sending failed');
        }
    } else {
        // user doesn't exist
        console.log("Account not verified")
        throw new Error('Account not verified');
    }
}


exports.resetPassword = async function (reqId, keyCode, reqUserId, newPassword, confirmPassword) {
    console.log("Start-[user-service]-resetPassword()");
    console.log("221:::::reUserId" + reqUserId);
    //we don't need to veryfy link when password is expired 
    let userId
    if (empty(reqUserId)) {
        const getUserId = await UserPwRestModel.getUserIdByRequestId(reqId)
        userId = getUserId[0].UserId
    } else {
        userId = reqUserId
    }

    const user = await userModel.getUserById(userId);
    if (newPassword == confirmPassword) {
        if (!empty(reqId) && !empty(keyCode)) {
            //validate the request here again, before resetting the password
            const isValidRequest = await this.validatePasswordResetLink(reqId, keyCode);
            if (isValidRequest) {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(newPassword, salt);
                let passwordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
                let currentTime = moment();
                const expiryTime = moment(currentTime).add(passwordExpiryTime, 'days').utc().format('YYYY-MM-DD HH:mm')
                await userModel.resetPassword(userId, hash, expiryTime); //reset password in user table	
                await UserPwRestModel.updateIsActivated(reqId); // update user_reset_password table
                await userModel.saveUserOldPassword(userId,
                    currentTime.utc().format('YYYY-MM-DD HH:mm'), hash) // update old pw
                return true;
            } else {
                //if the requestid and key code are not correct or request expired
                console.log("[user_service] :: resetPassword()::251-:Invalid Request")
                throw new Error('Invalid Request');
            }
        } else {


        }
    } else {
        console.log("[user_service] :: resetPassword()::267-:Invalid Request")
        throw new Error('Invalid Request');
    }
}

exports.validatePasswordResetLink = async function (reqId, keyCode) {
    console.log("Start-[user-service]-validatePasswordResetLink()");
    const result = await UserPwRestModel.getPWResetDataByReqId(reqId, keyCode);
    if (!empty(result)) {
        if (new Date(result[0].ResetExpiryTime) > new Date()) {
            //if a request exists for that key code with the request id and  if it is not expired
            return true;
        } else {
            console.log("[user_service] :: validatePasswordResetLink()::280-:Link not validate")
            throw new Error('Link not valid');
        }
    } else {
        console.log("[user_service] :: validatePasswordResetLink()::284-:Link not validate")
        throw new Error('Link not valid');
    }
}

exports.checkPasswordAvailability = async function (passwordEnc, reqUserId, reqId) {
    console.log("Start-[user-service]-checkPasswordAvailability()");
    let password = await basicutil.decodeBase64(passwordEnc);
    let userId
    if (reqUserId == 'undefined') {
        console.log("UNDDDDDDDDDDDDDDDDDDDDDDD");
        const getUserId = await UserPwRestModel.getUserIdByRequestId(reqId)
        userId = getUserId[0].UserId
        console.log("UNDDDDDDDDDDDDDDDDDDDDDDD" + userId);
    } else {
        userId = reqUserId
    }
    const user = await userModel.getUserById(userId);
    console.log("UNDDDDDDDDDDDDDDDDDDDDDDD" + user);

    let count = config.get('OldPaswordCount')
    const getPassword = await userModel.checkPasswordAvailability(userId, count)
    console.log("UNDDDDDDDDDDDDDDDDDDDDDDD" + getPassword.length);
    let userPasswordArray = [];
    for (let i = 0; i < getPassword.length; i++) {
        const isSamePwd = await bcrypt.compare(password, getPassword[i].password);

        if (isSamePwd) {
            userPasswordArray.push(getPassword[i].password)
        }
    }
    console.log("End-[user-service]-checkPasswordAvailability()");
    return {
        count: userPasswordArray.length,
        user: user
    };
}
