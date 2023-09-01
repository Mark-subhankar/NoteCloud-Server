const express = require("express");
const app = express()
const port = process.env.PORT || 8000;
require("./db/conn");
const router = require("./routes/router")
const cors = require("cors");
const cookiParser = require("cookie-parser");
// const path = require('path');
const dotenv = require('dotenv');

dotenv.config();





// app.get("/", (req, res) => {
//     res.status(201).json("server created")
// });

app.use(
    cors({
        origin: [`${process.env.HOST}`],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, // Allow credentials (cookies)
    })
);
app.use(express.json());
app.use(cookiParser())
app.use(cors());
app.use(router);


// hosting Builds ===========>
// app.use(express.static(path.join(__dirname, '../client/build')))

// app.get('*', function(rsq, res) {
//         res.sendFile(path.join(__dirname, '../client/build/index.html'));
//     })
// hosting Builds ===========>




app.listen(port, () => {
    console.log(`server start at port no: ${port}`);
})