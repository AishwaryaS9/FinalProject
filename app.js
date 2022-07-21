const express = require('express'),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    User = require("./models/User"),
    Course = require("./models/Course"),
    Task = require("./models/Task");
const request = require('request');


app.use(bodyParser.urlencoded({ extended: false }));


var path = require('path')
app.use(express.static('public'));
var Router = require('router');


//Connecting database
const dotenv = require("dotenv");
const {
    render
} = require('ejs');
dotenv.config();
const port = process.env.PORT || 3000;
const DB_CONNECT = "mongodb+srv://aishwarya:aish123@cluster0.awqn4.mongodb.net/LMS_DB?retryWrites=true&w=majority";

mongoose
    .connect(DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((res) => app.listen(port, () => console.log(`server running on port:${port}`)))
    .catch((err) => console.log(err));

app.use(express.urlencoded({
    extended: true
}));

app.use(
    require("express-session")({
        secret: "Lets make the project",
        resave: false,
        saveUninitialized: false,
    })
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    let authe = "";
    if (req.isAuthenticated()) authe = "logged";
    else authe = "logout";

    res.render("home", {
        auth: authe
    });
});

app.get("/userprofile", isLoggedIn, (req, res) => {
    res.render("userprofile", {
        userdetails: req.user
    });
});

//Auth Routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.post(
    "/login",
    passport.authenticate("local", {

        successRedirect: "/",
        failureRedirect: "/login",

    }), function (req, res) {

    }
);

app.post(
    "/login",
    passport.authenticate("local", {

        successRedirect: "/",
        failureRedirect: "/login",

    }), function (req, res) {

    }
);


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register(
        new User({
            fullname: req.body.fullname,
            username: req.body.username,
            password: req.body.password,
            phone: req.body.phone,
            email: req.body.email,
            role: req.body.role,
            language: req.body.language,
            image: req.body.image

        }),
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.render("register");
            }
            passport.authenticate("local")(req, res, function () {
                res.redirect("/login");
            });
        }
    );
});


app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}






app
    .route("/edit/:id")
    .get((req, res) => {
        const id = req.params.id;
        User.find({}, (err, user) => {
            res.render("userprofile.ejs", {
                userdetails: user,
                idUser: id
            });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        User.findByIdAndUpdate(
            id, {
            fullname: req.body.fullname,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            language: req.body.language,


        },
            (err) => {
                if (err) return res.send(500, err);
                res.redirect("/userprofile");
            }
        );
    });

app.get("/task", isLoggedIn, (req, res) => {
    Task.find({}, (err, tasks) => {
        res.render("task.ejs", {
            Tasks: tasks
        });
    });
});

app.post("/task", isLoggedIn, async (req, res) => {
    let ch;

    if (req.body.comp == "on") ch = "Completed";
    else if (req.body.comp == "off") ch = "Not Completed";
    const todoTask = new Task({

        content: req.body.content,
        iscomplete: ch,

    });

    try {
        await todoTask.save();
        res.redirect("/task");
    } catch (err) {
        console.log(err);
        res.redirect("/task");
    }
});

app
    .route("/task/edit/:id")
    .get((req, res) => {
        const id = req.params.id;
        Task.find({}, (err, tasks) => {
            res.render("taskedit.ejs", {
                Tasks: tasks,
                idTask: id
            });
        });
    })

    .post((req, res) => {

        let checkbox;
        if (req.body.comp1 == "on") checkbox = "Completed";
        else if (req.body.comp1 == "off") checkbox = "Not Completed";
        else checkbox = "Completed";



        // if (req.body.comp1 == "on") checkbox = "Completed";
        // else checkbox = "Not Completed";
        const id = req.params.id;
        Task.findByIdAndUpdate(id, {
            content: req.body.content,
            iscomplete: checkbox,
        }, (err) => {
            if (err) return res.send(500, err);
            res.redirect("/task");
        });
    });



app.route("/task/remove/:id").get((req, res) => {
    const id = req.params.id;
    Task.findByIdAndRemove(id, (err) => {
        if (err) return res.send(500, err);
        res.redirect("/task");
    });
});


app.get("/course", isLoggedIn, (req, res) => {
    Course.find({}, (err, courses) => {
        res.render("course.ejs", {
            Courses: courses
        });
    });
});