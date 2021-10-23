const handleImage = (db) => (req, res) => {
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
};

module.exports = {
  handleImage,
};
