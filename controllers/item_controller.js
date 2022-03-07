const itemService = require("../services/item_service");
const i18n = require("i18n");

exports.getItems = async function (req, res, next) {
    console.log("Start-[item-controller]-getItems");
    try {
        var items = await itemService.getItems();
        console.log("End-[item-controller]-getItems");
        return res.status(200).json({
            status: {
                code: 200,
            },
            payload: items
        });
    } catch (error) {
        console.log("[item-controller]-getItems::error" + error);
        return res.status(500).json({
            status: {
                code: 500,
            },
            payload: null
        });
    }
}

exports.getItemById = async function (req, res, next) {
    console.log("Start-[item-controller]-getItemById()");
    try {
        var item = await itemService.getItemById(req.params.id);
        console.log("End-[item-controller]-getItemById()");
        return res.status(200).json({
            status: {
                code: 200,
            },
            payload: item
        });
    } catch (error) {
        console.log("[item-controller]-getItemById()::error" + error);
        return res.status(500).json({
            status: {
                code: 500,
            },
            payload: null
        });
    }
}


exports.addNewItem = async function (req, res, next) {
    console.log("Start-[item-controller]-addNewItem()");
    try {
        var res = await itemService.addNewItem(req.body);
        console.log("End-[item-controller]-addNewItem()");
        return res.status(200).json({
            status: {
                code: 200,
            },
            payload: res
        });
    } catch (error) {
        console.log("[item-controller]-addNewItem()::error" + error);
        return res.status(500).json({
            status: {
                code: 500,
            },
            payload: null
        });
    }
}


exports.deleteItem = async function (req, res, next) {
    console.log("Start-[item-controller]-deleteItem()");
    try {
        var item = await itemService.deleteItem(req.body.id);
        console.log('controll result::::' + item);
        console.log("End-[item-controller]-deleteItem()");
        return res.status(200).json({
            status: {
                code: 200,
            },
            payload: item
        });
    } catch (error) {
        console.log("[item-controller]-deleteItem()::error" + error);
        return res.status(500).json({
            status: {
                code: 500,
            },
            payload: null
        });
    }
}

exports.updateItem = async function (req, res, next) {
    console.log("Start-[item-controller]-updateItem()");
    try {
        var item = await itemService.updateItem(req.body);
        console.log("End-[item-controller]-updateItem()");
        return res.status(200).json({
            status: {
                code: 200,
            },
            payload: item
        });
    } catch (error) {
        console.log("[item-controller]-updateItem()::error" + error);
        return res.status(500).json({
            status: {
                code: 500,
            },
            payload: null
        });
    }
}