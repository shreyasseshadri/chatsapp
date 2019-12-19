var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
// const expressValidator = require("express-validator");
var cors = require('cors')
const dotenv = require("dotenv");
dotenv.config();

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: 30, // Retry up to 30 times
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true
}


const connectWithRetry = () => {
  console.log('MongoDB connection with retry')
  mongoose.connect(process.env.MONGO_LOC, options).then(()=>{
  console.log('MongoDB is connected')
  }).catch(err=>{
    console.error(err);
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
    setTimeout(connectWithRetry, 5000)
  })
}

// connectWithRetry()
console.log(process.env.MONGO_LOC)
mongoose.connect(process.env.MONGO_LOC, {useNewUrlParser: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

require("./config/passport")(passport);
var app = express();
const httpServer = require('http').Server(app);
require("express-ws")(app,httpServer);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "secret",
  saveUninitialized: true,
  resave: true,
  cookie: {secure:false}
}));
// app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, credentials");
  if ("OPTIONS" === req.method) {
      res.sendStatus(200);
  } else {
      next();
  }
});
app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require('./routes/index');
var registerRouter = require('./routes/register');
var authRouter = require("./routes/auth");
var infoRouter = require("./routes/info");
var messageRouter = require("./routes/message");

app.use('/message',messageRouter);
app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/auth',authRouter);
app.use('/self',infoRouter);

// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
  if(err)console.log(err);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {'app':app,'httpServer':httpServer};
