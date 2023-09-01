const jwt = require("jsonwebtoken");
const userdb = require("../models/UserSchema");
const dotenv = require('dotenv');

dotenv.config();

const authenticate = async(req, res, next) => {
    try {
        // genarate auth token
        const token = req.headers.authorization;
        // console.log("token:", token);


        // varify token
        const verifytoken = jwt.verify(token, process.env.keysecret);
        // console.log(verifytoken);


        const rootUser = await userdb.findOne({ _id: verifytoken._id })
            // console.log(rootUser);


        if (!rootUser) { throw new Error("user not found") }

        req.token = token
        req.rootUser = rootUser
        req.userId = rootUser._id
        req.user = verifytoken

        next();

    } catch (error) {

        res.status(401).json({ status: 401, message: "Unauthorized no token provide" })
    }
}

module.exports = authenticate;