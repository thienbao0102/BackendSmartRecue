const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../JWT/BlackList');
const { relativesCollection } = require('../HandlerData/HandlerDataMongoDB');

async function authMiddleware(req, res, next) {
    try {
        // 1. Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Không có token xác thực' });
        }

        // 2. Kiểm tra token trong blacklist
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Kiểm tra user tồn tại
        const user = await relativesCollection.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }

        // 5. Gán user vào request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ message: 'Xác thực thất bại' });
    }
}

module.exports = authMiddleware;