const userService = require("../services/user_service");
const i18n = require("i18n");


exports.registerUser = async function (req, res, next) {
    console.log("Start-[user-controller]-registerUser");
    try {
        var user = await userService.registerUser(req.body);
        if (user.InvalidUser != undefined && user.InvalidUser) {
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
            return res.status(200).json({
                status: {
                    code: 200,
                    name: i18n.__('Success'),
                    message: i18n.__('Successfully_Registerd_User')
                },
                payload: user
            });
        }
    } catch (error) {
        console.log("Error-[user-controller]-registerUser" + error);
        return res.status(500).json({
            status: {
                code: 500,
                name: i18n.__('Error'),
                message: i18n.__('Error_Registering_User')
            },
            payload: null
        });
    }
};