const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

module.exports = mongoose;
