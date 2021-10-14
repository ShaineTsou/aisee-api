const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();

// Middleware
app.use(express.json());

class User {
  constructor(displayName, email) {
    this.user_id = "125";
    this.display_name = displayName;
    this.email = email;
    this.joined_date = new Date();
    this.results = [];
  }
}

class Result {
  constructor(imageUrl, colorsArr) {
    this.result_id = "1";
    this.submit_date = new Date();
    this.image_url = imageUrl;
    this.colors = colorsArr;
  }
}

class Login {
  constructor(email, hash) {
    this.user_id = "125";
    this.id = "989";
    this.hash = hash;
    this.email = email;
  }
}

const database = {
  users: [
    {
      user_id: "123",
      display_name: "John Doe",
      email: "john@gmail.com",
      joined_date: new Date(),
      results: [
        {
          result_id: "1",
          submit_date: "2021-10-13",
          image_url:
            "https://unsplash.com/photos/d762S6cSrro/download?force=true&w=640",
          colors: [
            {
              color_id: "1",
              w3c_name: "LightSkyBlue",
              hex: "#87cefa",
              density: "87",
            },
            {
              color_id: "2",
              w3c_name: "FireBrick",
              hex: "#b22222",
              density: "10",
            },
            {
              color_id: "3",
              w3c_name: "FloralWhite",
              hex: "#fffaf0",
              density: "3",
            },
          ],
        },
      ],
    },
    {
      user_id: "124",
      display_name: "Jane Doe",
      email: "jane@gmail.com",
      joined_date: new Date(),
      results: [
        {
          result_id: "1",
          submit_date: "2021-10-11",
          image_url:
            "https://unsplash.com/photos/rrWVwyxuuz8/download?force=true&w=640",
          colors: [
            {
              color_id: "1",
              w3c_name: "Black",
              hex: "#000000",
              density: "58",
            },
            {
              color_id: "2",
              w3c_name: "CornSilk",
              hex: "#fff8dc",
              density: "15",
            },
            {
              color_id: "3",
              w3c_name: "DeepPink",
              hex: "#ff1493",
              density: "27",
            },
          ],
        },
        {
          result_id: "2",
          submit_date: "2021-10-13",
          image_url:
            "https://unsplash.com/photos/bwAHARc_r_8/download?force=true&w=640",
          colors: [
            {
              color_id: "1",
              w3c_name: "LightGray",
              hex: "#d3d3d3",
              density: "92",
            },
            {
              color_id: "2",
              w3c_name: "Gold",
              hex: "#ffd700",
              density: "8",
            },
          ],
        },
      ],
    },
  ],
  login: [
    {
      user_id: "123",
      id: "987",
      hash: "$2a$10$gt3mRM5xuYatfgv80vj.medvUz0Tq68ILmtZXp2/n3tVObbvJJx0G",
      email: "john@gmail.com",
    },
    {
      user_id: "124",
      id: "988",
      hash: "$2a$10$f7oYSFy0wzthJZ0SriMO9uXLej9tOOtStEyJF4BUaxpXJWAp1drlC",
      email: "jane@gmail.com",
    },
  ],
};

app.get("/", (req, res) => {
  res.status(200).json("this is working");
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  let userId = "";

  for (let user of database.users) {
    if (user.email === email) {
      userId = user.user_id;
    }
  }

  if (!userId.length) {
    res.status(404).json("Error signing in, no such user");
  }

  for (let userLogin of database.login) {
    if (userLogin.user_id === userId) {
      const hash = userLogin.hash;

      bcrypt.compare(password, hash, (err, result) => {
        if (result) {
          return res.status(200).json("Success");
        }
        return res.status(404).json("Error signing in");
      });
    }
  }
});

app.post("/signup", (req, res) => {
  const { displayName, email, password } = req.body;

  // Generate hashed password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      // Instantiate user and login object
      const newLogin = new Login(email, hash);
      const newUser = new User(displayName, email);

      database.users.push(newUser);
      database.login.push(newLogin);
      res.status(200).json(database.users[database.users.length - 1]);
    });
  });
});

app.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;

  for (let user of database.users) {
    if (user.user_id === userId) {
      return res.status(200).json(user);
    }
  }
  res.status(404).json("No such user");
});

app.put("/image", (req, res) => {
  const { userId, imageUrl, colors } = req.body;
  const result = new Result(imageUrl, colors);

  for (let user of database.users) {
    if (user.user_id === userId) {
      user.results.push(result);

      return res.status(200).json(user);
    }
  }
  res.status(400).json("Not found");
});

app.listen(8080, () => {
  console.log("app is running on port 8080");
});
