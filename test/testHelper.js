/**
 * Copyright 2017 Infinite Automation Systems Inc.
 * http://infiniteautomation.com/
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
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
                msg = msg + response.data.result.messages[k].property + 
                    '->' + response.data.result.messages[k].message + ',';
            }
            msg += response.data.result.messages[response.data.result.messages.length-1].property + 
            '->' + response.data.result.messages[response.data.result.messages.length-1].message + ']';
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
                let msg = '[';
                for(let k=0; k<response.data.result.messages.length-1; k++) {
                    msg = msg + response.data.result.messages[k].property + 
                    '->' + response.data.result.messages[k].message +',';
                }
                msg += response.data.result.messages[response.data.result.messages.length-1].property +
                '->' + response.data.result.messages[response.data.result.messages.length-1].message + ']';
                assert.fail('No validation error for ' + fieldsInError[i] + ' but there were ' + msg);
            }
        }
    },
    
    assertDataSource(saved, local, assertDataSourceAttributes) {
        assert.isNumber(saved.id);
        assert.strictEqual(saved.xid, local.xid);
        assert.strictEqual(saved.name, local.name);
        assert.strictEqual(saved.enabled, local.enabled);
        assert.strictEqual(saved.polling, local.polling);
        assert.strictEqual(saved.pollPeriod.periods, local.pollPeriod.periods);
        assert.strictEqual(saved.pollPeriod.type, local.pollPeriod.type);
        this.assertPermissions(saved.editPermission, local.editPermission);
        this.assertAlarmLevels(saved.eventAlarmLevels, local.eventAlarmLevels);
        assertDataSourceAttributes(saved, local);
    },
    
    assertDataPoint(saved, local, assertPointLocator) {
        assert.isNumber(saved.id);
        assert.strictEqual(saved.xid, local.xid);
        assert.strictEqual(saved.name, local.name);
        assert.strictEqual(saved.deviceName, local.deviceName);
        assert.strictEqual(saved.enabled, local.enabled);
        this.assertLoggingProperties(saved.loggingProperties, local.loggingProperties);
        this.assertTextRenderer(saved.textRenderer, local.textRenderer);
        assert.strictEqual(saved.dataSourceXid, local.dataSourceXid);
        assert.strictEqual(saved.useIntegralUnit, local.useIntegralUnit);
        assert.strictEqual(saved.useRenderedUnit, local.useRenderedUnit);
        this.assertPermissions(this.safeSplitPermission(saved.readPermission), this.safeSplitPermission(local.readPermission));
        this.assertPermissions(this.safeSplitPermission(saved.setPermission), this.safeSplitPermission(local.setPermission));
        assert.strictEqual(saved.chartColour, local.chartColour);
        assert.strictEqual(saved.rollup, local.rollup);
        assert.strictEqual(saved.plotType, local.plotType);
        assert.strictEqual(saved.purgeOverride, local.purgeOverride);
        assert.strictEqual(saved.purgePeriod.periods, local.purgePeriod.periods);
        assert.strictEqual(saved.purgePeriod.type, local.purgePeriod.type);
        assert.strictEqual(saved.unit, local.unit);
        assert.strictEqual(saved.integralUnit, local.integralUnit);
        assert.strictEqual(saved.renderedUnit, local.renderedUnit);
        assertPointLocator(saved.pointLocator, local.pointLocator);
    },
    
    assertTextRenderer(saved, local) {
        assert.strictEqual(saved.type, local.type);
        switch(local.type) {
            case 'textRendererBinary':
                assert.strictEqual(saved.zeroLabel, local.zeroLabel);
                assert.strictEqual(saved.zeroColour, local.zeroColour);
                assert.strictEqual(saved.oneLabel, local.oneLabel);
                assert.strictEqual(saved.oneColour, local.oneColour);
            break;
            case 'textRendererPlain':
                assert.strictEqual(saved.suffix, local.suffix);
                assert.strictEqual(saved.useUnitAsSuffix, local.useUnitAsSuffix);
            break;
        }
    },
    
    assertLoggingProperties(saved, local) {
        assert.strictEqual(saved.loggingType, local.loggingType);
        assert.strictEqual(saved.discardExtremeValues, local.discardExtremeValues);
        if(saved.discardExtremeValues === true) {
            assert.strictEqual(saved.discardLowLimit, local.discardLowLimit);
            assert.strictEqual(saved.discardHighLimit, local.discardHighLimit);
        }
        assert.strictEqual(saved.cacheSize, local.cacheSize);
        
        switch(saved.loggingType) {
        case 'ON_CHANGE':
            assert.strictEqual(saved.tolerance, local.tolerance);
            break;
        case 'ALL':
            break;
        case 'NONE':
            break;
        case 'ON_TS_CHANGE':
            break;
        case 'INTERVAL':
            assert.strictEqual(saved.intervalLoggingType, local.intervalLoggingType);
            break;
        case 'ON_CHANGE_INTERVAL':
            assert.strictEqual(saved.intervalLoggingPeriod.periods, local.intervalLoggingPeriod.periods);
            assert.strictEqual(saved.intervalLoggingPeriod,periodType, local.intervalLoggingPeriod.periodType);
            assert.strictEqual(saved.overrideIntervalLoggingSamples, local.overrideIntervalLoggingSamples);
            if(saved.overrideIntervalLoggingSamples === true) {
                assert.strictEqual(saved.intervalLoggingSampleWindowSize, local.intervalLoggingSampleWindowSize);
            }
            break;
        }
    },
    
    assertAlarmLevels(saved, stored){
        var assertedEventTypes = [];
        assert.strictEqual(saved.length, stored.length);
        for(var i=0; i<stored.length; i++){
            var found = false;
            for(var j=0; j<saved.length; j++){
                if(stored[i].eventType === saved[j].eventType){
                    found = true;
                    assert.strictEqual(saved.level, stored.level);
                    assertedEventTypes.push(saved[i].eventType);
                    break;
                }
            }
            if(found === false)
                assert.fail('Did not find event type: ' + stored[i].eventType);
        }
    },
    
    assertPermissions(saved, stored) {
        assert.strictEqual(saved.length, stored.length);
        for(var i=0; i<stored.length; i++){
            assert.include(saved, stored[i], stored[i] + ' was not found in permissions');
        }
    },
    
    safeSplitPermission(permissionString) {
        if(permissionString != null) {
            return permissionString.split(',');
        }else{
            return [];
        }
    }
    
});

module.exports = testHelper;