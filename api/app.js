'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const auth = require('api/middlewares/authenticate.js');
const index = require('api/routes/index');
const fabricPayment = require('api/routes/fabric-payment/index');
const accounts = require('api/routes/fabric-payment/accounts');
const events = require('api/routes/fabric-payment/events');

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(auth.bearerTokenAuthenticate);

app.use('/', index);
app.use('/fabric-payment', fabricPayment);
app.use('/fabric-payment/accounts', accounts);
app.use('/fabric-payment/events', events);

app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({error: err.message});
});

module.exports = app;
