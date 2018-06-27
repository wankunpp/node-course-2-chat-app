require('../config/main/config');

const path = require("path");
const http = require("http");
const express = require("express");
const socketID = require("socket.io");
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
const room = require("../routes/room");
const chat = require("../routes/chat");

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
app.use("/room", room);
app.use("/chat", chat);

//socket io
const io = socketID(server);
const users = new Users();

io.on("connection", socket => {
  console.log("new user connected");

  socket.on("join", (params, callback) => {
    const room = params.room.toUpperCase();

    if (!isRealString(params.name) || !isRealString(room)) {
      return callback("name and room name are required");
    } else if (users.getUserList(room).includes(params.name)) {
      return callback(
        "this name is already used in this room, please use another name"
      );
    }

    socket.join(room);

    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, room);

    io.to(room).emit("updateUserList", users.getUserList(room));
    io.emit("updateActivatedRoom", users.getRoomList());

    socket.emit(
      "newMessage",
      generateMessage("Admin", `Welcome to Room ${room}`)
    );
    socket.broadcast
      .to(room)
      .emit(
        "newMessage",
        generateMessage("Admin", `${params.name} has joined`)
      );

    callback();
  });

  socket.on("createMessage", (message, callback) => {
    callback();
    const user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      socket.emit("newMessage", generateMessage("Me", message.text));
      socket.broadcast
        .to(user.room)
        .emit("newMessage", generateMessage(user.name, message.text));
    }
  });

  socket.on("createLocationMessage", coords => {
    const user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "newLocationMessage",
        generateLocaitonMessage(user.name, coords.latitude, coords.longtitude)
      );
    }
  });

  socket.on("disconnect", () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Admin", `${user.name} has left the room`)
      );
    }
  });

  socket.emit("updateActivatedRoom", users.getRoomList());
});

server.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
