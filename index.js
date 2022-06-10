'use strict';

const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({ path: 'variables.env' });
const cors = require('cors');
const moment = require('moment');

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

//Create Schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    required: true, 
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true, 
    max: new Date()
  }
})
const USERNAME = mongoose.model("USERNAME", userSchema);

app.get('/hello/:username', async function (req, res) {
  try {
    const userParams = await USERNAME.findOne({
      username: req.params.username
    })

    if (userParams) {
      const birthdate = userParams.dateOfBirth
      const today = moment().format('YYYY-MM-DD');
      const years = moment().diff(birthdate, 'years');
      const adjustToday = birthdate.toString().substring(5) === today.substring(5) ? 0 : 1;
      const nextBirthday = moment(birthdate).add(years + adjustToday, 'years');
      const daysUntilBirthday = nextBirthday.diff(today, 'days');

      if (daysUntilBirthday >= 365) {
          return res.json(
            {
              "message": "Hello, " + userParams.username + "! Happy birthday!"
            }
          )
      } else {
        return res.json(
          {
            "message": "Hello, " + userParams.username + "! Your birthday is in " + daysUntilBirthday + " day(s)"
          }
        )
      }
      
    } else {
      return res.status(404).json({'error': 'No USERNAME found'})
    }
  } catch (err) {
    console.log(err)
    res.status(500).json('Server error')
  }
})


app.put('/hello/:username', async function (req, res) {

  const username = req.params.username
  const dateOfBirth = req.body.dateOfBirth
  const checkDate = moment(dateOfBirth, 'YYYY-MM-DD')

  // fail if username is not letters only
  if (!/^[a-zA-Z]+$/.test(username)) {
    res.status(500).json({
      error: 'invalid USERNAME'
    })
  // fail if dateOfBirth is valid or in the future
  } else if (!checkDate.isValid() || checkDate.isAfter()) {
      res.status(500).json({
        error: 'invalid DATEOFBIRTH'
      })
  } else {
    try {
      // check if its already in the database
      let findOne = await USERNAME.findOne({
        username: username,
        dateOfBirth: dateOfBirth
      })
      if (findOne) {
        res.json({
          username: findOne.username,
          dateOfBirth: findOne.dateOfBirth
        })
      } else {
        // if its not exist yet then create new one and response with the result
        findOne = new USERNAME({
          username: username,
          dateOfBirth: dateOfBirth
        })
        await findOne.save()
        // res.json({
        //   username: findOne.username,
        //   dateOfBirth: findOne.dateOfBirth
        // })
        res.status(204).json('No content')
      }
    } catch (err) {
      console.error(err)
      res.status(500).json('Server error')
    }
  }
})




app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
})

module.exports = app










