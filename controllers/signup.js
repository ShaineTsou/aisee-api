const handleSignup = (db, bcrypt) => (req, res) => {
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
};

module.exports = {
  handleSignup,
};
