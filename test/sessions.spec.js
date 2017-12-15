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

const exampleUrl = '/rest/v2/example';

describe('Sessions and expiry', function() {
    before('Login', config.login);

    it('Can expire a user\'s sessions', function() {
        return client.restRequest({
            path: `${exampleUrl}/expire-session`,
            method: 'GET'
        }).then(response => {
            return client.restRequest({
                path: '/rest/v1/users/current',
                method: 'GET'
            });
        }).then(response => {
            throw new Error('Session should be expired');
        }, error => {
            assert.strictEqual(error.status, 401);
        });
    });
    
    it('User\'s sessions are expired when they are disabled');
    it('User\'s sessions are expired when their password is changed');
    it('User\'s sessions are expired when their permissions are changed');

});
