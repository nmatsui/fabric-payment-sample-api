'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const config = require('api/.config/token.json');
const restr = /^bearer (.+)$/i;

exports.bearerTokenAuthenticate = (req, res, next) => {
    let authHeader = req.get('Authorization');
    if (!authHeader) {
        res.set({'WWW-Authenticate': 'Bearer realm="token_required"'});
        res.status(401).json({error: {realm: 'token required'}});
    }

    if (authHeader.match(restr) && RegExp.$1 === config.token) {
        next();
    } else {
        res.set({'WWW-Authenticate': 'Bearer realm="token_mismatch" error="invalid_token"'});
        res.status(401).json({error: {realm: 'token mismatch', error: 'invalid token'}});
    }
};
