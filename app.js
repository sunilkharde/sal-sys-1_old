import express from "express";
import pool from './db.js';
import cookieParser from "cookie-parser";
import { join } from 'path';
import favicon from 'serve-favicon';
import authRoute from "./routes/authRoutes.js";
import exphbs from 'express-handlebars';
import authController from "./controller/authController.js";
import productRoute from "./routes/productRoutes.js";
import hbs from 'hbs';


//import session from 'express-session';
//import verifyToken from "./controller/verifyToken.js";

const app = express();
//const PORT = 3000;

// uncomment after placing your favicon in /public
app.use(favicon(join(process.cwd(), 'public/favicon.ico')));
//app.use(favicon(join(process.cwd(),'public/images/favicon.ico')));
//console.log(`Favcon Path : ${join(process.cwd(), 'public/favicon.ico')}`);

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(process.cwd(), 'public')));


//start-define custome helpers //Use === value match, == string match
const eqHBS = function (a, b) {
  return a == b;
};
const isEqualsHBS = function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};
const isEqualHelperHandlerbar = function (variable, value, options) {
  if (variable == value) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

// view engine setup
app.set('views', join(process.cwd(), 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: join(process.cwd(), '/views/layouts/'),
  partialsDir: join(process.cwd(), '/views/partials'),
  helpers: {
    isEqual: isEqualHelperHandlerbar,
    isEquals: isEqualsHBS,
    eq: eqHBS
  }
}));

// Load auth routes
app.use('/auth', authRoute);
app.use('/', authController.checkToken); //chekToken applicable all follwoing routes
app.use('/product', productRoute);


// Temp Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home', message: 'Welcome, to app!'});
});
app.get('/about', async (req, res) => {
  res.render('error', { title: 'Error' });
});

app.all('*', (req, res) => {
  res.status(404).send("<h1>Page not found!!!</h1>");
});

//**************************************//
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});
/*app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/