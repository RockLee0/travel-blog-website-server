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


//async function 

async function run(){
    try{
        await client.connect();
        console.log('connected to database'); //checked the connection


        const database=client.db('TRAVELO');
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
                    console.log(blogs);
                    res.send(blogs);
        });

        //GET API: LOAD SINGLE BLOG FROM DATABASE TO SERVER LINK API TO SHOW ON UI  
        app.get('/blogs/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const blog=await blogsCollection.findOne(query);
            res.json(blog);
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

