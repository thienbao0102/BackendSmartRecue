const { createAccessToken, createRefreshToken } = require('../JWT/HandlerJWT.js');
const { patientsCollection, relativesCollection } = require('../HandlerData/HandlerDataMongoDB.js');
const { isTokenBlacklisted, addTokenToBlacklist } = require('../JWT/BlackList.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// This function handles the login request for patients
async function LoginHandler(req, res) {
    const { phoneNumber, password, userRole } = req.body;
    console.log("phoneNumber: ", phoneNumber);
    console.log("password: ", password);
    console.log("userRole from client: ", userRole);

    // Check the phone number and password are provided
    if (phoneNumber.length != 10 || password.length < 8 || password.length > 25) {
        return res.status(400).json({ message: 'Phone number and password are invalid' });
    }

    // Check the user exists in the database
    let User = null
    if (userRole == 0) {
        User = await patientsCollection.findOne({ phoneNumber: phoneNumber });
    } else {
        User = await relativesCollection.findOne({ phoneNumber: phoneNumber });
    }

    console.log("User: ", User);
    if (!User) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, User.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    //create access token and refresh token
    const accessToken = createAccessToken(User);
    const refreshToken = createRefreshToken(User);

    return res.status(200).json({ message: 'Login successful', user: User, accessToken: accessToken, refreshToken: refreshToken });
}

async function getInforPatients(req, res) {
    const listPatientId = req.body.listPatientId;
    console.log("listPatientId: ", listPatientId);

    let listPatients = [];

    listPatients = await patientsCollection.find({ _id: { $in: listPatientId } },
        {
            projection: { _id: 1, name: 1, age: 1, phoneNumber: 1, diseaseDescription: 1 }
        }).toArray();

    console.log("listPatients: ", listPatients);

    return res.status(200).json({ message: 'Get list patients successful', listPatients: listPatients });
};

// Xử lý đăng ký tài khoản mới
async function RegisterHandler(req, res) {
    const { fullName, phoneNumber, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullName || !phoneNumber || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }

    if (password.length < 8 || password.length > 25) {
        return res.status(400).json({ message: 'Mật khẩu phải từ 8 đến 25 ký tự' });
    }

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingUser = await relativesCollection.findOne({ phoneNumber: phoneNumber });
    if (existingUser) {
        return res.status(409).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);
     // Tạo ID dạng string
    const userId = uuidv4();

    const newUser = {
        _id: userId, // Gán ID dạng string
        fullName: fullName,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        nowLocation: null,
        roadHistory: [],
        userRole: 1,
        createdAt: new Date()
    };

    // Thêm người dùng vào cơ sở dữ liệu
    await relativesCollection.insertOne(newUser);

    return res.status(201).json({ 
        message: 'Đăng ký thành công', 
        user: { 
            _id: userId,
            fullName, 
            phoneNumber ,
            userRole: 1,
        } 
    });
}

module.exports = { LoginHandler, getInforPatients, RegisterHandler };
