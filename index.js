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
    app.get('/newjobs',async(req,res)=>{
      const query = cjobs.find({}).sort({ _id: -1 }).limit(4);
      const latestjobs = await query.toArray();
      res.send(latestjobs)

    })
    app.get('/jobs',async(req,res)=>{
      const response={}
      const query1={cate:{$eq:"web development"}}
      response.web=await cjobs.find(query1).toArray()
      const query2={cate:{$eq:"digital marketing"}}
      response.digital=await cjobs.find(query2).toArray()
      const query3={cate:{$eq:"graphics design"}}
      response.graphics=await cjobs.find(query3).toArray()
      res.send(response)
    })
    app.post('/addjob',async (req,res)=>{
      const result=await cjobs.insertOne(req.body)
      res.send(result)
    })
    app.get('/myjobs/:mail',async(req,res)=>{
      let mail=req.params.mail
      const query ={seller:mail}
      const response= await cjobs.find(query).toArray()
      res.send(response)
    })
    app.get('/job/:id',async(req,res)=>{
      let id=new ObjectId(req.params.id)
      res.send(await cjobs.findOne({_id:id}))
    })
    app.post('/bid',async(req,res)=>{
      let result=await cbid.insertOne(req.body)
      res.send(result)
    })
    app.get('/bid/:mail',async(req,res)=>{
      let mail=req.params.mail
      const query ={bidder:mail}
      const response= await cbid.find(query).toArray()
      let bidjobs= new Array(response.length)
      for(let i=0;i<response.length;i++){
        let t=await cjobs.findOne({_id:new ObjectId(response[i].jobid)})
        t.status=response[i].status
        bidjobs[i]=t
      }
      res.send(bidjobs)
    })
    app.get('/bidrequest/:mail',async(req,res)=>{
      let mail=req.params.mail
      const query ={seller:mail}
      const response= await cbid.find(query).toArray()
      let bidjobs= new Array(response.length)
      for(let i=0;i<response.length;i++){
        let t=await cjobs.findOne({_id:new ObjectId(response[i].jobid)})
        t.bidid=response[i]._id
        t.status=response[i].status
        t.price=response[i].price
        t.bidder=response[i].bidder
        bidjobs[i]=t
      }
      res.send(bidjobs)
    })
    app.put('/jobstatus/:bidid',async(req,res)=>{
      const bidid=req.params.bidid
      let {status}=req.body
      
      if (status==0) {
        status="rejected"
      }
      else if (status==1) {
        status="progress"
      }
      console.log(bidid,status)
      const result=await cbid.updateOne({_id:new ObjectId(bidid)},{$set:{status}})
      console.log(result)
      res.send(result)
    })
    
  } finally {
  }
}
run().catch(console.dir);



app.get('/', (req, res) => { res.send("Backend Running") })


app.listen(port, () => { console.log(`Server Started at ${port}`) })


