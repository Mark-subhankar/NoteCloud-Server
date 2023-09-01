const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// here i use mongodb atlas url, where notebook project User is - {process.env.Db_User}  & password is - {process.env.Db_Password}
const db = `mongodb+srv://${process.env.Db_User}:${process.env.Db_Password}@cluster0.b30g7kp.mongodb.net/notebook`;

mongoose
    .connect(db, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
        console.log(err);
    });