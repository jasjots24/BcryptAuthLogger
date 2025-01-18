if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const initialize = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const user = [];

initialize(
    passport,
    email => user.find(user => user.email === email),
    id => user.find(user => user.id === id)
);

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Fixed typo
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", checkAuthenticated, (req, res) => {
    console.log(req.method, req.url);
    res.render("index.ejs", { name: req.user.name });
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post(
    "/login",
    notCheckAuthenticated,
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })
);

app.get("/register",  (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(user);
});

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

// Middleware functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function notCheckAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Your server started at http://localhost:${port}`);
});
