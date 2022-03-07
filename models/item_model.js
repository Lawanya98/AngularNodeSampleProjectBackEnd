const db = require("../dboperations");

exports.getItems = async function () {
    console.log("Start-[item-model]-getItems()");
    var dbQuery = "SELECT * from Items";
    var result = await db.query(dbQuery);
    console.log("End-[item-model]-getItems()" + result.recordset);
    return result.recordset;
}

exports.getItemById = async function (id) {
    console.log("Start-[item-model]-getItemById()");
    var dbQuery = `SELECT * from Items where ItemId = ${id}`;
    var result = await db.query(dbQuery);
    console.log("End-[item-model]-getItemById()");
    return result.recordset;
}

exports.addNewItem = async function (item) {
    console.log("Start-[item-model]-addNewItem()");
    var dbQuery = `INSERT INTO Items (ItemId, ItemName, Qauntity,Price) VALUES ('${item.ItemId}','${item.ItemName}','${item.Qauntity}','${item.Price}')`;
    var result = await db.query(dbQuery);
    console.log("End-[item-model]-addNewItem()");
    return result.recordset;
}

exports.deleteItem = async function (id) {
    console.log("Start-[item-model]-deleteItem()");
    var dbQuery = `DELETE FROM Items WHERE ItemId =${id}`;
    var result = await db.query(dbQuery);
    console.log("End-[item-model]-deleteItem()");
    return true;
}

exports.updateItem = async function (item) {
    console.log("Start-[item-model]-updateItem()");
    var dbQuery = `UPDATE Items SET ItemName='${item.ItemName}', Qauntity='${item.Qauntity}', Price='${item.Price}' WHERE ItemId = '${item.ItemId}'`;
    var result = await db.query(dbQuery);
    console.log("End-[item-model]-updateItem()");
    return result.recordset;
}