/*  EXPRESS */
const express = require('express');
const app = express();
const session = require('express-session');

// css fix
const ejs = require("ejs");
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
  res.render('home',{user: userProfile, data: jsonData});
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));


/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


/*  Google AUTH  */
import defaultExport, { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./client.js";

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //* Finding data: to add data or skip
    if (finding(profile.id, jsonData.UID)  == false)  {
      jsonData.Users.push(profile);
      jsonData.UID.push(profile.id);
    }
    const jsonString = JSON.stringify(jsonData);
    fs.writeFileSync("data.json", jsonString, "utf-8", (err) => {
      if (err) throw err;
      console.log("Data added to file");
    });
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/');
  });

  app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      console.log("Loged Out");
      userProfile = null;
      res.redirect('/');
    });
  });

// * Data
const fs = require("fs");
const data = fs.readFileSync("data.json");
const jsonData = JSON.parse(data);
    // * // Findting Things in JSON
function finding(value, data) {

  for (var i = 0; i < data.length; i++){
    if (data[i] == value){
      return true
    }
  }
  return false
}
// Each Event sub branch
app.get("/event/:UEID", (req, res) => {
  for (var i = 0; i < jsonData.Events.length; i++){
    if (jsonData.Events[i].UEID == req.params.UEID){
      eventDetails = jsonData.Events[i];
      break;
    }
  }
  
  res.render("event", { user: userProfile, event: eventDetails });
});

app.get("/add", function (req, res) {
  res.render("add");
});

app.post("/add", function (req, res) {
  console.log(req.body);
  console.log("Before Adding data", JSON.stringify(jsonData, null, 4));

  jsonData.Events.push(req.body);
  const jsonString = JSON.stringify(jsonData);

  fs.writeFileSync("data.json", jsonString, "utf-8", (err) => {
    if (err) throw err;
    console.log("Data added to file");
  });
  // const update_data = fs.readFileSync("data.json");
  // const updated_jsonData = JSON.parse(update_data);
  // console.log("After Adding data", JSON.stringify(updated_jsonData, null, 4));
  res.redirect("/add");
});