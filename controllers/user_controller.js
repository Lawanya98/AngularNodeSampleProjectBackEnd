const userService = require("../services/user_service");
const i18n = require("i18n");



exports.registerUser = async function (req, res, next) {
    console.log("Start-[user-controller]-registerUser");
    try {
        console.log(req.body);
        var user = await userService.registerUser(req.body);
        if (user.InvalidUser != undefined && user.InvalidUser) {
            console.log("Invalid User");
            return res.status(500).json({
                status: {
                    code: 500,
                    // name: i18n.__('Error'),
                    // message: i18n.__('Error_Registering_User')
                },
                payload: user
            });
        } else {
            console.log("End-[user-controller]-registerUser");
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
