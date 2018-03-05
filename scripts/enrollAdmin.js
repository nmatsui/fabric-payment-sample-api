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

if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} admin_password`);
    process.exit(1);
}
const admin_password = process.argv[2]

const Fabric_Client = require('fabric-client');
const Fabric_CA_Client = require('fabric-ca-client');

const path = require('path');
const util = require('util');
const os = require('os');

const fabric_client = new Fabric_Client();

let fabric_ca_client = null;
let admin_user = null;
let member_user = null;

Fabric_Client.newDefaultKeyValueStore({path: KEYSTORE_PATH
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
        return null;
    } else {
        return fabric_ca_client.enroll({
            enrollmentID: ADMIN_NAME,
            enrollmentSecret: admin_password,
        }).then((enrollment) => {
            console.log(`Successfully enrolled admin user "${ADMIN_NAME}"`);
            return fabric_client.createUser(
                {username: ADMIN_NAME,
                    mspid: MSPID,
                    cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                });
        }).then((user) => {
            admin_user = user;
            return fabric_client.setUserContext(admin_user);
        }).catch((err) => {
            console.error(`Failed to enroll and persist ${ADMIN_NAME}. Error: ` + err.stack ? err.stack : err);
            throw new Error(`Failed to enroll ${ADMIN_NAME}`);
        });
    }
}).then(() => {
    console.log('Assigned the admin user to the fabric client ::' + admin_user.toString());
}).catch((err) => {
    console.error(`Failed to enroll ${ADMIN_NAME}: ${err}`);
});
