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
        return new MangoClient(Object.assign({}, config, localConfig));
    },
    
    login(client) {
        if (typeof this.timeout === 'function') {
            this.timeout(config.loginRetries * config.loginRetryDelay + 5000);
        }
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
            permissions: [],
            password: username,
            locale: '',
            receiveAlarmEmails: 'IGNORE'
        });
    },
    
    assertValidationErrors(fieldsInError, response) {
        assert.strictEqual(response.status, 422);
        assert.isArray(response.data.result.messages);
        if(fieldsInError.length != response.data.result.messages.length) {
            let msg = 'Expected validataion errors for: [';
            for(let i=0; i<fieldsInError.length -1; i++) {
                msg = msg + fieldsInError[i] + ',';
            }
            msg += fieldsInError[fieldsInError.length-1] + '] but found [';
            for(let k=0; k<response.data.result.messages.length-1; k++) {
                msg = msg + response.data.result.messages[k].property + ',';
            }
            msg += response.data.result.messages[response.data.result.messages.length-1] + ']';
            assert.fail(msg);
        }
        
        for(let i=0; i<fieldsInError.length; i++) {
            let found = false;
            for(let j=0; j<response.data.result.messages.length; j++) {
                if(response.data.result.messages[j].property == fieldsInError[i]) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                let msg = '';
                for(let k=0; k<response.data.result.messages.length-1; k++) {
                    msg = msg + response.data.result.messages[k].property + ',';
                }
                msg += response.data.result.messages[k].property[response.data.result.messages.length-1];
                assert.fail('No validation error for ' + fieldsInError[i] + ' but these were ' + msg);
            }
        }
    }
    
});

module.exports = testHelper;