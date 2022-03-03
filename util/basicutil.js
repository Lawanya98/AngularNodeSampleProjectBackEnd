var jwt = require('jsonwebtoken');
var config = require('config')

exports.replaceQuotes = function (text) {
    //replace single quotes and double quotes
    let singleQuoteRegex = /'/g;
    let doubleQuoteRegex = /"/g;
    return text.toString().replace(doubleQuoteRegex, '\"').replace(singleQuoteRegex, "''")
};

exports.generateJWT = async function (users) {
    var token = jwt.sign({
        data: {
            id: users[0].Id,
            name: users[0].Username,
            email: users[0].Email
        }
    }, config.get('privatekey'), {
        expiresIn: config.get('AppSessionTime')
    });
    return String(token);
};

exports.generateRandomNum = async function () {
    var randomNum = await Math.floor(100000 + Math.random() * 900000);
    return String(randomNum);
};