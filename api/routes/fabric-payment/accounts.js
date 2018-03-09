'use strict';
/*
 * Copyright Nobuyuki Matsui<nobuyuki.matsui>.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const { body, validationResult } = require('express-validator/check');
const { query, invoke } = require('api/routes/fabric-payment/utils');
const router = express.Router();

const CHAINCODE_NAME = process.env.CHAINCODE_NAME;
const ACCOUNT_NO = ":no(\\d{16})";

router.get('/', (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'listAccount',
        args: []
    };
    query(params, req, res, next);
});

router.post('/', [
    body('name').exists().withMessage('name is required.'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.mapped() });
    }

    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'createAccount',
        args: [req.body.name],
    };
    invoke(data, req, res, next);
});

router.get(`/${ACCOUNT_NO}/`, (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'retrieveAccount',
        args: [req.params.no]
    };
    query(params, req, res, next);
});

router.put(`/${ACCOUNT_NO}/`, [
    body('name').exists().withMessage('name is required.'),
    body('model_type').not().exists().withMessage('model_type can not be changed.'),
    body('no').not().exists().withMessage('no can not be changed.'),
    body('balance').not().exists().withMessage('balance can not be changed.'),
],(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.mapped() });
    }

    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'updateAccountName',
        args: [req.params.no, req.body.name],
    };
    invoke(data, req, res, next);
});

router.delete(`/${ACCOUNT_NO}/`, (req, res, next) => {
    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'deleteAccount',
        args: [req.params.no],
    };
    invoke(data, req, res, next);
});

router.get(`/${ACCOUNT_NO}/histories/`, (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'listHistory',
        args: [req.params.no]
    };
    query(params, req, res, next);
});

module.exports = router;
