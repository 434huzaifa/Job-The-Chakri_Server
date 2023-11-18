const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express')
const cors = require('cors');
const jwt=require("jsonwebtoken")
const cookie_pares=require("cookie-parser")
const app = express()
const port = process.env.PORT || 54321

app.use(cookie_pares())
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@saaddb.bmj48ga.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});
async function logger(req,res,next) {
  let date=new Date()
  console.log(date.toLocaleString("en-US"),req.method,req.url);
  next()
}
const isThisToken=async(req,res,next)=>{
  const token=req?.cookies?.huzaifa;
  if(!token){
    return res.status(401).send({message:"Unauthorized"})
  }
  jwt.verify(token,process.env.TOKEN,(error,decoded)=>{
    if (error) {
      return res.status(401).send({message:"Unauthorized"})
    }
    req.user=decoded
      next()
    
 
  })
}
async function run() {


  try {
    const database = client.db("JobTheChakri");
    const cbid = database.collection("bid");
    const cjobs = database.collection("jobs");
    const cuser = database.collection("user");
    app.post('/user',logger,isThisToken, async (req, res) => {
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
    app.get('/top',logger,isThisToken,isThisToken,async(req,res)=>{
      const users=await cuser.find().limit(5).toArray()
      res.send(users)
    })
    app.get('/newjobs',logger,isThisToken,async(req,res)=>{
      const query = cjobs.find({}).sort({ _id: -1 }).limit(4);
      const latestjobs = await query.toArray();
      res.send(latestjobs)

    })
    app.get('/jobs',logger,isThisToken,async(req,res)=>{
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
    app.get('/myjobs/:mail',logger,isThisToken,async(req,res)=>{
      let mail=req.params.mail
      const query ={seller:mail}
      const response= await cjobs.find(query).toArray()
      res.send(response)
    })
    app.get('/job/:id',logger,isThisToken,async(req,res)=>{
      let id=new ObjectId(req.params.id)
      let result=await cjobs.findOne({_id:id})
      if (result.seller==req.user.email) {
        result.owner=true
      }else{
        result.owner=false
      }
      res.send(result)
    })
    app.post('/bid',logger,isThisToken,async(req,res)=>{
      let result=await cbid.insertOne(req.body)
      res.send(result)
    })
    app.get('/bid/:mail',logger,isThisToken,async(req,res)=>{
      let mail=req.params.mail
      const query ={bidder:mail}
      const response= await cbid.find(query).sort({status:1}).toArray()
      let bidjobs= new Array()
      for(let i=0;i<response.length;i++){
        let t=await cjobs.findOne({_id:new ObjectId(response[i].jobid)})
        if (t !=null) {
          t.bidid=response[i]._id
          t.status=response[i].status
          bidjobs.push(t)
        }
      }
      res.send(bidjobs)
    })
    app.get('/bidrequest/:mail',logger,isThisToken,async(req,res)=>{
      let mail=req.params.mail
      if (mail==req.user.email) {
        const query ={seller:mail}
        const response= await cbid.find(query).toArray()
        let bidjobs= new Array()
        for(let i=0;i<response.length;i++){
          let t=await cjobs.findOne({_id:new ObjectId(response[i].jobid)})
          if (t!=null) {
            t.bidid=response[i]._id
            t.bidid=response[i]._id
            t.status=response[i].status
            t.price=response[i].price
            t.bidder=response[i].bidder
            t.bidder=response[i].bidder
            bidjobs.push(t)
          }
  
        }
        res.send(bidjobs)
      }else{
        res.status(401).send({msg:"Unauthorized"})
      }

    })
    app.put('/jobstatus/:bidid',logger,isThisToken,async(req,res)=>{
      const bidid=req.params.bidid
      let {status}=req.body
      if (status==0) {
        status="rejected"
      }
      else if (status==1) {
        status="progress"
      }else if (status==2) {
        status="completed"
      }
      const result=await cbid.updateOne({_id:new ObjectId(bidid)},{$set:{status}})
      res.send(result)
    })
    app.get('/jobdelete/:jobid',logger,isThisToken, async(req,res)=>{
      let id=new ObjectId(req.params.jobid)
      let result=await cjobs.deleteOne({_id:id})
      res.send(result)
    })

    app.put('/updatedjobs/:jobid',logger,isThisToken,async (req, res) => {
      let query={_id:new ObjectId(req.params.jobid)}
      let job=await cjobs.findOne(query)
      if (job.seller==req.user.email) {
        let result=await cjobs.updateOne(query,{$set:req.body})
        res.send(result)
      }else{
        res.status(401).send({msg:"Unauthorized"})
      }
    })
    app.get('/alljobs',logger,isThisToken,async (req,res)=>{
      res.send( alljobs= await cjobs.find().toArray())

    })
    app.post('/search',logger,isThisToken,async (req,res)=>{
      let body=req.body
      const query = {
        title: new RegExp(body.search, "i"),
        cate: { $in: body.category }
      };
      if (body.max!='' && body.min!='') {
        query.$expr= {
          $and: [
            { $lte: [{ $toInt: '$max' }, parseInt(body.max)] }, // Converting to int the max field
            { $gte: [{ $toInt: '$min' },  parseInt(body.min)] }
          ]
        }
      }else if(body.max=='' && body.min!=''){
        query.$expr= {
          $and: [
            { $gte: [{ $toInt: '$min' },  parseInt(body.min)] }
          ]
        }
      }else if(body.min=='' && body.max!=''){
        query.$expr= {
          $and: [
            { $lte: [{ $toInt: '$max' }, parseInt(body.max)] }, // Converting to int the max field
          ]
        }
      }
      let result=await cjobs.find(query).toArray()
      res.send(result)
      
    })
    app.post('/jsonwebtoken',logger,async(req,res)=>{
      const user=req.body
      const token=jwt.sign(user,process.env.TOKEN,{ expiresIn: '1h' })
      res.cookie('huzaifa',token,{
        httpOnly:true,
        secure:true,
        sameSite:'none',
      }).send({success:true})
    })
    app.post('/logout',logger,isThisToken,async(req,res)=>{
      res.clearCookie('huzaifa',{maxAge:0}).send({success:true})
    })
    

  } finally {
  }
}
run().catch(console.dir);



app.get('/', (req, res) => { res.send("Backend Running") })


app.listen(port, () => { console.log(`Server Started at ${port}`) })


