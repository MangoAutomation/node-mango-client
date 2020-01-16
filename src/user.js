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

const uuid = require('uuid/v4');

function userFactory(client) {
    const MangoObject = client.MangoObject;

    return class User extends MangoObject {
        
        static get defaultProperties() {
            const username = uuid();
            return {
                username,
                email: `${username}@example.com`,
                name: `${username}`,
                permissions: [],
                password: username,
                locale: '',
                receiveAlarmEmails: 'IGNORE'
            };
        }
        
        static get baseUrl() {
            return '/rest/v2/users';
        }

        static get idProperty() {
            return 'username';
        }

        static login(username, password, retries, retryDelay) {
            return client.restRequest({
                path: '/rest/v2/login',
                method: 'POST',
                data: {username, password},
                retries: retries || 0,
                retryDelay: retryDelay || 5000
            }).then(response => {
                return (new User()).updateSelf(response);
            });
        }
        
        static logout() {
            return client.restRequest({
                path: '/rest/v2/logout',
                method: 'POST'
            });
        }

        static current() {
            return client.restRequest({
                path: this.baseUrl + '/current'
            }).then(response => {
                return (new User()).updateSelf(response);
            });
        }
        
        static lockPassword(username) {
            return client.restRequest({
               path: this.baseUrl + '/' + encodeURIComponent(`${username}`) + '/lock-password',
               method: 'PUT'
            });
        }
        
        su(username) {
            let url = '/rest/v2/login/su?username=' + encodeURIComponent(`${username}`);
            return client.restRequest({
                path: url,
                method: 'POST'
             }).then(response => {
                 return this.updateSelf(response);
             });
        }
        
        exitSu() {
            let url = '/rest/v2/login/exit-su';
            return client.restRequest({
                path: url,
                method: 'POST'
             }).then(response => {
                 return this.updateSelf(response);
             });
        }

        updateHomeUrl(url) {
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(this[this.constructor.idProperty]) + '/homepage?url=' + encodeURIComponent(url),
                method: 'PUT'
            }).then(response => {
                return this.updateSelf(response);
            });
        }
        
        toggleMuted(muted) {
            let path = this.constructor.baseUrl + '/' + encodeURIComponent(this[this.constructor.idProperty])  + '/mute';
            if(muted) {
                path += '?mute=' + muted;
            }
            return client.restRequest({
                path: path,
                method: 'PUT'
            }).then(response => {
                return this.updateSelf(response);
            });
        }
    };
}

module.exports = userFactory;
