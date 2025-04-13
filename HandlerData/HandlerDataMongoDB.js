const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://SmartRescueAdmin:smartrescue123@cluster0.t9j16to.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//phú: ThienPhuDoan
//Bảo: SmartRescueAdmin
const uri = "mongodb+srv://ThienPhuDoan:abcd1234@cluster0.t9j16to.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//tạo một client MongoDB mới với URI kết nối và các tùy chọn server API
// Create a new MongoDB client with the connection URI and server API options
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const smartRecueDb = client.db('smart_rescue');
const patientsCollection = smartRecueDb.collection('patients');
const relativesCollection = smartRecueDb.collection('relatives');
const blackListCollection = smartRecueDb.collection('blacklist');

// Connect the client to the server
async function runConnect() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log('Connected to MongoDB!');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        await client.close();
    }
}

// clode the client connection when the Node.js process ends
async function closeConnection() {
    process.on('SIGINT', async () => {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
}


module.exports = {
    runConnect,
    closeConnection,
    patientsCollection,
    relativesCollection,
    blackListCollection
};