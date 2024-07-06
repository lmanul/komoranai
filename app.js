require('dotenv').config()

const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

const authentication = require('./authentication');
const util = require('./util');

app.set('view engine', 'ejs');
app.use('/s', express.static('static', {}));

// Authentication

authentication.setupAuthentication(app);

app.get("/login", (req, res) => {
  res.render("login.ejs", {
    'loggedInUserAvatar': null,
    'loggedInUserEmail': null,
    'domain': process.env.KOMORANAI_DOMAIN});
});

app.post("/logout", (req,res) => {
   req.logOut();
   res.redirect("/login");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

// User-visible paths

app.get('/', authentication.checkAuthenticated, (req, res) => {
  const details = util.getLoggedInUserDetails(req);
  const data = { };
  util.addLoggedInUserDetails(data, req);
  res.render('home', data);
});

// Invisible paths
