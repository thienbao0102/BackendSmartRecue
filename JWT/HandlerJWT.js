const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isTokenBlacklisted } = require('./BlackList');

const SECRET_ACCESS = 'mysecretaccess@thienbao/.24%0102';
const SECRET_REFRESH = 'mysecretrefresh@thienbao/.24%0102';
const EXPIRES_IN_ACCESS = '30s';
const EXPIRES_IN_REFRESH = '30d';

const createAccessToken = (phoneNumber, password) => {
    return jwt.sign({ phone:phoneNumber , password: password }, SECRET_ACCESS, { expiresIn: EXPIRES_IN_ACCESS });
}

const createRefreshToken = (phoneNumber, password) => {
    return jwt.sign({ phone:phoneNumber , password: password }, SECRET_REFRESH, { expiresIn: EXPIRES_IN_REFRESH });
}

//xin cấp lại access token mới
const refreshAccessToken = (refreshToken, res) => {
    if (!refreshToken || !isTokenBlacklisted(refreshToken)) {
        return res.status(403).json({ message: "Refresh token không hợp lệ" });
    }
    console.log("refreshAccessToken - refreshToken: ", refreshToken);
    try {
        const payload = jwt.verify(refreshToken, SECRET_REFRESH);
        const accessToken = jwt.sign({ phone: payload.phoneNumber, password: payload.password }, SECRET_ACCESS, {
            expiresIn: EXPIRES_IN_ACCESS,
        });
        console.log("refreshAccessToken - accessToken: ", accessToken);
        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: "Refresh token hết hạn" });
    }
}

function authenticate(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log("authenticate - token: ", token);
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_ACCESS, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = {createAccessToken, createRefreshToken, refreshAccessToken, authenticate};