'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.redirect(302, '/accounts/');
});

module.exports = router;
