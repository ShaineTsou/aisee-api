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

const handleProfile = (db) => (req, res) => {
  const { userId } = req.params;

  db.select("*")
    .from("results")
    .innerJoin("colors", "results.result_id", "colors.result_id")
    .where("results.user_id", userId)
    .then((result) => {
      if (result.length) {
        const nestedResultsObj = getNestedResultsArray(result);
        return res.status(200).json(nestedResultsObj);
      }
      return res.status(200).json(result);
    })
    .catch((err) => res.status(400).json("Not found"));
};

module.exports = {
  handleProfile,
};
