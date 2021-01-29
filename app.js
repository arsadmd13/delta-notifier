const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = require('./src/config/db').MongoURI;
require("dotenv").config();

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => console.log("DB Connected!"));

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public/"));

require("./src/routes/heroku.route")(app);
require("./src/routes/netlify.route")(app);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is up and running!");
})