'use strict';
/*
 * Copyright IBM Corp All Rights Reserved
 * Modified Nobuyuki Matsui <nobuyuki.matsui@gmail.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const ORDERER_ADDRESS = process.env.ORDERER_ADDRESS;
const PEER_ADDRESS = process.env.PEER_ADDRESS;
const EVENTHUB_ADDRESS = process.env.EVENTHUB_ADDRESS;
const CHANNEL_NAME = process.env.CHANNEL_NAME;
const USER_NAME = process.env.USER_NAME;
const KEYSTORE_PATH = process.env.KEYSTORE_PATH;

const path = require('path');

const Fabric_Client = require('fabric-client');
const fabric_client = new Fabric_Client();
const channel = fabric_client.newChannel(CHANNEL_NAME);
const orderer = fabric_client.newOrderer(`grpc://${ORDERER_ADDRESS}`)
const peer = fabric_client.newPeer(`grpc://${PEER_ADDRESS}`);
channel.addOrderer(orderer);
channel.addPeer(peer);

exports.authenticate = () => {
    return new Promise((resolve, reject) => {
        Fabric_Client.newDefaultKeyValueStore({ path: KEYSTORE_PATH
        }).then((state_store) => {
            fabric_client.setStateStore(state_store);
            const crypto_suite = Fabric_Client.newCryptoSuite();
            const crypto_store = Fabric_Client.newCryptoKeyStore({path: KEYSTORE_PATH});
            crypto_suite.setCryptoKeyStore(crypto_store);
            fabric_client.setCryptoSuite(crypto_suite);
            return fabric_client.getUserContext(USER_NAME, true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log(`Successfully loaded ${USER_NAME} from persistence`);
                resolve(user_from_store);
            } else {
                const msg = `Failed to get ${USER_NAME}`;
                console.error(msg);
                reject(new Error(msg));
            }
        });
    });
};

exports.query = (params, callback) => {
    channel.queryByChaincode(params).then((results) => {
        console.log("Query has completed, checking results");
        if (results && results.length == 1) {
            if (results[0] instanceof Error) {
                const msg = `error from fabric query = ${results[0]}`;
                console.error(msg);
                throw new Error(msg);
            } else {
                const result = results[0].toString();
                console.log(`response from fabric query = ${result}`);
                if (result) {
                    callback(JSON.parse(result));
                } else {
                    callback({error: 'No response', status_code: 404});
                }
            }
        } else {
            const msg = "No payloads were returned from fabric query";
            console.error(msg);
            throw new Error(msg);
        }
    }).catch((err) => {
        let msg = `fabric query failed :: ${err}`;
        console.error(msg);
        callback({error: msg, status_code: 500});
    });
};

exports.invoke = (data, callback) => {
    const tx_id = fabric_client.newTransactionID();
    data.txId = tx_id;
    data.chainId = CHANNEL_NAME;

    let payload = null;
    channel.sendTransactionProposal(data).then((results) => {
        const proposalResponses = results[0];
        const proposal = results[1];
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('Transaction proposal was good');
        } else {
            console.error('Transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(`Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponses[0].response.status}, message - ${proposalResponses[0].response.message}`);
            if (proposalResponses[0].response.payload) {
                payload = Buffer.from(Uint8Array.from(proposalResponses[0].response.payload)).toString();
            }

            const request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
            };
            const transaction_id_string = tx_id.getTransactionID();
            const promises = [];
            const sendPromise = channel.sendTransaction(request);
            promises.push(sendPromise);

            const event_hub = fabric_client.newEventHub();
            event_hub.setPeerAddr(`grpc://${EVENTHUB_ADDRESS}`);

            const txPromise = new Promise((resolve, reject) => {
                const handle = setTimeout(() => {
                    event_hub.disconnect();
                    resolve({event_status: 'TIMEOUT'});
                }, 3000);
                event_hub.connect();
                event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                    clearTimeout(handle);
                    event_hub.unregisterTxEvent(transaction_id_string);
                    event_hub.disconnect();

                    const return_status = {event_status: code, tx_id: transaction_id_string};
                    if (code === 'VALID') {
                        console.log(`The transaction has been committed on peer ${event_hub._ep._endpoint.addr}`);
                        resolve(return_status);
                    } else {
                        console.error(`The transaction was invalid, code = ${code}`);
                        resolve(return_status);
                    }
                }, (err) => {
                    reject(new Error(`There was a problem with the eventhub :: ${err}`));
                });
            });
            promises.push(txPromise);

            return Promise.all(promises);
        } else {
            const msg = 'Failed to send Proposal or receive valid response. Response null or status is not 200.';
            console.error(msg);
            throw new Error(msg);
        }
    }).then((results) => {
        console.log("Send transaction promise and event listener promise have completed");
        if (results && results[0] && results[0].status === 'SUCCESS') {
            console.log('Successfully sent transaction to the orderer.');
        } else {
            const msg = `Failed to order the transaction. Error code: ${results[0].status}`;
            console.error(msg);
            throw new Error(msg);
        }

        if (results && results[1] && results[1].event_status === 'VALID') {
            console.log('Successfully committed the change to the ledger by the peer');
        } else {
            const msg = `Transaction failed to be committed to the ledger due to :: ${results[1].event_status}`;
            console.error(msg);
            throw new Error(msg);
        }
        try {
            callback(JSON.parse(payload));
        } catch(e) {
            callback(payload);
        }
    }).catch((err) => {
        const msg = `fabric invoke failed :: ${err}`;
        console.error(msg);
        callback({error: msg, status_code: 500});
    });
};
