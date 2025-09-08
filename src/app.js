var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var userRouter = require('../routes/user');
var adminRouter = require('../routes/admin');
var fileUpload = require('express-fileupload');
var db = require('../config/connection');
var session = require('express-session');
var http = require('http');
var debug = require('debug')('node.js:server');
var jwt=require("jsonwebtoken");
var  bcrypt=require("bcrypt");
const dotenv = require("dotenv");
const MongoStore=require("connect-mongo");

dotenv.config();


// Initialize the Express app
var app = express();
app.use(fileUpload());
  
// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ 
  extname: 'hbs', 
  defaultLayout: 'Layout', 
  layoutsDir: __dirname + '/views/layouts/', 
  partialsDir: __dirname + '/views/partials/',
  helpers:{
    eq:(a,b)=>a===b
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: 'shopping',
      collectionName: 'sessions',
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Database connection
db.connect((err) => {
  if (err) console.log("Connection error: ", err);
  else console.log("Database connected");
});

// Route handling
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

/**
 * Set up server to listen on the correct port.
 */

// Get the port from environment variables or use default
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Create HTTP server
var server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val; // named pipe
  }
  if (port >= 0) {
    return port; // port number
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

