import express from "express";
import pool from './db.js';
const conn = await pool.getConnection();

import cookieParser from "cookie-parser";
import { join } from 'path';
import favicon from 'serve-favicon';
import cors from 'cors';
import moment from 'moment';

import authRoute from "./routes/authRoutes.js";
import exphbs from 'express-handlebars';
import authController from "./controller/authController.js";
import productRoute from "./routes/productRoutes.js";
import customerRoute from "./routes/customerRoutes.js";
import poRoute from "./routes/poRoutes.js";


//import axios from 'axios';
//import hbs from 'hbs';
//import {  Loader  } from '@googlemaps/js-api-loader';
//import pkg from '@googlemaps/js-api-loader';
//const { Loader } = pkg;

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

app.use(cors());
app.use('/api', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//start-define custome helpers //Use === value match, == string match
const momentDMY_HBS = function (date, format) {
  if (typeof format === 'string') {
    return moment(date, format).format('DD-MM-YYYY');
    //return moment(date, format.toString()).format('YYYY-MM-DD');
  } else {
    return moment(date).format('DD-MM-YYYY');
  }
};
const momentYMD_HBS = function (date, format) {
  if (typeof format === 'string') {
    return moment(date, format).format('YYYY-MM-DD');
  } else {
    return moment(date).format('YYYY-MM-DD');
  }
};
const isArrayHBS = function (value) {
  return Array.isArray(value);
};
const includesHBS = function (arr, val) {
  if (arr && arr.includes) {
    return arr.includes(val);
  } else {
    return false;
  }
};
const eqHBS = function (a, b) {
  return a == b;
};
const isEqualsHBS = function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};
// const isEqualHelperHandlerbar = function (variable, value, options) {
//   if (variable == value) {
//     return options.fn(this);
//   } else {
//     return options.inverse(this);
//   }
// }
const isEqualHelperHandlerbar = function (variable, ...values) {
  const options = values.pop();
  const isEqual = values.some((value) => variable === value);
  return isEqual ? options.fn(this) : options.inverse(this);
};

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
    eq: eqHBS,
    includes: includesHBS,
    isArray: isArrayHBS,
    momentDMY:momentDMY_HBS,
    momentYMD:momentYMD_HBS
  }
}));


// Load auth routes
app.use('/auth', authRoute);
app.use('/', authController.checkToken); //chekToken applicable all follwoing routes
app.use('/product', productRoute);
app.use('/customer', customerRoute);
app.use('/po', poRoute);

// Log incoming requests
/*app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} received`);
  next();
});*/

// Temp Routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home', message: 'Welcome, to app!' });
});
app.get('/about', async (req, res) => {
  res.render('error', { title: 'Error' });
});

// Handle GoogleMapAPI for location
app.get('/location', (req, res) => {
  res.render('location', { location: 'Sangamner', lat: '19.576117', lng: '74.207019' });
  //process.env.GOOGLE_MAPS_API_KEY
});
app.get('/locationCur', (req, res) => {
  res.render('locationCur');
});
app.post('/', async (req, res) => {
  const { lat, lng } = req.body;
  try {
    //console.log('XXX POST request received');
    console.log(`XXX Location received: ${lat}, ${lng}`);

    if (lat) {
      //add to database
      //const conn = await pool.getConnection();
      await conn.beginTransaction();
      const sqlStr = "INSERT INTO locations (name,address,lat,lng)" +
        " VALUES ('Sunil','Sunil Add',?,?)"
      const params = [lat, lng];
      const [result1] = await conn.query(sqlStr, params);
      await conn.commit();
      conn.release();
      console.log(`XXX Data Save: ${lat}, ${lng}`);
    }

    res.render('home', { alert: `Location received Latitude: ${lat} Longitude: ${lng}` })

    // Perform database operations here
    //res.status(200).send(`Location received Latitude: ${lat} Longitude: ${lng}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Handle LOV
app.get('/lov', async (req, res) => {
  //const conn = await pool.getConnection();
  const [users] = await conn.query("SELECT * FROM users");
  res.render('lov', { users });
});








app.all('*', (req, res) => {
  res.status(404).send("<h1>Page not found!!!</h1>");
});


//**************************************//
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});
