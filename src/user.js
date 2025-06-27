/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function userFactory(client) {
    const MangoObject = client.MangoObject;

    return class User extends MangoObject {
        
        static get defaultProperties() {
            const username = uuid();
            return {
                username,
                email: `${username}@example.com`,
                name: username,
                permissions: [],
                password: username,
                locale: '',
                receiveAlarmEmails: 'IGNORE'
            };
        }
        
        static get baseUrl() {
            return '/rest/v3/users';
        }

        static get idProperty() {
            return 'username';
        }

        static login(username, password, retries, retryDelay) {
            return client.restRequest({
                path: '/rest/v3/login',
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
                path: '/rest/v3/logout',
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
               path: this.baseUrl + '/' + encodeURIComponent(username) + '/lock-password',
               method: 'PUT'
            });
        }
        
        su(username) {
            return client.restRequest({
                path: '/rest/v3/login/su',
                method: 'POST',
                params: {
                    username
                }
             }).then(response => {
                 return this.updateSelf(response);
             });
        }
        
        exitSu() {
            let url = '/rest/v3/login/exit-su';
            return client.restRequest({
                path: url,
                method: 'POST'
             }).then(response => {
                 return this.updateSelf(response);
             });
        }

        updateHomeUrl(url) {
            const id = this.originalId || this[this.constructor.idProperty];
            
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(id) + '/homepage',
                method: 'PUT',
                params: {
                    url
                }
            }).then(response => {
                return this.updateSelf(response);
            });
        }
        
        toggleMuted(muted) {
            const id = this.originalId || this[this.constructor.idProperty];
            
            let path = this.constructor.baseUrl + '/' + encodeURIComponent(id)  + '/mute';
            return client.restRequest({
                path: path,
                method: 'PUT',
                params: {
                    mute: muted
                }
            }).then(response => {
                return this.updateSelf(response);
            });
        }
    };
}

module.exports = userFactory;
