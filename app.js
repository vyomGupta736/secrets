require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDatabase",{useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify : false});

const app = express();
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({
    extended : true
}));
app.use(express.static("public"));

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});


userSchema.plugin(encrypt,{ secret : process.env.SECRET, encryptedFields : ["password"] });

const USER = mongoose.model("users",userSchema);

app.get("/",(req,res) => {
    res.render("home");
})

app.get("/login",(req,res) => {
    res.render("login",{warning : ""});
})

app.get("/register",(req,res) => {
    res.render("register");
})

app.post("/login",(req,res) => {
    const email = req.body.username;
    const password = req.body.password;
    USER.findOne({email},(err,item) => {
        if(err)
        {
            console.log(err);
        }else if(item !==null)
        {
            if(item.password === password)
            {
                res.render("secrets");
            }
            else
            {
                res.render("login",{warning : "Either email or password is incorrect"});
            }
        }else
        {
            res.render("register");
        }
    })
});

app.post("/register",(req,res) => {
    const email = req.body.username;
    const password = req.body.password;
    const newUser = new USER({
        email : email,
        password : password
    });
    USER.findOne({email},(err,item) => {
        if(item === null)
        {
            newUser.save(() => {
                res.render("secrets")
            });
        }
        else
        {
            res.render("login",{warning : "you are already registered ! please login"});
        }
    });
});

app.listen(3000,(req,res) => {
    console.log("listening at port 3000");
});
