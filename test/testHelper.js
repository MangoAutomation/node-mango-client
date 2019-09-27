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

const path = require('path');
const chai = require('chai');
const MangoClient = require('../src/mangoClient');
const defer = require('../src/util').defer;
const uuid = require('uuid/v4');

global.chai = chai;
global.assert = chai.assert;
global.expect = chai.expect;

const defaultConfig = {
    username: 'admin',
    password: 'admin',
    loginRetries: 0,
    loginRetryDelay: 5000
};

const config = Object.assign({}, defaultConfig);
try {
    const configFileOptions = require(path.resolve(process.env.CONFIG_FILE || 'config.json'));
    Object.assign(config, configFileOptions);
} catch (e) {
}

const testHelper = Object.freeze({
    delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    },

    noop() {},

    createClient(localConfig) {
        return new MangoClient(Object.assign(config, localConfig));
    },
    
    login(client) {
        this.timeout(config.loginRetries * config.loginRetryDelay + 5000);
        return client.User.login(config.username, config.password, config.loginRetries, config.loginRetryDelay);
    },

    defer,
    defaultConfig,
    config,
    uuid,
    
    createUser(client) {
        const username = uuid();
        return new client.User({
            username,
            email: `${username}@example.com`,
            name: `${username}`,
            permissions: '',
            password: username
        });
    }
});

module.exports = testHelper;