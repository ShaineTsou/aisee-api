const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const app = express();

const signin = require("./controllers/signin");
const signup = require("./controllers/signup");
const image = require("./controllers/image");
const profile = require("./controllers/profile");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "shainetsou",
    password: "",
    database: "aisee",
  },
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.status(200).json("this is working"));
app.post("/signin", signin.handleSignin(db, bcrypt));
app.post("/signup", signup.handleSignup(db, bcrypt));
app.post("/image", image.handleImage(db));
app.get("/profile/:userId", profile.handleProfile(db));

app.listen(8080, () => console.log("app is running on port 8080"));
