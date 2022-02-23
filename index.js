const { MongoClient } = require('mongodb');

const express=require('express');
const ObjectId=require('mongodb').ObjectId; 
require('dotenv').config();

const bodyParser=require('body-parser');
const cors=require('cors');
const app=express();
const port = process.env.PORT||5001;
const mongoose = require('mongoose');
const User = require('./MODEL/user');
const bycrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://localhost:27017/bd-login-app',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

//middlewere
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


//now connect  mongodb to server 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjow1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// test case 
const JWT_SECRET='sdlgskfoj,hryploteajlryjl';

//token 
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}


//async function 

async function run(){
    try{
        await client.connect();
        console.log('connected to database'); //checked the connection


        const database=client.db('TRAVELO');
        const usersCollection = database.collection('users');
        const blogsCollection=database.collection('blogs');
    

        //POST API: ADD A  BLOG DETAIL TO DATABASE "blogsCollection" 
        app.post('/blogs',async(req,res)=>{
            const blog=req.body;
           
            const result=await blogsCollection.insertOne(blog);
            console.log('insert success ');
            res.json(result);
        });


        //GET API: LOAD ALL BLOGS FROM DATABASE TO SERVER LINK API TO SHOW ON UI  
        app.get('/blogs',async(req,res)=>{
                    const cursor=blogsCollection.find({});
                    const blogs=await cursor.toArray();
                    res.send(blogs);
        });

        //GET API: LOAD SINGLE BLOG FROM DATABASE TO SERVER LINK API TO SHOW ON UI  
        app.get('/blogs/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const blog=await blogsCollection.findOne(query);
            res.json(blog);
        });


        //users management 
  
            
                app.post('/users', async (req, res) => {
                    const user = req.body;
                    const {email,password:plainTextPassword}=user;
                    if(!email || typeof email != 'string')
                    {
                        return res.json({status:'error',error:'Invalid email'})
                    }
                    if(!plainTextPassword || typeof plainTextPassword != 'string')
                    {
                        return res.json({status:'error',error:'Invalid password'})
                    }
                    if(plainTextPassword.length<5)
                    {
                        return res.json({status:'error',error:'your password is too small'})
                    }
                    const password=await bycrypt.hash(plainTextPassword,10);

                    try{
                        const response =await User.create({
                            email,
                            password
                        })
                    } catch(error){
                        if(error.code === 11000)
                        {
                            return res.json({status:'error',error:'User already exist'})
                        }
                        throw error ;
                        return res.json({status:'error'})
                    }

                    const result = await usersCollection.insertOne(user);
                    
                    res.json(result);
                });


                ////////login user 
                app.post('/login', async (req, res) =>{
                   const {email,password}=req.body;
                   
                   const user =await User.findOne({email,password}).lean()
                  if(!user){
                      return res.json({status:'error',error:'invelid username/password'})
                  } 
                   if(await bycrypt.compare(password,user.password))
                   {

                    const  token =jwt.sign({
                        id: user._id,
                        username: user.email
                    },JWT_SECRET)

                    return res.json({status:'ok',error:token})
                   }
                });

        
                //////
                app.put('/users', async (req, res) => {
                    const user = req.body;
                    const filter = { email: user.email };
                    const options = { upsert: true };
                    const updateDoc = { $set: user };
                    const result = await usersCollection.updateOne(filter, updateDoc, options);
                    res.json(result);
                });
        
               



    

    }
    finally{
        // await client.close();
    }
    
    };
    

    run().catch(console.dir);








app.get('/',(req,res)=>{
    res.send('running travelo server');
});

app.listen(port,()=>{
    console.log('running server on port',port);
});

