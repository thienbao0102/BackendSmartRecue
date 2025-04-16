const express = require('express');
const { runConnect, closeConnection } = require('./HandlerData/HandlerDataMongoDB.js');
const { LoginHandler, getInforPatients, RegisterHandler, registerPatientByRelative, getPatientsByRelative, deletePatient } = require('./HandlerRequest/HandlerAccount.js');
const { UpdateLocationHandler, GetLocationHandler, GetRoadHistoryHandler } = require('./HandlerRequest/LocationTrack.js')
const { warningFromPatient, sendWarningToRelative } = require("./HandlerRequest/Monitor_Warning.js")
const { refreshAccessToken, authenticate } = require('./JWT/HandlerJWT.js');


const app = express();
const port = 8000;
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

runConnect();
closeConnection();

// Đăng ký bệnh nhân bởi người quản lý
app.post('/register-by-relative', registerPatientByRelative);

// Lấy danh sách bệnh nhân theo relativeId
app.get('/by-relative/:relativeId', getPatientsByRelative);

// Xóa bệnh nhân
app.delete('/:patientId', deletePatient);

//api handler for sign up
app.post('/signup', (req, res) => RegisterHandler(req, res));

//api handler for login
app.post('/login', (req, res) => { LoginHandler(req, res) });

//api handler for get information of patients
app.post('/getInforPatients', authenticate, (req, res) => { getInforPatients(req, res) });

//api refresh token
app.post('/refresh-token', (req, res) => { refreshAccessToken(req.body.refreshToken, res) });

//api handler for patients sign up
app.post('/signuppatients', (req, res) => res.send('Hello World!'))

//api handler for update location of patients
app.put('/updateLocation/:patientId', authenticate, (req, res) => UpdateLocationHandler(req, res));

//api handler for get patients location
app.get('/getLocation/:patientId', authenticate, (req, res) => GetLocationHandler(req, res));

//api handler for get patients location history
app.get('/getRoadHistory/:patientId', authenticate, (req, res) => GetRoadHistoryHandler(req, res))

//api handler for get warning from patients
app.post('/warning/:relativeId', authenticate, (req, res) => warningFromPatient(req, res))

//api handler send warning to relative 
app.get('/sendwarning/:relativeId', authenticate, (req, res) => sendWarningToRelative(req, res)) 

app.listen(port, () => console.log(`Example app listening on port ${port}!`))