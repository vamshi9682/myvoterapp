/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
app.use(express.json({ extended: true }));
const bodyParser = require("body-parser");

const path = require("path");
const passport = require("passport");
const connectEnsureLogin = require("path");
const session = require("express-session");
const LocalStrategy = require("passport-local");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  })
);

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
        .then(async function (user) {
          const result = await bcrypt.compare(password, admin.password);
          if (result) {
            return done(null, admin);
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
  console.log("Serializing user in session", admin.id);
  done(null, admin.id);
});
passport.deserializeUser((id, done) => {
  Admin.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

const { Admin, elections } = require("./models");

app.get("/", async function (request, response) {
  response.render("index", {
    title: "Todo application",
  });
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "login" });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  function (request, response) {
    console.log(request.admin);
    response.redirect("/elections");
  }
);

app.post("/elections", async (request, response) => {
  try {
    const name = await elections.create({
      name: request.body.userName,
    });
  } catch (err) {
    console.log(err);
  }
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
