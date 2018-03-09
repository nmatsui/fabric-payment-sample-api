'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const fabric = require('api/libs/fabric');

let authenticated_user = null;

const authenticate = (res, success) => {
    if (!authenticated_user) {
        fabric.authenticate().then((member_user) => {
            authenticated_user = member_user;
            success();
        }).catch((err) => {
            let msg = `fabric ahtunetication failed :: ${err}`
            console.error(msg);
            res.status(401).json({error: msg});
        });
    } else {
        success();
    }
};

exports.query = (params, req, res, next) => {
    authenticate(res, () => {
        fabric.query(params, (result) => {
            res.status(result.status_code || 200).json(result);
        });
    });
};

exports.invoke = (data, req, res, next) => {
    authenticate(res, () => {
        fabric.invoke(data, (result) => {
            res.status(result.status_code || 200).json(result);
        });
    });
};
