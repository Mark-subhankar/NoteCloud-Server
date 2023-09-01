const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keysecret = "subhankar@note";

const UserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }, ],
});

// Hash password
UserSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
        next();
    }
});


// token generate
UserSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({ _id: this._id }, keysecret, {
            expiresIn: "1d",
        });

        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (error) {
        throw new Error(error.message); // Throw the error instead of responding here
    }
};

// Creating model
const userdb = mongoose.model("user", UserSchema);

module.exports = userdb;