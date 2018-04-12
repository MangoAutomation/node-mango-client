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

describe('Basic authentication', function() {
    before('Login', config.login);
    
    before('Create a test user', function() {
        const username = uuidV4();
        this.testUserPassword = uuidV4();
        this.testUser = new User({
            username,
            email: `${username}@example.com`,
            name: `${username}`,
            permissions: 'superadmin',
            password: this.testUserPassword
        });
        return this.testUser.save();
    });
    
    before('Create a client that uses basic authentication', function() {
        const noCookieConfig = Object.assign({
            enableCookies: false
        }, config);
        this.basicAuthClient = new MangoClient(noCookieConfig);
        this.basicAuthClient.setBasicAuthentication(this.testUser.username, this.testUserPassword);
    });
    
    after('Delete the test user', function() {
        return this.testUser.delete();
    });

    it('Can get current user using basic authentication', function() {
        return this.basicAuthClient.User.current();
    });
    
    it('Can use basic authentication with websockets', function() {
        this.timeout(5000);
        
        let ws;
        const subscription = {
            eventTypes: ['RAISED'],
            levels: ['NONE']
        };
        
        const socketOpenDeferred = config.defer();
        const gotEventDeferred = config.defer();
        
        const testId = uuidV4();

        return Promise.resolve().then(() => {
            ws = this.basicAuthClient.openWebSocket({
                path: '/rest/v1/websocket/events'
            });

            ws.on('open', () => {
                socketOpenDeferred.resolve();
            });
            
            ws.on('error', error => {
                const msg = new Error(`WebSocket error, error: ${error}`);
                socketOpenDeferred.reject(msg);
                gotEventDeferred.reject(msg);
            });
            
            ws.on('close', (code, reason) => {
                const msg = new Error(`WebSocket closed, code: ${code}, reason: ${reason}`);
                socketOpenDeferred.reject(msg);
                gotEventDeferred.reject(msg);
            });

            ws.on('message', msgStr => {
                assert.isString(msgStr);
                const msg = JSON.parse(msgStr);
                assert.strictEqual(msg.status, 'OK');
                assert.strictEqual(msg.payload.type, 'RAISED');
                assert.strictEqual(msg.payload.event.alarmLevel, 'NONE');
                assert.property(msg.payload.event, 'eventType');

                if (msg.payload.event.message === 'test id ' + testId) {
                    assert.strictEqual(msg.payload.event.eventType.eventType, 'SYSTEM');
                    assert.strictEqual(msg.payload.event.eventType.eventSubtype, 'Test event');

                    gotEventDeferred.resolve();
                }
            });

            return socketOpenDeferred.promise;
        }).then(() => {
            const send = config.defer();
            ws.send(JSON.stringify(subscription), error => {
                if (error != null) {
                    send.reject(error);
                } else {
                    send.resolve();
                }
            });
            return send.promise;
            
            // wait a second after sending subscription, test fails otherwise on a cold start
        }).then(() => config.delay(1000)).then(() => {
            return this.basicAuthClient.restRequest({
                path: '/rest/v2/example/raise-event',
                method: 'POST',
                data: {
                    event: {
                        typeName: 'SYSTEM',
                        systemEventType: 'Test event'
                    },
                    level: 'NONE',
                    message: 'test id ' + testId
                }
            });
        }).then(() => gotEventDeferred.promise);
    });
});
