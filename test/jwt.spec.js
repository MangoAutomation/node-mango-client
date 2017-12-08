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

const jwtUrl = '/rest/v2/jwt';

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
        this.createToken = function(username) {
            let url = `${jwtUrl}/create`;
            if (username != null) {
                url += `/${username}`;
            }
            
            return client.restRequest({
                path: url,
                method: 'POST'
            }).then(response => {
                return response.data;
            });
        };
    });

    it('Can create and use a JWT with REST', function() {
        return this.createToken().then(tokenData => {
            const jwtClient = new MangoClient({
                enableCookies: false
            });
            jwtClient.setBearerAuthentication(tokenData.token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, config.username);
        });
    });
    
    it('Can create a JWT for another user', function() {
        return this.createToken(this.testUser.username).then(tokenData => {
            const jwtClient = new MangoClient({
                enableCookies: false
            });
            jwtClient.setBearerAuthentication(tokenData.token);
            return jwtClient.User.current();
        }).then(user => {
            assert.strictEqual(user.username, this.testUser.username);
        });
    });
});
