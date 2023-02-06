/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
const flash = require("connect-flash");
const { Admin, elections, questions, options, voter } = require("./models");
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
const Tokens = require("csrf");
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
    const loggedInUserName = Admin.findByPk(loggedInUser);
    const getElections = await elections.getElections(loggedInUser);
    const ongoingElections = await elections.ongoing(loggedInUser);
    const completedElections = await elections.completed(loggedInUser);

    if (request.accepts("html")) {
      response.render("election", {
        title: "Welcome",
        loggedInUser,
        loggedInUserName,
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
app.delete(
  "/elections/:ElectionId",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const aid = request.user.id;
    const eid = request.params.ElectionId;
    try {
      elections.deleteelec(eid, aid);
      return response.json(true);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);
app.get(
  "/elections/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    response.render("electionnew", { csrfToken: request.csrfToken() });
  }
);

app.post(
  "/elections/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
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
  }
);

app.get(
  "/elections/:ElectionId/questions",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var elecid = request.params.ElectionId;
      const ques = await questions.findAll({
        where: {
          ElectionId: elecid,
        },
      });
      return response.render("electionpreview", {
        elecid,
        ques,
        csrfToken: request.csrfToken(),
      });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get(
  "/elections/:ElectionId/voters",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var elecid = request.params.ElectionId;
      const vo = await voter.findAll({
        where: {
          ElectionId: elecid,
        },
      });
      console.log(elecid, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      return response.render("voter", {
        elecid,
        vo,
        csrfToken: request.csrfToken(),
      });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/elections/:ElectionId/voters",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var eid = request.params.ElectionId;
      await voter.create({
        VoterId: request.body.voterid,
        password: request.body.password,
        ElectionId: eid,
      });
      console.log(eid);
      return response.redirect("/elections/" + eid + "/voters");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);
app.delete(
  "/elections/:ElectionId/voters/:VoterId",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      var eid = request.params.ElectionId;
      var vid = request.params.VoterId;
      await voter.destroy({
        where: {
          id: vid,
          ElectionId: eid,
        },
      });
      return response.json(true);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/elections/:ElectionId",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const elec = await elections.findByPk(request.params.ElectionId);
    try {
      const updateelec = await elec.setLaunchStatusTrue();
      console.log(updateelec);
      return response.redirect("/elections/" + updateelec.id + "/vote");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/elections/:ElectionId/vote", async (request, response) => {
  try {
    var eid = request.params.ElectionId;
    var voterques = await questions.FindQues(eid);
    console.log(voterques);
    return response.render("votingpage", {
      voterques,
      eid,
      csrfToken: request.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/elections/:ElectionId/live", async (request, response) => {
  try {
    var eid = request.params.ElectionId;
    var voterques = await questions.FindQues(eid);
    const quesoption = [];
    for (i = 0; i < voterques.length; i++) {
      const quesoptions = await options.findAll({
        where: {
          QuestionId: voterques[i].id,
        },
      });
      quesoption.push(quesoptions);
      console.log(quesoptions);
    }
    return response.render("electionslive", {
      voterques,
      eid,
      quesoption,
      csrfToken: request.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post(
  "/elections/:ElectionId/questions/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var eid = request.params.ElectionId;
      await questions.create({
        question: request.body.name,
        desription: request.body.description,
        ElectionId: eid,
      });
      console.log(eid);
      return response.redirect("/elections/" + eid + "/questions");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/elections/:ElectionId/questions/:QuestionId/options",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var eid = request.params.ElectionId;
      var qid = request.params.QuestionId;
      await options.create({
        optionname: request.body.optionname,
        QuestionId: qid,
      });
      console.log(eid);
      return response.redirect(
        "/elections/" + eid + "/questions/" + qid + "/options"
      );
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get(
  "/elections/:ElectionId/questions/:QuestionId/options",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    var eid = request.params.ElectionId;
    var qid = request.params.QuestionId;
    var ques = await questions.findByPk(qid);
    const option = await options.FindOptionsTOQuestions(qid);
    console.log(option);
    return response.render("creatingoptions", {
      qid,
      ques,
      eid,
      option,
      csrfToken: request.csrfToken(),
    });
  }
);

app.delete(
  "/elections/:ElectionId/questions/:QuestionId/options/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      var oid = request.params.id;
      var eid = request.params.ElectionId;
      var qid = request.params.QuestionId;
      await options.destroy({
        where: {
          id: oid,
          QuestionId: qid,
        },
      });
      return response.json(true);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/elections/:ElectionId/questions/:QuestionId",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      var qid = request.params.QuestionId;
      questions.deleteques(qid);
      return response.json(true);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get(
  "/elections/:ElectionId/questions/new",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    var eid = request.params.ElectionId;
    response.render("createquestion", { eid, csrfToken: request.csrfToken() });
  }
);

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
