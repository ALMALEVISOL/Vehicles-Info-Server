var express = require("express");
const {MongoClient} = require('mongodb');
var cors = require('cors');
var bodyParser = require('body-parser');
let ObjectId = require('mongodb').ObjectID;
var app = express();


connectDB = async () => {
    const uri = "mongodb://localhost:27017/ECB?poolSize=20&writeConcern=majority";
    //const uri = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false"
    const client = new MongoClient(uri);
    try {
        return await client.connect();
    } catch (e) {
        console.error(e);
    }
}

app.use(cors())
app.use(bodyParser.urlencoded({
extended: true
}));

app.use(express.json());
app.use(bodyParser.json())

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.get("/vehicles", async (req, res, next) => {
    let connection = await connectDB()
    let connectionDB = connection.db("ECB");

    connectionDB.collection("Vehicles").find().toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
        connection.close();
    });
});

app.post("/vehicles", async (req, res, next) => { 
    let connection = await connectDB()
    let connectionDB = connection.db("ECB");
    let bodyCopyString = JSON.stringify( req.body );
    let bodyCopy = JSON.parse( bodyCopyString );
    delete bodyCopy._id;
    let newvalues = { $set: bodyCopy };
    let id = { _id: { $eq: ObjectId(req.body._id) } }
    connectionDB.collection("Vehicles").updateOne(id, newvalues, { "upsert": true }, (err, mongoResponse) => {
        if (err) throw err;
        res.status(200).send("Actualizado con éxito");
        connection.close();
    });
});