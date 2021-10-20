const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const app = express();
const knex = require("knex");

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

app.get("/", (req, res) => {
  res.status(200).json("this is working");
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  db.select("hash")
    .from("login")
    .where("email", email)
    .then((hashArr) => {
      if (!hashArr.length) {
        res.status(400).json("email does not exist");
      } else {
        let hash = hashArr[0].hash;
        bcrypt.compare(password, hash, (err, isValid) => {
          if (isValid) {
            return db
              .select("*")
              .from("users")
              .where("email", email)
              .then((user) => res.status(200).json(user[0]))
              .catch((err) =>
                res.status(400).json("error getting user information")
              );
          } else {
            return res.status(400).json("Wrong credentials");
          }
        });
      }
    })
    .catch((err) => res.status(400).json("Error signing in"));
});

app.post("/signup", (req, res) => {
  const { displayName, email, password } = req.body;
  if (!displayName || !email || !password) {
    return res.status(400).json("incorrect form submission");
  }

  // Generate hashed password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      db.transaction((trx) => {
        trx
          .insert({
            email: email,
            hash: hash,
          })
          .into("login")
          .returning("email")
          .then((loginEmail) => {
            return trx
              .insert({
                email: loginEmail[0],
                display_name: displayName,
                joined_date: new Date(),
              })
              .into("users")
              .returning("*")
              .then((user) => res.status(200).json(user[0]))
              .catch((err) => res.status(400).json("Error signing up"));
          })
          .then(trx.commit)
          .catch(trx.rollback);
      }).catch((err) => res.status(400).json("unable to sign up"));
    });
  });
});

app.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;
  db.select("*")
    .from("users")
    .where("user_id", userId)
    .then((user) => {
      if (user.length) {
        res.status(200).json(user[0]);
      } else {
        res.status(400).json("Error getting profile");
      }
    })
    .catch((err) => res.status(400).json("Not found"));
});

app.post("/image", (req, res) => {
  const { userId, imageUrl, colors } = req.body;

  db("results")
    .insert({
      user_id: userId,
      image_url: imageUrl,
      submit_date: new Date(),
    })
    .returning("*")
    .then((result) => res.status(200).json(result[0]))
    .catch((err) => res.status(400).json("Error storing result"));
});

app.listen(8080, () => {
  console.log("app is running on port 8080");
});
