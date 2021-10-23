require("dotenv").config();
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
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.status(200).json("this is working"));
app.post("/signin", signin.handleSignin(db, bcrypt));
app.post("/signup", signup.handleSignup(db, bcrypt));
app.post("/image", image.handleImage(db));
app.post("/imageurl", (req, res) => image.handleApiCall(req, res));
app.get("/profile/:userId", profile.handleProfile(db));

app.listen(process.env.PORT || 3000, () =>
  console.log(`app is running on port ${process.env.PORT || 3000}`)
);
