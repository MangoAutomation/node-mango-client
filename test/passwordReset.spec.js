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

const resetUrl = '/rest/v2/password-reset';

describe('Password reset', function() {

    it('Can trigger a password reset email', function() {
        return client.restRequest({
            path: `${resetUrl}/send-email`,
            method: 'POST',
            data: {
                username: 'admin',
                email: 'admin@yourMangoDomain.com'
            }
        }).then(response => {
            return response.data;
        });
    });

});
