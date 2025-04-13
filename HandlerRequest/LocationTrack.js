const { patientsCollection } = require('../HandlerData/HandlerDataMongoDB.js');

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

// This function handles the get location request for patients
async function GetLocationHandler(req, res) {
    const { patientId } = req.params;
    console.log("patientId: ", patientId);

    const patient = await patientsCollection.findOne({ _id: patientId }, { projection: { nowLocation: 1 } });
    console.log("patient: ", patient.nowLocation.coordinates);
    if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Get location successfully', location: patient.nowLocation.coordinates });
}

//this function handles the get road history request for patients
async function GetRoadHistoryHandler(req, res) {
    const { patientId } = req.params;
    console.log("patientId: ", patientId);

    const patient = await patientsCollection.findOne({ _id: patientId }, { projection: { roadHistory: 1 } });
    console.log("roadHistory: ", patient.roadHistory);
    if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Get road history successfully', roadHistory: patient.roadHistory });
};

module.exports ={UpdateLocationHandler, GetLocationHandler, GetRoadHistoryHandler}