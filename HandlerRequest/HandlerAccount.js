const { createAccessToken, createRefreshToken } = require('../JWT/HandlerJWT.js');
const { patientsCollection } = require('../HandlerData/HandlerDataMongoDB.js');
const { isTokenBlacklisted, addTokenToBlacklist } = require('../JWT/BlackList.js');
const bcrypt = require('bcryptjs');

// create a array to store the relative clients
const relativeClients = [];

// This function handles the login request for patients
async function LoginHandler(req, res) {
    const { phoneNumber, password } = req.body;
    console.log("phoneNumber: ", phoneNumber);
    console.log("password: ", password);

    // Check the phone number and password are provided
    if (phoneNumber.length != 10 || password.length < 8 || password.length > 25) {
        return res.status(400).json({ message: 'Phone number and password are invalid' });
    }

    // Check the user exists in the database
    const patientUser = await patientsCollection.findOne({ phoneNumber: phoneNumber, password: password });
    console.log("patientUser: ", patientUser);
    if (!patientUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    //create access token and refresh token
    const accessToken = createAccessToken(patientUser);
    const refreshToken = createRefreshToken(patientUser);

    return res.status(200).json({ message: 'Login successful', user: patientUser, accessToken: accessToken, refreshToken: refreshToken });
}

// This function handles the update location request for patients
async function UpdateLocationHandler(req, res) {
    const { patientId } = req.params;
    const { location } = req.body;
    console.log("patientId: ", patientId);
    console.log("location: ", location);

    // Check the location is provided
    if (!location) {
        return res.status(400).json({ message: 'Location is invalid' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    console.log("today: ", today);
    const patient = await patientsCollection.findOne({ _id: patientId });

    // check today is in the road history of patient
    const hasToday = patient.roadHistory.some(
        entry => entry.date === today
    );
    console.log("hasToday: ", hasToday);
    if (hasToday) {
        // Đã có ngày hôm nay → push point vào path
        await patientsCollection.updateOne(
            { _id: patientId, "roadHistory.date": today },
            {
                $push: {
                    "roadHistory.$.path": location
                },
                $set: { nowLocation: location }
            }
        );
    } else {
        // Chưa có ngày hôm nay → tạo mới object cho hôm nay
        await patientsCollection.updateOne(
            { _id: patientId },
            {
                $push: {
                    roadHistory: {
                        date: today,
                        path: [location]
                    }
                },
                $set: { nowLocation: location }
            }
        );
    }
    res.status(200).json({ message: 'Location updated successfully' });
}

module.exports = { LoginHandler, UpdateLocationHandler };