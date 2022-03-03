const db = require("../dboperations");
var bcrypt = require('bcryptjs');
const userModel = require("../models/user_model");
const moment = require('moment')

exports.registerUser = async function (user) {
    console.log("Start-[user-service]-registerUser");
    const usernameAvailable = await this.checkUsernameAvailability(user.userName)
    const emailAvailable = await this.checkEmailAvailability(user.email)
    console.log(usernameAvailable);
    console.log(emailAvailable);
    if (usernameAvailable[0].usernameAvailable == 1 && emailAvailable[0].emailAvailable == 1) {
        // Password encription.
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(vendor.password, salt);
        // Calculate password expiry time.
        let passwordExpiryTime = config.get('PasswordExpiryTime').replace("d", "");
        let currentTime = moment();
        let expiryTime = moment(currentTime).add(passwordExpiryTime, 'days');

        user.password = hash;
        user.passwordExpiryTime = expiryTime.utc().format('YYYY-MM-DD HH:mm');

        const userId = await userModel.saveUser(user);
        console.log("End-[user-service]-registerUser");
        return userId;
    } else {
        return {
            InvalidUser: true,
            usernameAvailable: usernameAvailable[0].usernameAvailable,
            emailAvailable: emailAvailable[0].emailAvailable,
            taxIdAvailable: taxIdAvailable[0].taxIdAvailable
        }
    }
}

exports.checkUserNameAvailability = async function (name) {
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