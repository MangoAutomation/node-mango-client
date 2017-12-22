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

describe('Point values v2', function() {
    before('Login', config.login);
    
    const newDataPoint = (xid, dsXid) => {
        return new DataPoint({
            xid: xid,
            enabled: true,
            name: 'Point values test',
            deviceName: 'Point values test',
            dataSourceXid : dsXid,
            pointLocator : {
                startValue : '0',
                modelType : 'PL.VIRTUAL',
                dataType : 'NUMERIC',
                changeType : 'NO_CHANGE',
                settable: true
            }
        });
    };

    const generateSamples = (xid, startTime, numSamples, pollPeriod) => {
        const pointValues = [];
        let time = startTime;
        for (let i = 0; i < numSamples; i++) {
            pointValues.push({
                xid: xid,
                value: Math.random() * 100,
                timestamp: time,
                dataType: 'NUMERIC'
            });
            time += pollPeriod;
        }
        return pointValues;
    };

    const comparePointValues = (options) => {
        const valueProperty = options.valueProperty || 'value';
        let responseData = options.responseData;
        let expectedValues = options.expectedValues;
        
        assert.isArray(responseData);
        assert.strictEqual(responseData.length, expectedValues.length);
        
        expectedValues.forEach((expectedValue, i) => {
            assert.strictEqual(responseData[i].timestamp, expectedValue.timestamp);
            
            const value = responseData[i][valueProperty];
            if (typeof value === 'number') {
                assert.strictEqual(value, expectedValue.value);
            } else {
                assert.strictEqual(value.value, expectedValue.value);
            }
        });
    };

    const insertionDelay = 1000;
    
    const numSamples = 100;
    const pollPeriod = 1000; //in ms
    const endTime = new Date().getTime();
    const startTime = endTime - (numSamples * pollPeriod);
    const isoFrom = new Date(startTime).toISOString();
    const isoTo = new Date(endTime).toISOString();
    const testPointXid1 = uuidV4();
    const testPointXid2 = uuidV4();
    
    const pointValues1 = generateSamples(testPointXid1, startTime, numSamples, pollPeriod);
    const pointValues2 = generateSamples(testPointXid2, startTime, numSamples, pollPeriod);
    
    before('Create a virtual data source, points, and insert values', function() {
        this.timeout(insertionDelay * 2);
        
        this.ds = new DataSource({
            xid: uuidV4(),
            name: 'Mango client test',
            enabled: true,
            modelType: 'VIRTUAL',
            pollPeriod: { periods: 5, type: 'HOURS' },
            purgeSettings: { override: false, frequency: { periods: 1, type: 'YEARS' } },
            alarmLevels: { POLL_ABORTED: 'URGENT' },
            editPermission: null
        });

        return this.ds.save().then((savedDs) => {
            assert.strictEqual(savedDs.name, 'Mango client test');
            assert.isNumber(savedDs.id);
        }).then(() => {
            this.testPoint1 = newDataPoint(testPointXid1, this.ds.xid);
            this.testPoint2 = newDataPoint(testPointXid2, this.ds.xid);
            return Promise.all([this.testPoint1.save(), this.testPoint2.save()]);
        }).then(() => {
            const valuesToInsert = pointValues1.concat(pointValues2);
            return client.pointValues.insert(valuesToInsert);
        }).then(() => config.delay(insertionDelay));
    });

    after('Deletes the new virtual data source and its points', function() {
        return this.ds.delete();
    });

    it('Gets latest point values for a data point', function() {
        return client.pointValues.latest({
            xid: testPointXid1
        }).then(result => {
            assert.isArray(result);
            comparePointValues({
                responseData: result.slice().reverse(),
                expectedValues: pointValues1
            });
        });
    });

    it('Gets latest point values for a data point with a limit of 20', function() {
        return client.pointValues.latest({
            xid: testPointXid1,
            limit: 20
        }).then(result => {
            assert.isArray(result);
            comparePointValues({
                responseData: result.slice().reverse(),
                expectedValues: pointValues1.slice(-20)
            });
        });
    });

    it('Gets latest point values for multiple points as a single array', function() {
        return client.pointValues.latestAsSingleArray({
            xids: [testPointXid1, testPointXid2]
        }).then(result => {
            assert.isArray(result);
            
            comparePointValues({
                responseData: result.slice().reverse(),
                expectedValues: pointValues1,
                valueProperty: testPointXid1
            });
            comparePointValues({
                responseData: result.slice().reverse(),
                expectedValues: pointValues2,
                valueProperty: testPointXid2
            });
        });
    });

    it('Gets latest point values for multiple points', function() {
        return client.pointValues.latest({
            xids: [testPointXid1, testPointXid2]
        }).then(result => {
            assert.isArray(result[testPointXid1]);
            assert.isArray(result[testPointXid2]);
            
            comparePointValues({
                responseData: result[testPointXid1].slice().reverse(),
                expectedValues: pointValues1
            });
            comparePointValues({
                responseData: result[testPointXid2].slice().reverse(),
                expectedValues: pointValues2
            });
        });
    });

    it('Queries time period for multiple points as single array', function() {
        return client.pointValues.forTimePeriodAsSingleArray({
            xids: [testPointXid1, testPointXid2],
            from: startTime,
            to: endTime
        }).then(result => {
            comparePointValues({
                responseData: result,
                expectedValues: pointValues1,
                valueProperty: testPointXid1
            });
            comparePointValues({
                responseData: result,
                expectedValues: pointValues2,
                valueProperty: testPointXid2
            });
        });
    });

    it('Queries time period for multiple points as single array with limit 20', function() {
        return client.pointValues.forTimePeriodAsSingleArray({
            xids: [testPointXid1, testPointXid2],
            from: startTime,
            to: endTime,
            limit: 20
        }).then(result => {
            comparePointValues({
                responseData: result,
                expectedValues: pointValues1.slice(0, 10),
                valueProperty: testPointXid1
            });
            comparePointValues({
                responseData: result,
                expectedValues: pointValues2.slice(0, 10),
                valueProperty: testPointXid2
            });
        });
    });

    it('Queries time period for multiple points', function() {
        return client.pointValues.forTimePeriod({
            xids: [testPointXid1, testPointXid2],
            from: startTime,
            to: endTime
        }).then(result => {
            comparePointValues({
                responseData: result[testPointXid1],
                expectedValues: pointValues1
            });
            comparePointValues({
                responseData: result[testPointXid2],
                expectedValues: pointValues2
            });
        });
    });

    it('Queries time period for multiple points with limit 20', function() {
        return client.pointValues.forTimePeriod({
            xids: [testPointXid1, testPointXid2],
            from: startTime,
            to: endTime,
            limit: 20
        }).then(result => {
            comparePointValues({
                responseData: result[testPointXid1],
                expectedValues: pointValues1.slice(0, 20)
            });
            comparePointValues({
                responseData: result[testPointXid2],
                expectedValues: pointValues2.slice(0, 20)
            });
        });
    });

    it('Queries time period for single point', function() {
        return client.pointValues.forTimePeriod({
            xid: testPointXid1,
            from: startTime,
            to: endTime
        }).then(result => {
            comparePointValues({
                responseData: result,
                expectedValues: pointValues1
            });
        });
    });

    it('Queries time period for single point with limit 20', function() {
        return client.pointValues.forTimePeriod({
            xid: testPointXid1,
            from: startTime,
            to: endTime,
            limit: 20
        }).then(result => {
            comparePointValues({
                responseData: result,
                expectedValues: pointValues1.slice(0, 20)
            });
        });
    });
});
