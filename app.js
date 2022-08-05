require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

//database connectio
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//passport setup
const encrypt = require("mongoose-encryption");



mongoose.connect("mongodb://localhost:27017/BikeRentalDB");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



const userSchema = new mongoose.Schema({
  username: String,
  password: String
});


//here we can specify to only encrypt the password
userSchema.plugin(encrypt, { secret: process.env.secret, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

const bikeSchema = new mongoose.Schema ({
  firstName: {
    type: String,
    required: [true, "Tilføj navn"]
  },
  lastName: {
    type: String,
    required: [true, "Tilføj efternavn"]
  },
  email: {
    type: String,
    required: [true, "Tilføj email"]
  },
  phone: {
    type: Number,
    required: [true, "Tilføj telefon nummer "]
  },
  land: {
    type: String,
    required: [true, "Tilføj land"]
  },
  adresse: {
    type: String,
    required: [true, "Tilføj adresse"]
  },
  postKode: {
    type: Number,
    min: 1000,
    max: 9990,
    required: [true, "Tilføj dit postnummer"]
  },
  bike: {
    type: String,
    required: [true, "Tilføj en cykel"]
  }
});

const BikeRentals = mongoose.model("BikeRental", bikeSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.post("/", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({username: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else if(!foundUser){
      res.redirect("/register");
    }else {
      if(foundUser){
        if(foundUser.password === password){
          res.redirect("/orders");
        }
      }
    }
  });
});

app.get("/button", function(req, res){
  res.redirect("/register");
});

app.get("/rent", function(req, res){
  res.render("rent");
});

app.post("/rent", function(req, res){
  const newBikeRental = new BikeRentals ({
    firstName: req.body.Fname,
    lastName: req.body.Lname,
    email: req.body.Email,
    phone: req.body.Tel,
    land: req.body.Land,
    adresse: req.body.Adresse,
    postKode: req.body.PostKode,
    bike: req.body.Bike
  });
  newBikeRental.save(function(err){
    if(!err){
      res.redirect("/orderCompleted");
    } else {
      console.log("Err");
    }
  });
});

app.get("/orderCompleted", function(req, res){
  res.render("orderCompleted");
});

app.get("/orders", function(req, res){
    //mongoose encrypt will decrypt the password
    BikeRentals.find({}, function(err, foundResults){
      res.render("orders", {
        foundResults: foundResults
      });
    });
});

// app.get("/logout", function(req, res){
//   req.logout(function(err){
//     if(err){
//       console.log(err);
//     } else{
//       res.redirect("/");
//     }
//   });
// });

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;

  BikeRentals.findByIdAndRemove(checkItemId, function(err){
    if(!err){
      console.log("succesfully deleted");
    } else {
      console.log(err);
    }
    res.redirect("/orders");
  });
});



app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  //Here mongoose encrypt will encrypt the password
  user.save(function(err){
    if(err){
      console.log(err);
    }else {
      res.redirect("/orders");
    }
  });
})

app.listen(3000, function() {
  console.log("server running on port 3000");
});
