'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.redirect(302, '/accounts/');
});

module.exports = router;
