'use strict';
/*
 * Copyright IBM Corp All Rights Reserved
 * Modified Nobuyuki Matsui <nobuyuki.matsui@gmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */
const CA_ADDRESS = process.env.CA_ADDRESS;
const CA_NAME = process.env.CA_NAME;
const MSPID = process.env.MSPID;
const ADMIN_NAME = process.env.ADMIN_NAME;
const KEYSTORE_PATH = process.env.KEYSTORE_PATH;
const AFFILIATION = process.env.AFFILIATION;

if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} user_name`);
    process.exit(1);
}
const user_name = process.argv[2]

const Fabric_Client = require('fabric-client');
const Fabric_CA_Client = require('fabric-ca-client');

const path = require('path');
const util = require('util');
const os = require('os');

const fabric_client = new Fabric_Client();

let fabric_ca_client = null;
let admin_user = null;
let member_user = null;

Fabric_Client.newDefaultKeyValueStore({ path: KEYSTORE_PATH
}).then((state_store) => {
    fabric_client.setStateStore(state_store);
    const crypto_suite = Fabric_Client.newCryptoSuite();
    const crypto_store = Fabric_Client.newCryptoKeyStore({path: KEYSTORE_PATH});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    const tlsOptions = {
        trustedRoots: [],
        verify: false
    };
    fabric_ca_client = new Fabric_CA_Client(`http://${CA_ADDRESS}`, tlsOptions , CA_NAME, crypto_suite);
    return fabric_client.getUserContext(ADMIN_NAME, true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log(`Successfully loaded ${ADMIN_NAME} from persistence`);
        admin_user = user_from_store;
    } else {
        throw new Error(`Failed to get ${ADMIN_NAME}.... run enrollAdmin.js`);
    }
    return fabric_ca_client.register({enrollmentID: user_name, affiliation: AFFILIATION}, admin_user);
}).then((secret) => {
    console.log(`Successfully registered ${user_name} - secret: ${secret}`);
    return fabric_ca_client.enroll({enrollmentID: user_name, enrollmentSecret: secret});
}).then((enrollment) => {
    console.log(`Successfully enrolled member user "${user_name}"`);
    return fabric_client.createUser(
        {username: user_name,
            mspid: MSPID,
            cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
        });
}).then((user) => {
    member_user = user;
    return fabric_client.setUserContext(member_user);
}).then(()=>{
    console.log(`${user_name} was successfully registered and enrolled and is ready to intreact with the fabric network`);
}).catch((err) => {
    console.error('Failed to register: ' + err);
    if(err.toString().indexOf('Authorization') > -1) {
        console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
            'Try again after deleting the contents of the store directory '+store_path);
    }
});
