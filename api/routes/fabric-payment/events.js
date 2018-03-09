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
const EVENT_NO = ":no(\\w{16})";
const DEPOSIT = 'deposit';
const REMIT = 'remit';
const WITHDRAW = 'withdraw';

router.get('/', (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'listEvent',
        args: []
    };
    query(params, req, res, next);
});

router.get(`/:eventType(${DEPOSIT}|${REMIT}|${WITHDRAW})/`, (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'listEvent',
        args: [req.params.eventType]
    };
    query(params, req, res, next);
});

router.post(`/${DEPOSIT}/`, [
    body('to_account_no').exists().withMessage('to_account_no is required'),
    body('to_account_no').isLength({min:16, max:16}).matches(/\d/).withMessage('account_no is not 16 digits'),
    body('amount').exists().withMessage('amount is required'),
    body('amount').isInt({min:0}).withMessage('amount is not int or amount is less than zero'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.mapped() });
    }

    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'deposit',
        args: [req.body.to_account_no, req.body.amount.toString()],
    };
    invoke(data, req, res, next);
});

router.post(`/${REMIT}/`, [
    body('from_account_no').exists().withMessage('from_account_no is required'),
    body('from_account_no').isLength({min:16, max:16}).matches(/\d/).withMessage('from_account_no is not 16 digits'),
    body('to_account_no').exists().withMessage('to_account_no is required'),
    body('to_account_no').isLength({min:16, max:16}).matches(/\d/).withMessage('to_account_no is not 16 digits'),
    body('amount').exists().withMessage('amount is required'),
    body('amount').isInt({min:0}).withMessage('amount is not int or amount is less than zero'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.mapped() });
    }

    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'remit',
        args: [req.body.from_account_no, req.body.to_account_no, req.body.amount.toString()],
    };
    invoke(data, req, res, next);
});

router.post(`/${WITHDRAW}/`, [
    body('from_account_no').exists().withMessage('from_account_no is required'),
    body('from_account_no').isLength({min:16, max:16}).matches(/\d/).withMessage('account_no is not 16 digits'),
    body('amount').exists().withMessage('amount is required'),
    body('amount').isInt({min:0}).withMessage('amount is not int or amount is less than zero'),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.mapped() });
    }

    const data = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'withdraw',
        args: [req.body.from_account_no, req.body.amount.toString()],
    };
    invoke(data, req, res, next);
});

router.get(`/${EVENT_NO}/histories/`, (req, res, next) => {
    const params = {
        chaincodeId: CHAINCODE_NAME,
        fcn: 'listHistory',
        args: [req.params.no]
    };
    query(params, req, res, next);
});

module.exports = router;
