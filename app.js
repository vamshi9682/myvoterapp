const express = require("express");
const app = express();
app.set("view engine", "ejs");
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
module.exports = app;
