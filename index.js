
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());


// mongodb connection.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yhxur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;



async function run() {
  try {
    await client.connect();
    const database = client.db("books");
    const courseCollection = database.collection("course");
    const enrolledCourseCollection = database.collection("enrolled");

    // get course

    app.get("/course", async (req, res) => {
      const course = {};
      const cursor = courseCollection.find(course);
      const courses = await cursor.toArray();
      res.send(courses);
    })

    app.post("/enrolled", async (req, res) => {
      const enrollCourse = req.body;

      // Adding initial status as "Incomplete"
      enrollCourse.status = "Incomplete";

      try {
        const result = await enrolledCourseCollection.insertOne(enrollCourse);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to enroll in the course" });
      }
    });

    app.get("/enrollcourse", async (req, res) => {
      const enrollcourse = {};
      const cursor = enrolledCourseCollection.find(enrollcourse);
      const courses = await cursor.toArray();
      res.send(courses);
    })
    app.patch("/enrollcourse/:courseId", async (req, res) => {
      const courseId = req.params.courseId;
      const updatedCourse = await enrolledCourseCollection.findOneAndUpdate(
        { _id: courseId },
        { $set: { status: "completed" } },
        { new: true }
      );
      res.send(updatedCourse);
    });
    
    
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Received ID:", id);

      try {
        const course = { _id: new ObjectId(id) };
        const result = await courseCollection.findOne(course);

        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ message: "Course not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Error fetching course data", error });
      }
    });

    // app.get("/course/:id", async (req, res) => {
    //   const id = req.params.id;
    //   console.log("Received ID:", id);
    //   const course = { _id: new ObjectId(id) };
    //   const result = await courseCollection.findOne(course)
    //   res.json(result);

    // });
    app.listen(port, () => {
      console.log("Running on port", port);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
