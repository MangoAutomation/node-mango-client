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

const jwtUrl = '/rest/v2/auth-tokens';

describe('JSON Web Token authentication', function() {
    before('Login', config.login);
    
    before('Create a test user', function() {
        const username = uuidV4();
        this.testUserPassword = uuidV4();
        this.testUser = new User({
            username,
            email: `${username}@dummy.com`,
            name: `${username}`,
            permissions: '',
            password: this.testUserPassword
        });
        return this.testUser.save();
    });
    
    after('Delete the test user', function() {
        return this.testUser.delete();
    });
    
    before('Helper functions', function() {
        this.createToken = function(username, clt = client) {
            let url = `${jwtUrl}/create`;
            if (username != null) {
                url += `/${username}`;
            }
            
            return clt.restRequest({
                path: url,
                method: 'POST'
            }).then(response => {
                return response.data;
            });
        };
        
        this.noCookieConfig = Object.assign({
            enableCookies: false
        }, config);
    });

    it('Can create and use an authentication token with REST', function() {
        return this.createToken().then(token => {
            //console.log(Buffer.from(token.split('.')[1], 'base64').toString());
            
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, config.username);
        });
    });
    
    it('Can create an authentication token for another user', function() {
        return this.createToken(this.testUser.username).then(token => {
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, this.testUser.username);
        });
    });
    
    it('Can\'t create a token using token authentication', function() {
        return this.createToken().then(token => {
            //console.log(Buffer.from(token.split('.')[1], 'base64').toString());
            
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            
            return this.createToken(null, jwtClient);
        }).then(token => {
            throw new Error('Created token using a token authentication');
        }, error => {
            assert.strictEqual(error.status, 403);
        });
    });
    
    it('Can retrieve the public key', function() {
        return client.restRequest({
            path: `${jwtUrl}/public-key`,
            method: 'GET'
        }).then(response => {
            assert.strictEqual(response.status, 200);
            assert.isString(response.data);
        });
    });

    it('Can verify a token', function() {
        return this.createToken().then(token => {
            return client.restRequest({
                path: `${jwtUrl}/verify`,
                method: 'GET',
                params: {
                    token
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
            assert.strictEqual(parsedToken.body.sub, config.username);
            assert.isNumber(parsedToken.body.exp);
            assert.isNumber(parsedToken.body.id);
            assert.isNumber(parsedToken.body.v);
        });
    });
    
    it('Admin can edit another user using token authentication', function() {
        return this.createToken().then(token => {
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.get(this.testUser.username);
        }).then(user => {
            assert.strictEqual(user.username, this.testUser.username);
            user.name = 'Joe';
            return user.save();
        }).then(user => {
            assert.strictEqual(user.name, 'Joe');
        });
    });
    
    it('Standard user can\'t edit own user using token authentication', function() {
        return this.createToken(this.testUser.username).then(token => {
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, this.testUser.username);
            user.name = 'Joe';
            
            return user.save().then(user => {
                throw new Error('Edited own user using a token authentication');
            }, error => {
                assert.strictEqual(error.status, 403);
            });
        });
    });
    
    it('Admin can\'t edit own user using token authentication', function() {
        return this.createToken().then(token => {
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, config.username);
            user.name = 'Joe';
            
            return user.save().then(user => {
                throw new Error('Edited own user using a token authentication');
            }, error => {
                assert.strictEqual(error.status, 403);
            });
        });
    });

    it('Can create an authentication token using basic authentication', function() {
        const basicAuthClient = new MangoClient(this.noCookieConfig);
        basicAuthClient.setBasicAuthentication(this.testUser.username, this.testUserPassword);
        
        return this.createToken(null, basicAuthClient).then(token => {
            const jwtClient = new MangoClient(this.noCookieConfig);
            jwtClient.setBearerAuthentication(token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, this.testUser.username);
        });
    });

});
