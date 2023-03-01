const express = require("express");
const PORT = 8000;
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
let db,
	dbConnectionStr = process.env.DB_STRING,
	dbName = "dev";
// talk to mongo DB
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
	client => {
		console.log(`Connected to ${dbName} Database`);
		db = client.db(dbName);
	}
);

// get index.html
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

// post blog post with postName, body, tag and date as request body
app.post("/api/admin/add/post", (req, res) => {
	console.log(req.body);
	if (!req.body.postName || !req.body.body || !req.body.tag || !req.body.date) {
		res.json({ status: 500, message: "Please all fields are required" });
	} else {
		db.collection("blog-post")
			.insertOne({
				postName: req.body.postName,
				body: req.body.body,
				tag: req.body.tag,
				date: req.body.date,
			})
			.then(result => {
				console.log("Post Added");
			})
			.catch(error => console.error(error));
		res.json({ status: 200, message: "Post successfully added" });
	}
});

// delete blog post
app.delete("/api/admin/post/delete", (req, res) => {
	db.collection("blog-post")
		.deleteOne({ postName: req.body.postName })
		.then(result => {
			console.log(`Deleted blog post ${req.body.postName}`);
		})
		.catch(error => console.error(error));
	res.json(`Deleted blog post ${req.body.postName}`);
});
// get all posts
app.get("/api/posts", (req, res) => {
	db.collection("blog-post")
		.find()
		.toArray()
		.then(data => {
			res.json(data);
		})
		.catch(error => console.error(error));
});

// get post by title
app.get("/api/admin/post/:postName", (req, res) => {
	console.log(req.params.postName);
	db.collection("blog-post")
		.findOne({ postName: req.params.postName })
		.then(data => {
			res.json(data);
		});
});

app.listen(process.env.PORT || PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
