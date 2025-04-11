const {blackListCollection} = require('../HandlerData/HandlerDataMongoDB.js');
//kiểm tra xem token có nằm trong danh sách đen hay không
async function isTokenBlacklisted(token) {
    return await blackListCollection.findOne({ token });
}

//thêm token vào danh sách đen
async function addTokenToBlacklist( token, expiresAt) {
    await blackListCollection.insertOne({
        token,
        expiresAt,
    });

    // Đảm bảo MongoDB tự xoá token sau khi hết hạn
    await blackListCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

module.exports = {isTokenBlacklisted, addTokenToBlacklist};