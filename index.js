const { MongoClient } = require('mongodb');

const express=require('express');
const ObjectId=require('mongodb').ObjectId; 
require('dotenv').config();

const cors=require('cors');
const app=express();
const port = process.env.PORT||5001;

//middlewere
app.use(cors());
app.use(express.json());


//now connect  mongodb to server 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wjow1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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
        const blogsCollection=database.collection('blogs');
        const usersCollection = database.collection('users');
    

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
                ///
                app.get('/users/:email', async (req, res) => {
                    const email = req.params.email;
                    const query = { email: email };
                    const user = await usersCollection.findOne(query);
                    let isAdmin = false;
                    if (user?.role === 'admin') {
                        isAdmin = true;
                    }
                    res.json({ admin: isAdmin });
                });
        
                //
                app.post('/users', async (req, res) => {
                    const user = req.body;
                    const result = await usersCollection.insertOne(user);
                    console.log(result);
                    res.json(result);
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
        
                //////////////
                app.put('/users/admin', verifyToken, async (req, res) => {
                    const user = req.body;
                    const requester = req.decodedEmail;
                    if (requester) {
                        const requesterAccount = await usersCollection.findOne({ email: requester });
                        if (requesterAccount.role === 'admin') {
                            const filter = { email: user.email };
                            const updateDoc = { $set: { role: 'admin' } };
                            const result = await usersCollection.updateOne(filter, updateDoc);
                            res.json(result);
                        }
                    }
                    else {
                        res.status(403).json({ message: 'you do not have access to make admin' })
                    }
        
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

