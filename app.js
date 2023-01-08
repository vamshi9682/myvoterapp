/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const { Admin, elections } = require("./models");
const bodyParser = require("body-parser");
const connectEnsureLogin = require("connect-ensure-login");
const LocalStrategy = require("passport-local").Strategy;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const saltRounds = 10;
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser("Some secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "my-super-secret-key-2837428907583420",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Admin.findOne({ where: { email: username } })
        .then(async function (Admin) {
          const result = await bcrypt.compare(password, Admin.password);
          if (result) {
            return done(null, Admin);
          } else {
            return done(null, false);
          }
        })
        .catch((error) => {
          return done(null, false);
        });
    }
  )
);
passport.serializeUser((user, done) => {
  console.log("Serializing user in session", Admin.id);
  done(null, Admin.id);
});
passport.deserializeUser((id, done) => {
  Admin.findByPk(id)
    .then((Admin) => {
      done(null, Admin);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async function (request, response) {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.Admin);
    response.redirect("/elections");
  }
);

app.get("/elections", async (request, response) => {
  console.log("elections are live");
});

app.post("/Admin", async (request, response) => {
  try {
    const admin = await Admin.create({
      name: request.body.userName,
      email: request.body.email,
      password: request.body.password,
    });
    response.redirect("/elections");
  } catch (error) {
    console.log(error);
    return response.redirect("/signup");
  }
});

module.exports = app;
