const express = require('express')
const cors = require("cors");
const app = express()
require('dotenv').config()

app.use(cors());
app.use(express.json());


const port = 5000


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `${process.env.MONGO_URI}`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // COLLECTIONS 
        const userCollection = client.db("Note-Nest").collection("users");
        const folderCollection = client.db("Note-Nest").collection("folders");
        const noteCollection = client.db("Note-Nest").collection("notes");
        const trashCollection = client.db("Note-Nest").collection("trash");


        // POST DATA OF USER TO DATABASE WHEN REGISTERING 
        app.post("/userRegister", async (req, res) => {
            let user = req.body;
            let result = await userCollection.insertOne(user);
            res.send(result);
        })

        // POSTING DATA WHEN LOGIN OR REGISTERING WITH GOOGLE
        app.post("/userGoogleRegister", async (req, res) => {
            const userDetails = req.body;
            let checkEmail = userDetails.email;
            const existingUser = await userCollection.findOne({ email: checkEmail });

            if (existingUser) {
                return res.status(409).json({ error: 'Email already exists' });
            }

            let result = await userCollection.insertOne(userDetails);
            res.send(result);
        });

        // GET THE CURRENT USER DATA 
        app.get("/userData/:email", async (req, res) => {
            const email = req.params.email;
            const query = {
                email: email,
            };
            const result = await userCollection.findOne(query);
            res.send(result);
        });

        // API TO CREATE A NEW NOTE FOLDER 
        app.post("/addNoteFolder", async (req, res) => {
            let folder = req.body;
            let result = await folderCollection.insertOne(folder);
            res.send(result);
        })

        // API TO GET FOLDERS BASED ON EMAIL 
        app.get("/getFolders", async (req, res) => {
            let email = req.query.email;
            if (!email) {
                return res.status(400).send({ error: "Email is required" });
            }
            let query = { userEmail: email };
            const result = await folderCollection.find(query).toArray();
            res.send(result);
        });

        // API TO ADD A NEW NOTE 
        app.post("/addNote", async (req, res) => {
            let note = req.body;
            let result = await noteCollection.insertOne(note);
            res.send(result);
        })

        // API TO GET NOTES BASED ON EMAIL 
        app.get("/getNotes", async (req, res) => {
            let email = req.query.email;
            if (!email) {
                return res.status(400).send({ error: "Email is required" });
            }
            let query = { userEmail: email };
            const result = await noteCollection.find(query).toArray();
            res.send(result);
        });

        // API TO DELETE NOTE 
        app.delete("/noteDelete/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await noteCollection.deleteOne(query);
            res.send(result);
        });


        // API TO ADD TO TRASH AFTER DELETING A NOTE 
        app.post("/addToTrash", async (req, res) => {
            let note = req.body;
            let result = await trashCollection.insertOne(note);
            res.send(result);
        })

        // API TO GET TRASHED NOTES BASED ON EMAIL 
        app.get("/getTrashedNotes", async (req, res) => {
            let email = req.query.email;
            if (!email) {
                return res.status(400).send({ error: "Email is required" });
            }
            let query = { userEmail: email };
            const result = await trashCollection.find(query).toArray();
            res.send(result);
        });

        // API TO GET A SPECIFIC FOLDER BY ID
        app.get("/getFolder/:id", async (req, res) => {
            const folderId = req.params.id;
            const query = { _id: new ObjectId(folderId) };
            const folder = await folderCollection.findOne(query);
            res.send(folder);
        });

        // API TO UPDATE NOTE 
        app.patch('/updateNote/:id', async (req, res) => {
            const { id } = req.params
            const { noteName, selectedColor, noteDescription, notefolder } = req.body

            const result = await noteCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { noteName, selectedColor, noteDescription, notefolder } }
            )

            res.json(result)
        })



    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Note Nest Server is Running!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})