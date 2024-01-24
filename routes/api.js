var express = require('express');
var router = express.Router();
var pug = require('pug');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../models/User");
const Chat = require("../models/Chat");

router.get('/user/register', function(req, res, next) {
    let template = pug.compileFile('views/register.pug');
    let markup = template({ error_message: "" });
    res.send(markup);
});

router.post('/user/register', function(req, res, next) {
    User.findOne({ email: req.body.email }).then((email)=>{
        if(email) {
            let template = pug.compileFile('views/register.pug');
            let markup = template({ error_message: "Email already in use" });
            return res.send(markup);
        } else {
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    new User({
                        user_name: req.body.username,
                        email: req.body.email,
                        password: hash,
                        is_admin: false,
                        images: [],
                        chat_ids: []
                    }).save().then(()=>{
                        let template = pug.compileFile('views/login.pug');
                        let markup = template();
                        return res.send(markup);
                    }).catch((err)=>{
                        console.log(err);
                        let template = pug.compileFile('views/register.pug');
                        let markup = template({ error_message: "Username already in use" });
                        return res.send(markup);
                    });
                });
            });  
        }
    }).catch((err)=>{console.log(err); return next(err); });
});

router.get('/user/login', function(req, res, next) {
    let template = pug.compileFile('views/login.pug');
    let markup = template({ error_message: "" });
    res.send(markup);
});

router.post('/user/login', function(req, res, next) {
    User.findOne({ email: req.body.email }).then((user)=>{
        if(!user) {
            let template = pug.compileFile('views/login.pug');
            let markup = template({ error_message: "Invalid credentials" });
            return res.send(markup);
        } else {
            bcrypt.compare(req.body.password, user.password, function(err, matches) {
                if(err) throw err;
                if(matches) {
                    const jwt_payload = {
                        id: user._id,
                        email: user.email
                    }
                    jwt.sign(
                        jwt_payload,
                        process.env.SECRET,
                        {
                        expiresIn: 120
                        },
                        (err, token) => {
                            if(err) throw err;
                            res.json({success: true, token, email: user.email});
                            
                            let template = pug.compileFile('views/swipe.pug');
                            let markup = template();
                            res.send(markup);
                        }
                    );
                } else {
                    let template = pug.compileFile('views/login.pug');
                    let markup = template({ error_message: "Invalid credentials" });
                    return res.send(markup);
                }
            });
        }
    }).catch((err)=>{console.log(err); return next(err); });
});

module.exports = router;