require('../config/main/config');

const path = require("path");
const http = require("http");
const express = require("express");
const sockets = require('./socket');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

const { generateMessage, generateLocaitonMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const index = require("../routes/index");
const home = require("../routes/home");
const roomChat = require("../routes/room-chat");
const privateChat  = require("../routes/private-chat");
const userProfile = require("../routes/user-profile");

const publicPath = path.join(__dirname, "..", "public");
const port = process.env.PORT;

//init app
const app = express();
const server = http.createServer(app);

//set static folder
app.use(express.static(publicPath));

//set View Engine
app.set("view engine", "ejs");

//set bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Express Session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

//set passport
app.use(passport.initialize());
app.use(passport.session());

//connect Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  res.locals.error = req.flash("error");
  next();
});

//use routes
app.use("/", index);
app.use("/home", home);
app.use("/room-chat", roomChat);
app.use("/private-chat",privateChat);
app.use("/user-profile", userProfile);

//socket io
sockets.init(server);

server.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
