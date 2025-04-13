const { createAccessToken, createRefreshToken } = require('../JWT/HandlerJWT.js');
const { patientsCollection, relativesCollection } = require('../HandlerData/HandlerDataMongoDB.js');
const { isTokenBlacklisted, addTokenToBlacklist } = require('../JWT/BlackList.js');
const bcrypt = require('bcryptjs');

// This function handles the login request for patients
async function LoginHandler(req, res) {
    const { phoneNumber, password, userRole } = req.body;
    console.log("phoneNumber: ", phoneNumber);
    console.log("password: ", password);

    // Check the phone number and password are provided
    if (phoneNumber.length != 10 || password.length < 8 || password.length > 25) {
        return res.status(400).json({ message: 'Phone number and password are invalid' });
    }

    // Check the user exists in the database
    let User = null
    if (userRole == 1) {
        User = await patientsCollection.findOne({ phoneNumber: phoneNumber, password: password });
    }
    else {
        User = await relativesCollection.findOne({ phoneNumber: phoneNumber, password: password })
    }

    console.log("User: ", User);
    if (!User) {
        return res.status(404).json({ message: 'User not found' });
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

module.exports = { LoginHandler, getInforPatients };