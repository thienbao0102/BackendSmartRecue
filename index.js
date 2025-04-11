const express = require('express');
const { runConnect, closeConnection } = require('./HandlerData/HandlerDataMongoDB.js');
const { LoginHandler, UpdateLocationHandler } = require('./HandlerRequest/HandlerAccount.js');
const { refreshAccessToken, authenticate } = require('./JWT/HandlerJWT.js');
const app = express();
const port = 8000;
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

runConnect();
closeConnection();

//api handler for sign in
app.get('/signin', (req, res) => res.send('Hello World!'))

//api handler for sign up
app.post('/signup', (req, res) => res.send('Hello World!'))

//api handler for login
app.post('/login', (req, res) => {LoginHandler(req, res)});

//api refresh token
app.post('/refresh-token', (req, res) => {refreshAccessToken(req.body.refreshToken, res)});

//api handler for patients sign up
app.post('/signuppatients', (req, res) => res.send('Hello World!'))

//api handler for update location of patients
app.put('/updateLocation/:patientId', authenticate , (req, res) => UpdateLocationHandler(req, res));

//api handler for get patients location
app.get('/getLocation', (req, res) => res.send('Hello World!'))

//api handler for get patients location history
app.get('/getLocationHistory', (req, res) => res.send('Hello World!'))

//api handler for get warning form patients
app.post('/warning/:relativeId', authenticate , (req, res) => {
    const relativeId = req.params.relativeId;
    console.log("relativeId: ", relativeId);
    res.json({ message: 'Warning sent successfully'});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))