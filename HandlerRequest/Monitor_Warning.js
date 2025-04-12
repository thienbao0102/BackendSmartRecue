const {patientsCollection} = require('../HandlerData/HandlerDataMongoDB')

// create a array to store the relative clients
const relativeClients = [];

async function sendWarningToRelative(req, res) {
    const relativeId = req.params.relativeId

    // Thiết lập header SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    console.log('hello i am going sendWarningToRelative');
    // Ghi nhớ kết nối theo userId
    relativeClients[relativeId] = res;
    const message = "toi la supper hero";
    relativeClients[relativeId].write(`data: ${JSON.stringify(message)}\n\n`)
    // Khi client ngắt kết nối
    req.on("close", () => {
        delete clients[userId];
    });
}

async function warningFromPatient(req, res) {
    const relativeId = req.params.relativeId;
    const patientId = req.body.patientId;

    const patient = await patientsCollection.findOne({_id: patientId});
    console.log("patient: ", patient);

    const message = {
        _id: patient._id,
        name: patient.name,
        age: patient.age,
        location: patient.location
    }

    const clientRes = relativeClients[relativeId];
    if (clientRes) {
        // Gửi dữ liệu đến App 2 qua SSE
        clientRes.write(`data: ${JSON.stringify(message)}\n\n`);
        res.status(200).json({ message: 'Đã gửi yêu cầu giúp đỡ đến người thân' });
    } else {
        res.status(404).json({ message: 'Không tìm thấy người thân để gửi yêu cầu giúp đỡ' });
    }
}

module.exports ={sendWarningToRelative, warningFromPatient};