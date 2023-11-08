const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const port=process.env.PORT || 54321

app.use(cors());
app.use(express.json())

const uri=`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@saaddb.bmj48ga.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
    } finally {
        await client.close();
    }
  }
  run().catch(console.dir);



app.get('/',(req, res) => {res.send("Backend Running")})


app.listen(port, () => { console.log(`Server Started`) })


