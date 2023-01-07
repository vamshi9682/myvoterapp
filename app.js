const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.get("/", async function (request, response) {
  response.render("index", {
    title: "Todo application",
  });
});
module.exports = app;
