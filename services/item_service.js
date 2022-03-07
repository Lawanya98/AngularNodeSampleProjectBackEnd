const itemModel = require("../models/item_model");

exports.getItems = async function () {
    console.log("Start-[item-service]-getItems()");
    const list = await itemModel.getItems();
    console.log("End-[item-service]-getItems()");
    return list;
}

exports.getItemById = async function (id) {
    console.log("Start-[item-service]-getItemByItem()");
    const item = await itemModel.getItemById(id);
    console.log("End-[item-service]-getItemByItem()");
    return item;
}

exports.addNewItem = async function (item) {
    console.log("Start-[item-service]-addNewItem()");
    const list = await itemModel.addNewItem(item);
    console.log("End-[item-service]-addNewItem()");
    return list;
}

exports.deleteItem = async function (id) {
    console.log("Start-[item-service]-deleteItem()");
    const result = await itemModel.deleteItem(id);
    console.log("End-[item-service]-deleteItem()");
    return result;
}

exports.updateItem = async function (item) {
    console.log("Start-[item-service]-updateItem()");
    const list = await itemModel.updateItem(item);
    console.log("End-[item-service]-updateItem()");
    return list;
}