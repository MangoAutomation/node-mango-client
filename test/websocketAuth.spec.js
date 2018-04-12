/**
 * Copyright 2017 Infinite Automation Systems Inc.
 * http://infiniteautomation.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const config = require('./setup');
const uuidV4 = require('uuid/v4');
const MangoClient = require('../src/mangoClient');

const noCookieConfig = Object.assign({
    enableCookies: false
}, config);

describe('Websocket authentication', function() {
    before('Login', config.login);
    
    before('Create a test user', function() {
        const username = uuidV4();
        this.testUserPassword = uuidV4();
        this.testUser = new User({
            username,
            email: `${username}@example.com`,
            name: `${username}`,
            permissions: '',
            password: this.testUserPassword
        });
        return this.testUser.save();
    });
    
    before('Create a client that uses basic authentication', function() {
        this.basicAuthClient = new MangoClient(noCookieConfig);
        this.basicAuthClient.setBasicAuthentication(this.testUser.username, this.testUserPassword);
    });
    
    before('Create a client that uses JWT authentication', function() {
        return client.restRequest({
            path: '/rest/v2/auth-tokens/create',
            method: 'POST',
            data: {
                username: this.testUser.username
            }
        }).then(response => {
            this.jwtClient = new MangoClient(noCookieConfig);
            this.jwtClient.setBearerAuthentication(response.data.token);
        });
    });
    
    after('Delete the test user', function() {
        return this.testUser.delete();
    });
    
    const testWebSocketsUsingClient = function(client) {
        return function() {
            const socketOpen = config.defer();
            const gotResponse = config.defer();
            const sequenceNumber = Math.floor(Math.random() * 10000);

            const ws = client.openWebSocket({
                path: '/rest/v2/websocket/temporary-resources'
            });

            ws.on('open', () => {
                socketOpen.resolve();
            });
            
            ws.on('error', error => {
                const msg = new Error(`WebSocket error, error: ${error}`);
                socketOpen.reject(msg);
                gotResponse.reject(msg);
                ws.close();
            });
            
            ws.on('close', (code, reason) => {
                const msg = new Error(`WebSocket closed, code: ${code}, reason: ${reason}`);
                socketOpen.reject(msg);
                gotResponse.reject(msg);
            });

            ws.on('message', msgStr => {
                assert.isString(msgStr);
                const msg = JSON.parse(msgStr);
                if (msg.messageType === 'RESPONSE' && msg.sequenceNumber === sequenceNumber) {
                    gotResponse.resolve();
                    ws.close();
                }
            });

            return socketOpen.promise.then(() => {
                const send = config.defer();
                ws.send(JSON.stringify({
                    messageType: 'SUBSCRIPTION',
                    sequenceNumber
                }), error => {
                    if (error != null) {
                        send.reject(error);
                    } else {
                        send.resolve();
                    }
                });
                return send.promise;
            }).then(() => gotResponse.promise);
        };
    };

    it('Can use basic authentication with websockets', function() {
        return testWebSocketsUsingClient(this.basicAuthClient)();
    });
    
    it('Can use JWT authentication with websockets', function() {
        return testWebSocketsUsingClient(this.jwtClient)();
    });
});
