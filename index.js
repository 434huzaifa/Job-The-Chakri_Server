const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 54321

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@saaddb.bmj48ga.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});
async function run() {

  try {
    const database = client.db("JobTheChakri");
    const cbid = database.collection("bid");
    const cjobs = database.collection("jobs");
    const cuser = database.collection("user");
    app.post('/user', async (req, res) => {
      const user = req.body
      const query = { email: new RegExp(user.email, "i") }
      const userArray=await cuser.findOne(query)
      if (userArray==null) {
        const result = await cuser.insertOne(user)
        res.send(result)
        return
      }
      res.send({msg:"user exist"})
    })
    app.get('/top',async(req,res)=>{
      const users=await cuser.find().limit(5).toArray()
      res.send(users)
    })

  } finally {
  }
}
run().catch(console.dir);



app.get('/', (req, res) => { res.send("Backend Running") })


app.listen(port, () => { console.log(`Server Started at ${port}`) })


