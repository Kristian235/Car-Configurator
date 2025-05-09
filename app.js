const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport");
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    bcrypt = require("bcrypt"),
    jwt = require("jsonwebtoken");

const User = require("./model/User");
const { nextTick } = require("process");
const cookieParser = require("cookie-parser");
const secretKey = "abcdef12345";
let app = express();

mongoose.connect("mongodb://localhost/27017");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "f24151gdsg3214r",
    resave: false,
    saveUninitialized: false
}))

app.use(cookieParser());

app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Showing Home Page
app.get("/", (req, res) => {
    const inWheel = "in-wheel.png";
    const wheel = "wheel.png";
    const engine = "engine.png";
    res.render("home", { inWheel, wheel, engine });
    res.status(200);
});

//Showing Secret Page
app.get("/secret", isLoggedIn, (req, res) => {
    const inWheel = "in-wheel.png";
    const wheel = "wheel.png";
    const engine = "engine.png";
    res.render("secret", { inWheel, wheel, engine });
});

//Showing Register Form
app.get("/register", (req, res) => {
    res.render("register");
});

//Handling User SignUp
app.post("/register", async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password
    });

    return res.status(200).json(user);
})

// Showing login form
app.get("/login", async function (req, res) {
    res.render("login");
});

//Handling User Login
app.post("/login", async function (req, res) {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user) {
            const isValid = await bcrypt.compare(req.body.password, user.password);
            if (isValid) {
                const token = jwt.sign({
                    username: user
                }, secretKey, { expiresIn: "1h" });
                console.log(token);            

                jwt.verify(token, 'abcdef12345', (err, decoded) => {
                    if (err) {
                        console.log('Token is invalid');
                    } else {
                        console.log('Decoded Token:', decoded);
                    }
                });

                res.cookie("access_token", token, {
                    httpOnly: true
                }).status(200);

                const inWheel = "in-wheel.png";
                const wheel = "wheel.png";
                const engine = "engine.png";
                res.render("secret", { inWheel, wheel, engine });
            } else {
                res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
})

//Logout
app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.clearCookie("access_token");
        res.status(200);
        res.redirect("/");
    })
});

//Logged In
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});