require('dotenv').config()
const reload = require("reload");

const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

const authentication = require('./authentication');
const util = require('./util');

const { allocate, status, deallocate, move } = require("./allocations.js");

app.set("view engine", "ejs");
app.use("/s", express.static("static", {}));

// Authentication

authentication.setupAuthentication(app);

app.get("/login", (req, res) => {
  res.render("login.ejs", {
    loggedInUserAvatar: null,
    loggedInUserEmail: null,
    domain: process.env.KOMORANAI_DOMAIN,
  });
});

app.post("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

reload(app);

// User-visible paths

app.get("/", authentication.checkAuthenticated, (req, res) => {
  const details = util.getLoggedInUserDetails(req);
  const data = {};
  util.addLoggedInUserDetails(data, req);
  res.render("home", data);
});

// Invisible paths

app.get("/status", authentication.checkAuthenticated, (req, res) => {
  res.status(200).json(status()).end();
});

app.get(
  "/book/:deskId/:userId/:userAvatar",
  authentication.checkAuthenticated,
  (req, res) => {
    allocate(req.params.deskId, req.params.userId, req.params.userAvatar);
    res.status(200).end();
  }
);

app.get("/unbook/:deskId", authentication.checkAuthenticated, (req, res) => {
  deallocate(req.params.deskId);
  res.status(200).end();
});

app.get(
  "/move/:userId/:userAvatar/:oldDeskId/:newDeskId",
  authentication.checkAuthenticated,
  (req, res) => {
    move(
      req.params.userId,
      req.params.userAvatar,
      req.params.oldDeskId,
      req.params.newDeskId
    );
    res.status(200).end();
  }
);