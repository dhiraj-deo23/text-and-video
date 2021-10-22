const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const hbs = require("express-handlebars");
const userRouter = require("./src/router/user");
const friendRouter = require("./src/router/friend");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const { addUser, removeUser } = require("./src/helpers/helper");

//connecting to database
require("./src/db/mongoose");
//using passport strategy
require("./src/middleware/localStrategy");

//creating server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

//handlebar settings
const { toString } = require("./src/helpers/helper");
app.engine(
  "hbs",
  hbs({ extname: "hbs", defaultLayout: "main", helpers: { toString } })
);
app.set("view engine", "hbs");

//body parsing middlewares
const publicDirectory = path.join(__dirname, "public");
app.use(cors());
app.use(express.static(publicDirectory));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//session settings
app.use(
  session({
    secret: "holy cow",
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);

//passport setup
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash());

//routers
app.use(userRouter);
app.use(friendRouter);

//socket io connection
io.on("connection", (socket) => {
  console.log("New Client connected!");

  //checking online by broadcasting userIds and checking against friendIds in client side
  socket.on("userId", (userId) => {
    addUser({ id: socket.id, userId });
    io.emit("clientId", userId);
  });

  //joining the room for secure messaging with friend
  socket.on("join", (roomId, callback) => {
    socket.join(roomId);
    callback("online");
    socket.on("message", (message) => {
      socket.broadcast.to(roomId).emit("sentMessage", message);
    });
  });

  //user disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      socket.emit("offlineUser", user.userId);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
