'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.redirect(302, '/fabric-payment/');
});

module.exports = router;
