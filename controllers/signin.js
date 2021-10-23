const handleSignin = (db, bcrypt) => (req, res) => {
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
};

module.exports = {
  handleSignin,
};
