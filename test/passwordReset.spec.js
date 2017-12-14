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

const resetUrl = '/rest/v2/password-reset';

describe('Password reset', function() {
    before('Login', config.login);
    
    before('Helpers', function() {
        this.publicClient = new MangoClient();
    });

    it('Can trigger a password reset email', function() {
        let testUser = new User({
            username: uuidV4(),
            email: 'abc@example.com',
            name: 'This is a name',
            permissions: '',
            password: uuidV4()
        });
        
        return testUser.save().then(() => {
            return this.publicClient.restRequest({
                path: `${resetUrl}/send-email`,
                method: 'POST',
                data: {
                    username: testUser.username,
                    email: testUser.email
                }
            });
        }).then(response => {
            assert.strictEqual(response.status, 204);
        });
    });
    
    it('Rejects incorrect email addresses', function() {
        let testUser = new User({
            username: uuidV4(),
            email: 'abc@example.com',
            name: 'This is a name',
            permissions: '',
            password: uuidV4()
        });
        
        return testUser.save().then(() => {
            return this.publicClient.restRequest({
                path: `${resetUrl}/send-email`,
                method: 'POST',
                data: {
                    username: testUser.username,
                    email: 'blah' + testUser.email 
                }
            });
        }).then(response => {
            throw new Error('Email should not have sent');
        }, error => {
            assert.strictEqual(error.status, 400);
        });
    });
    
    it('Can retrieve the public key', function() {
        return this.publicClient.restRequest({
            path: `${resetUrl}/public-key`,
            method: 'GET'
        }).then(response => {
            assert.strictEqual(response.status, 200);
            assert.isString(response.data);
        });
    });
    
    it('Can generate a reset token for a user', function() {
        let testUser = new User({
            username: uuidV4(),
            email: 'abc@example.com',
            name: 'This is a name',
            permissions: '',
            password: uuidV4()
        });
        
        return testUser.save().then(() => {
            return client.restRequest({
                path: `${resetUrl}/create/${encodeURIComponent(testUser.username)}`,
                method: 'POST'
            });
        }).then(response => {
            assert.strictEqual(response.status, 200);
            assert.isObject(response.data);
            assert.isString(response.data.token);
            assert.isString(response.data.relativeUrl);
            assert.isString(response.data.fullUrl);
        });
    });

    it('Can verify a token', function() {
        let testUser = new User({
            username: uuidV4(),
            email: 'abc@example.com',
            name: 'This is a name',
            permissions: '',
            password: uuidV4()
        });
        
        return testUser.save().then(() => {
            return client.restRequest({
                path: `${resetUrl}/create/${encodeURIComponent(testUser.username)}`,
                method: 'POST'
            });
        }).then(response => {
            assert.strictEqual(response.status, 200);
            assert.isObject(response.data);
            assert.isString(response.data.token);
            assert.isString(response.data.relativeUrl);
            assert.isString(response.data.fullUrl);

            return this.publicClient.restRequest({
                path: `${resetUrl}/verify`,
                method: 'GET',
                params: {
                    token: response.data.token
                }
            });
        }).then(response => {
            assert.strictEqual(response.status, 200);
            
            const parsedToken = response.data;
            assert.isObject(parsedToken);
            assert.isObject(parsedToken.header);
            assert.isObject(parsedToken.body);
            assert.isString(parsedToken.signature);
            assert.strictEqual(parsedToken.header.alg, 'ES512');
            assert.strictEqual(parsedToken.body.sub, testUser.username);
            assert.strictEqual(parsedToken.body.typ, 'pwreset');
            assert.isNumber(parsedToken.body.exp);
            assert.isNumber(parsedToken.body.id);
            assert.isNumber(parsedToken.body.v);
        });
    });
    
    it('Can reset a user\'s password with a token', function() {
        let testUser = new User({
            username: uuidV4(),
            email: 'abc@example.com',
            name: 'This is a name',
            permissions: '',
            password: uuidV4()
        });
        let newPassword = uuidV4();
        
        return testUser.save().then(() => {
            return client.restRequest({
                path: `${resetUrl}/create/${encodeURIComponent(testUser.username)}`,
                method: 'POST'
            });
        }).then(response => {
            assert.strictEqual(response.status, 200);
            assert.isObject(response.data);
            assert.isString(response.data.token);
            assert.isString(response.data.relativeUrl);
            assert.isString(response.data.fullUrl);
            
            return this.publicClient.restRequest({
                path: `${resetUrl}/reset`,
                method: 'POST',
                data: {
                    token: response.data.token,
                    newPassword: newPassword
                }
            });
        }).then(response => {
            assert.strictEqual(response.status, 204);
            
            const loginClient = new MangoClient();
            return loginClient.User.login(testUser.username, newPassword);
        });
    });
});
