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

// Utility Function
const getNestedResultsArray = (resultsArr) => {
  const nestedObj = {};

  resultsArr.forEach((result) => {
    const id = result.result_id;
    const color = {
      colorId: result.color_id,
      w3cName: result.w3c_name,
      hexColor: result.hex_color,
      density: result.density,
    };

    if (!nestedObj[id]) {
      nestedObj[id] = {
        resultId: id,
        submitDate: result.submit_date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        imageUrl: result.image_url,
        colors: [color],
      };
    } else {
      nestedObj[id].colors.push(color);
    }
  });

  return Object.keys(nestedObj).map((key) => nestedObj[key]);
};

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
        res.status(400).json("Wrong credentials");
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
    .from("results")
    .innerJoin("colors", "results.result_id", "colors.result_id")
    .where("results.user_id", userId)
    .then((result) => {
      if (result.length) {
        const nestedResultsObj = getNestedResultsArray(result);
        res.status(200).json(nestedResultsObj);
      }
    })
    .catch((err) => res.status(400).json("Not found"));
});

app.post("/image", (req, res) => {
  const { userId, imageUrl, colors } = req.body;
  db.transaction((trx) => {
    trx("results")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        submit_date: new Date(),
      })
      .returning("result_id")
      .then((result) => {
        colors.forEach(({ raw_hex, value, w3c: { name } }) => {
          trx("colors")
            .insert({
              result_id: result[0],
              w3c_name: name,
              hex_color: raw_hex,
              density: value,
            })
            .catch((err) =>
              res.status(400).json(`Error storing color ${name} ${raw_hex}`)
            );
        });
        return res.status(200).json("storing colors success");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("Error storing result"));
});

app.listen(8080, () => {
  console.log("app is running on port 8080");
});
