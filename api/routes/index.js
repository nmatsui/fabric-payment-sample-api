'use strict';

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect(302, '/fabric-payment/');
});

module.exports = router;
