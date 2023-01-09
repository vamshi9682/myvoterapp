/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
const flash = require("connect-flash");
const { Admin, elections, questions } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
var cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
app.use(cookieParser("ssh! some secret string"));
app.set("view engine", "ejs");
const path = require("path");
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
const LocalStrategy = require("passport-local");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(flash());
app.use(
  session({
    secret: "my-secret-super-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(function (request, response, next) {
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
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Invalid Email-Id" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
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

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect("/elections");
  }
);

app.get(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const loggedInUserName = request.user.usernameField;
    const getElections = await elections.getElections(loggedInUser);
    const ongoingElections = await elections.ongoing(loggedInUser);
    const completedElections = await elections.completed(loggedInUser);

    if (request.accepts("html")) {
      response.render("election", {
        title: "Welcome",
        loggedInUser,
        getElections,
        ongoingElections,
        completedElections,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        getElections,
        ongoing,
        completed,
      });
    }
  }
);

app.get("/elections/new", function (req, res) {
  res.render("electionnew", { csrfToken: req.csrfToken() });
});

app.post("/elections/new", async (request, response) => {
  try {
    const elec = await elections.create({
      name: request.body.electionname,
      AdminId: request.user.id,
    });
    console.log(request.user.id);
    return response.redirect("/elections");
  } catch (err) {
    console.log(err);
    request.flash("error", err.message);
  }
});

app.get("/elections/:ElectionId", async function (request, response) {
  try {
    const ques = await questions.FindAllQuestions();
    console.log(ques);
    return response.render("electionpreview", {
      ques,
      csrfToken: request.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/Admin", async (request, response) => {
  try {
    const hashedpwd = await bcrypt.hash(request.body.password, saltRounds);
    const admin = await Admin.create({
      name: request.body.userName,
      email: request.body.email,
      password: hashedpwd,
    });
    request.login(admin, (err) => {
      if (err) {
        console.log(err);
        response.redirect("/login");
      }
      response.redirect("/elections");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", error.message);
    return response.redirect("/signup");
  }
});

module.exports = app;
