const express = require("express");
const router = new express.Router();
const userdb = require("../models/UserSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middeware/authenticate");
const dotenv = require('dotenv');

dotenv.config();
// const Note =require("../models/NoteSchema")


// Note retated import file ===>
const Note = require("../models/NoteSchema");
const { validationResult, body } = require("express-validator");





// User SignUp 

router.post("/register", async(req, res) => {
    const { fname, email, password, cpassword } = req.body;

    //   check validation
    if (!fname || !email || !password || !cpassword) {
        res.status(422).json({ error: "please fill all the details" });
    }

    try {
        // ({ database_email: user_email }) check email exists in Mongodb database
        const preuser = await userdb.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This Email is Already Exist" });
        } else if (password !== cpassword) {
            res
                .status(422)
                .json({ error: "Password and Confirm Password Not Match" });
        } else {
            const finalUser = new userdb({
                fname,
                email,
                password,
                cpassword,
            });

            // here password hasing

            const storeData = await finalUser.save();

            // console.log(storeData);
            res.status(201).json({ status: 201, storeData });
        }
    } catch (error) {
        res.status(422).json(error);
        console.log("catch block error");
    }
});




// user login
router.post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        // Check validation
        if (!email || !password) {
            return res.status(422).json({ error: "Please fill all the details" });
        }

        // ({ database_email: user_email }) check email exists in Mongodb database
        const userValid = await userdb.findOne({ email: email });

        if (userValid) {
            const isMatch = await bcrypt.compare(password, userValid.password);

            if (!isMatch) {
                return res.status(422).json({ error: "Invalid Details" });
            }

            const token = await userValid.generateAuthToken();


            // token valid current time after 15 minutes
            res.cookie("usercookie", token, {
                expires: new Date(Date.now() + 9000000),
                httpOnly: true
            });

            const result = {
                userValid,
                token
            }

            return res.status(201).json({ status: 201, result });
        } else {
            return res.status(422).json({ error: "Invalid Details" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




// user validation api 
router.get("/validuser", authenticate, async(req, res) => {

    try {
        const validUserOne = await userdb.findOne({ _id: req.userId })

        res.status(201).json({ status: 201, validUserOne });
    } catch (error) {

        res.status(401).json({ status: 401, error });

    }
})





// user LogOut 
router.get("/logout", authenticate, async(req, res) => {
    try {
        req.rootUser.token = req.rootUser.tokens.filter((current) => {
            return current.token != req.token
        });

        res.header("Access-Control-Allow-Origin", `${process.env.HOST}`);
        res.header("Access-Control-Allow-Credentials", "true");
        res.clearCookie("usercookie", { path: "/" })

        res.rootUser.save();


        res.status(201).json(req.rootUser.tokens)

    } catch (error) {
        res.status(201).json({ status: 201, error })
    }
})



// Createing  Notes Router ================================>



//ROUTE 4: Get all the Notes using : GET " /api/auth/fetchallnotes".no login required

router.get("/fetchallnotes", authenticate, async(req, res) => {
    try {
        // const notes = await Note.find({ user: req.user.id });
        // console.log(req.userId);
        const notes = await Note.find({ user: req.userId });

        notes.forEach(note => {
            // console.log("Note:", note);
            // console.log("Associated User ID:", note.user);
        });


        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send("internal server Error");
    }
});

//ROUTE 5: Add a new note using : POST " /api/auth/addnotes".no login required

router.post(
    "/addnotes",
    authenticate, [
        // check validation
        body("title", "enter a valid title").isLength({ min: 3 }),
        body("description", "description must be atleast 5 characters").isLength({
            min: 5,
        }),
    ],
    async(req, res) => {
        try {
            const { title, description, tag } = req.body; // distructring
            //if there are error,return bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title,
                description,
                tag,
                user: req.userId,
            });
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("internal server Error");
        }
    }
);

//ROUTE 6: Update an existing Note using : PUT " /api/auth/updatenote". login required

router.put("/updatenote/:id", authenticate, async(req, res) => {
    try {
        const { title, description, tag } = req.body; // distructring

        const newNote = {}; // create note object
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        //Find the note to be Update and Update it          
        let note = await Note.findById(req.params.id); // url get by id

        // console.log(req.params.id);
        if (!note) {
            return res.status(404).send("not found");
        }


        //Allow Update only if user owns this note
        if (note.user.toString() !== req.userId.toString()) {
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndUpdate(
            req.params.id, { $set: newNote }, { new: true }
        );
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error");
    }
});

//ROUTE 7: Delete an existing Note using : DELETE " /api/auth/deletenote". login required

router.delete("/deletenote/:id", authenticate, async(req, res) => {
    try {
        const { title, description, tag } = req.body; // distructring

        const newNote = {}; // create note object
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        //Find the note to be delete and delete it
        let note = await Note.findById(req.params.id); // url get by id
        if (!note) {
            return res.status(404).send("not found");
        }

        //Allow delete only if user owns this note
        if (note.user.toString() !== req.userId.toString()) {
            return res.status(401).send("not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ Success: "Note has been successfully deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server Error");
    }
});





module.exports = router;