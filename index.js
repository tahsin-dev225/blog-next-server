const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin : ["http://localhost:3000"],
    credentials:true
  }));
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.udxqu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
    try {
    // await client.connect();
    const userCollection = client.db("blog-next").collection("users");
    const pendingBlogCollection = client.db("blog-next").collection("pendingBlog");
    const approvedBlogCollection = client.db("blog-next").collection("approvedgBlog");

    app.post('/users', async(req,res)=>{
        const user = req.body;
        const query = {email : user.email};
        const axistUser = await userCollection.findOne(query)
        if(axistUser){
            return res.status(401).send({message : "User already axist"})
        }
        const result = await userCollection.insertOne(user);
        res.send(result)
    })

    app.get('/users', async(req,res)=>{
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    app.get('/isAdmin/:user', async(req,res)=>{
        const email = req.params.user;
        console.log(email)
        const query = { email : email}
        const result = await userCollection.findOne(query)
        res.send(result)
    })

    // blogs
    app.post('/pendingBlogs', async (req,res)=>{
        const blog = req.body;
        const result = await pendingBlogCollection.insertOne(blog)
        res.send(result)
    })

    app.get('/pendingBlogs', async (req,res)=>{
        const blog = await pendingBlogCollection.find().toArray();
        res.send(blog)
    })
    
    app.delete('/pendingBlogs/:id', async (req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await pendingBlogCollection.deleteOne(query)
        res.send(result)
    })

    app.post('/approvedgBlogs', async (req,res)=>{
        const blog = req.body;
        const newApprovedBlog = {
            title : blog?.title,
            category : blog?.category,
            discription : blog?.discription,
            photo : blog?.photo,
            date : blog?.date,
        }
        const deleteId = blog._id;
        const query = {_id : new ObjectId(deleteId)}
        const result = await approvedBlogCollection.insertOne(newApprovedBlog);
        const deleted = await pendingBlogCollection.deleteOne(query)
        res.send(result)
    })

    app.get('/approvedgBlogs', async (req,res)=>{
        const blog = await approvedBlogCollection.find().toArray();
        res.send(blog)
    })
    
    app.get('/approvedgBlogs/:id', async (req,res)=>{
        const id = req.params.id;
        console.log(id)
        const query = { _id : new ObjectId(id)}
        const blog = await approvedBlogCollection.findOne(query);
        res.send(blog)
    })
    

} finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) =>{
    res.send('Blog next redux is running ');
});

app.listen(port , ()=>{
    console.log(`Blog next redux is running on port : ${port}`)
})

