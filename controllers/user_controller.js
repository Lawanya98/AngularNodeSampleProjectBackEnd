const userService = require("../services/user_service");
const i18n = require("i18n");



exports.registerUser = async function (req, res, next) {
    console.log("Start-[user-controller]-registerUser");
    try {
        console.log(req.body);
        var user = await userService.registerUser(req.body);
        if (user.InvalidUser) {
            console.log("Invalid User");
            return res.status(500).json({
                status: {
                    code: 500,
                    name: i18n.__('Error'),
                    message: i18n.__('Error_Registering_User')
                },
                payload: user
            });
        } else {
            console.log("End-[user-controller]-registerUser");
            console.log("controller user -" + user);
            return res.status(200).json({
                status: {
                    code: 200,
                    // name: i18n.__('Success'),
                    // message: i18n.__('Successfully_Registerd_User')
                },
                payload: user
            });
        }
    } catch (error) {
        console.log("Error-[user-controller]-registerUser" + error);
        return res.status(500).json({
            status: {
                code: 500,
                // name: i18n.__('Error'),
                // message: i18n.__('Error_Registering_User')
            },
            payload: null
        });
    }
};

exports.loginUser = async function (req, res, next) {
    console.log("Start-[user-controller]-loginUser");
    try {
        const userData = req.body
        console.log(userData);
        const result = await userService.loginUser(userData.Username, userData.Password, userData.DeviceId);
        console.log("Start-[user-controller]-loginUser");
        return res.status(200).json({
            status: {
                code: 200,
                // name: i18n.__('Success'),
                // message: i18n.__('Successfully_Authenticated_The_User')
            },
            payload: result
        });
    } catch (error) {
        console.log("ERROR-[user-controller]-loginUser: error : " + error);
        if (error.message === 'Invalid User') {
            res.status(401).json({
                status: {
                    code: 401,
                    // name: i18n.__('Unauthorized'),
                    // message: i18n.__('Unauthorized')
                },
                payload: null
            });
        } else {
            return res.status(500).json({
                status: {
                    code: 500,
                    // name: i18n.__('Internal_Server_Error'),
                    // message: i18n.__('Internal_Server_Error')
                },
                payload: null
            });
        }

    }
};


exports.refreshToken = async function (req, res) {
    console.log("Start-[user-controller]-refreshToken()");
    try {
        const userData = req.body;
        const refreshToken = userData.refreshToken;
        const userId = req.headers['user-id'];
        const deviceId = req.headers['device-id'];

        try {
            //try to verify the auth token. //it should give the jwt expired message
            const token = req.headers["x-access-token"] || req.headers["authorization"];
            const decodedToken = await jwt.verify(token, config.get("privatekey"));
            //it shouldnt come here, as it should go to the catch with jwt expired
        } catch (ex) {
            //if invalid token
            console.log("[user-controller]-refreshToken():::ex" + ex.message);
            if (ex.message == "jwt expired") {
                //that means the authtoken is valid
                //so can continue with refresh token to send a new token          
                const result = await userService.refreshToken(userId, deviceId, refreshToken);
                console.log("[user-controller]-refreshToken():::result" + result);
                return res.status(200).json({
                    status: {
                        code: 200,
                        // name: i18n.__('Success'),
                        // message: i18n.__('Successfully_Refreshed_Token')
                    },
                    payload: result
                });
            } else {
                //shouldn't continue
            }
        }
        console.log("[user-controller]-refreshToken():ERROR");
        return res.status(500).json({
            status: {
                code: 500,
                // name: i18n.__('Error'),
                // message: i18n.__('Error_Refreshing_Token')
            },
            payload: null
        });

    } catch (error) {
        console.log("[user-controller]-refreshToken():ERROR" + error);
        return res.status(500).json({
            status: {
                code: 500,
                // name: i18n.__('Error'),
                // message: i18n.__('Error_Refreshing_Token')
            },
            payload: null
        });
    }
};

exports.requestPasswordReset = async function (req, res) {
    try {
        console.log("Start-[user-controller]-requestPasswordReset()");

        const requestPasswordResetData = req.body;
        console.log("[user-controller]-requestPasswordReset():148-::" + requestPasswordResetData);

        const result = await userService.requestPasswordReset(requestPasswordResetData.UserName, requestPasswordResetData.Email, false);
        console.log("[user-controller]-requestPasswordReset():151-::" + result);
        console.log("End-[user-controller]-requestPasswordReset()");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Send_Request_For_Password_Reset')
            },
            payload: result
        });
    } catch (error) {
        console.log("[user-controller]-requestPasswordReset(): error : " + error);
        if (error.message == 'Account not verified') {
            return res.status(401).json({
                status: {
                    code: 401,
                    name: i18n.__('Error'),
                    message: i18n.__('Account_Not_Verified')
                },
                payload: null
            });
        } else {
            return res.status(500).json({
                status: {
                    code: 500,
                    name: i18n.__('Error'),
                    message: i18n.__('Error_Sending_Request_For_Password_Reset')
                },
                payload: null
            });
        }
    }
}

exports.resetPassword = async function (req, res) {
    console.log("Start-[user-controller]-requestPasswordReset()");

    try {
        const passwordResetData = req.body;
        console.log("[user-controller]-requestPasswordReset(): 190-::passwordResetData : ---->" + passwordResetData)
        console.log("191-:::" + passwordResetData.ReqId);
        const result = await userService.resetPassword(passwordResetData.ReqId, passwordResetData.KeyCode,
            passwordResetData.UserId, passwordResetData.NewPassword, passwordResetData.ConfirmPassword)

        console.log("[user-controller]-requestPasswordReset(): result : ---->" + result);
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Reset_Password')
            },
            payload: result
        });
    } catch (error) {
        console.log("[user-controller]-requestPasswordReset(): error::205-: ---->" + error);
        if (error.message === 'Link not valid') {
            console.log("[user-controller]-requestPasswordReset()::207-: Link not valid");
            return res.status(403).json({
                status: {
                    code: 403,
                    name: i18n.__('Link_not_valid'),
                    message: i18n.__('Link_not_valid')
                },
                payload: null
            });
        } else {
            console.log("[user-controller]-requestPasswordReset()::217-: Error_Reseting_Password");
            return res.status(500).json({
                status: {
                    code: 500,
                    name: i18n.__('Error'),
                    message: i18n.__('Error_Reseting_Password')
                },
                payload: null
            });
        }
    }
}

exports.validatePasswordResetLink = async function (req, res) {
    console.log("Start-[user-controller]-validatePasswordResetLink()");
    console.log("[user-controller]-validatePasswordResetLink(): req ::" + req);
    try {
        var reqId = req.params.reqId;
        var keyCode = req.params.keyCode
        const result = await userService.validatePasswordResetLink(reqId, keyCode)
        console.log("[user-controller]-validatePasswordResetLink(): result ::" + result);
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Reset_Password')
            },
            payload: result
        });
    } catch (error) {
        console.log("[user-controller]-validatePasswordResetLink(): error ::247-:" + error);
        if (error.message === 'Link not valid') {
            console.log("[user-controller]-validatePasswordResetLink():::249-:Link_not_valid");
            return res.status(403).json({
                status: {
                    code: 403,
                    name: i18n.__('Link_not_valid'),
                    message: i18n.__('Link_not_valid')
                },
                payload: null
            });
        } else {
            console.log("[user-controller]-validatePasswordResetLink():::259-:Error_Reseting_Password");
            return res.status(500).json({
                status: {
                    code: 500,
                    name: i18n.__('Error'),
                    message: i18n.__('Error_Reseting_Password')
                },
                payload: null
            });
        }
    }
}

exports.checkPasswordAvailability = async function (req, res, next) {
    console.log("Start-[user-controller]-checkPasswordAvailability()");
    try {
        var password = req.params.password;
        var userId = req.params.userId
        var reqId = req.params.reqId
        var passwordExists = await userService.checkPasswordAvailability(password, userId, reqId);
        console.log("End-[user-controller]-checkPasswordAvailability()");
        return res.status(200).json({
            status: {
                code: 200,
                name: i18n.__('Success'),
                message: i18n.__('Successfully_Validated_Input')
            },
            payload: passwordExists
        });
    } catch (error) {
        console.log("[user-controller]-checkPasswordAvailability():::ERROR:" + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Validating_Input')
            },
            payload: null
        });
    }
};