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
const moment = require('moment-timezone');

describe.skip('Multiple Numeric Point value tests', function() {
    before('Login', config.login);

    //TODO Remove when done debugging
    this.timeout(200000);

    before('Creates a new virtual data source that is enabled', function() {
        const ds = new DataSource({
            xid: 'mango_client_test',
            name: 'Mango client test',
            deviceName: 'Mango client device name',
            enabled: true,
            modelType: 'VIRTUAL',
            pollPeriod: { periods: 5, type: 'HOURS' },
            purgeSettings: { override: false, frequency: { periods: 1, type: 'YEARS' } },
            alarmLevels: { POLL_ABORTED: 'URGENT' },
            editPermission: null
        });

        return ds.save().then((savedDs) => {
            assert.strictEqual(savedDs, ds);
            assert.equal(savedDs.xid, 'mango_client_test');
            assert.equal(savedDs.name, 'Mango client test');
            assert.isNumber(savedDs.id);
        });
    });

    before('Create numeric point 1', function() {
        const dp = new DataPoint({
            name: 'Numeric Point 1',
            xid: 'dp_numeric1',
            dataSourceXid : 'mango_client_test',
            pointLocator : {
                startValue : '0',
                modelType : 'PL.VIRTUAL',
                dataType : 'NUMERIC',
                settable : true,
                changeType : 'NO_CHANGE'
            }
        });

        return dp.save().then((savedDp) => {
            assert.equal(savedDp.xid, 'dp_numeric1');
            assert.equal(savedDp.name, 'Numeric Point 1');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
        });
    });

    before('Create numeric point 2', function() {
        const dp = new DataPoint({
            name: 'Numeric Point 2',
            xid: 'dp_numeric2',
            dataSourceXid : 'mango_client_test',
            pointLocator : {
                startValue : '0',
                modelType : 'PL.VIRTUAL',
                dataType : 'NUMERIC',
                settable : true,
                changeType : 'NO_CHANGE'
            }
        });

        return dp.save().then((savedDp) => {
            assert.equal(savedDp.xid, 'dp_numeric2');
            assert.equal(savedDp.name, 'Numeric Point 2');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
        });
    });

    afterEach('Delete all values for point 1', () => {
        return client.pointValues.deletePointValues('dp_numeric1', 0, moment());
    });
    afterEach('Delete all values for point 2', () => {
        return client.pointValues.deletePointValues('dp_numeric2', 0, moment());
    });

    after('Deletes the new virtual data source and its points', () => {
        return DataSource.delete('mango_client_test');
    });

    it('GET all numeric data point values with start/end bookends, Single array, ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData(['dp_numeric1','dp_numeric2'], 5, 1000, this.tz);
            this.allHistoricalData = [];
            for(var i=0; i<this.historicalData['dp_numeric1'].values.length; i++){
                this.allHistoricalData.push(this.historicalData['dp_numeric1'].values[i]);
                this.allHistoricalData.push(this.historicalData['dp_numeric2'].values[i]);
            }
            return client.pointValues.savePointValues(this.allHistoricalData).then(response => {
                //Ensure we get a start bookend by querying before the 1st data value and after last
                var from = moment.tz(this.historicalData['dp_numeric1'].from.valueOf() - 1, this.tz);
                var to = moment.tz(this.historicalData['dp_numeric1'].to.valueOf() + 1, this.tz);
                return client.pointValues.getPointValuesMultiple(['dp_numeric1','dp_numeric2'], false, false, false,
                    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                    from, to, this.tz, null, true).then(data => {
                    assert.equal(data.length, 7);
                    var valueCount = 0;
                    for(var i=0; i<data.length; i++){
                        if(data[i]['dp_numeric1'].bookend != true){
                            assert.equal(data[i].timestamp, moment.tz(this.historicalData['dp_numeric1'].values[valueCount].timestamp, this.tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
                            assert.equal(data[i]['dp_numeric1'].value, this.historicalData['dp_numeric1'].values[valueCount].value);
                            assert.equal(data[i]['dp_numeric2'].value, this.historicalData['dp_numeric2'].values[valueCount].value);
                            valueCount++;
                        }
                    }
                });
            })
        });
    });

    //TODO test limit

    it('GET all numeric data point values, 1s, AVERAGE rollup and ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData(['dp_numeric1','dp_numeric2'], 5, 1000, this.tz);
            this.allHistoricalData = [];
            for(var i=0; i<this.historicalData['dp_numeric1'].values.length; i++){
                this.allHistoricalData.push(this.historicalData['dp_numeric1'].values[i]);
                this.allHistoricalData.push(this.historicalData['dp_numeric2'].values[i]);
            }
            return client.pointValues.savePointValues(this.allHistoricalData).then(response => {
                var to = moment.tz(this.historicalData['dp_numeric1'].to.valueOf() + 1, this.tz);
                return client.pointValues.getRollupPointValuesMultiple(
                    ['dp_numeric1','dp_numeric2'], false, false, false,
                    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                    this.historicalData['dp_numeric1'].from, to, this.tz,
                    'AVERAGE', 1, 'SECONDS', true).then(data => {
                    assert.equal(data.length, 5);
                    var valueCount = 0;
                    for(var i=0; i<data.length; i++){
                        assert.equal(data[i].timestamp, moment.tz(this.historicalData['dp_numeric1'].values[i].timestamp, this.tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
                        assert.equal(data[i]['dp_numeric1'].value, this.historicalData['dp_numeric1'].values[i].value);
                        assert.equal(data[i]['dp_numeric2'].value, this.historicalData['dp_numeric2'].values[i].value);
                    }
                });
            })
        });
    });

    it('GET all numeric data point values with different number of samples, 1s, AVERAGE rollup and ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData(['dp_numeric1','dp_numeric2'], 5, 1000, this.tz);
            var to = this.historicalData['dp_numeric2'].to.valueOf() + 1000;
            var value = 6;
            for(var i=0; i<10; i++){
                this.historicalData['dp_numeric2'].values.push({
                    xid: 'dp_numeric2',
                    value: value,
                    timestamp: to,
                    dataType: 'NUMERIC'
                });
                to = to + 1000;
                value++;
            }
            this.to = to;
            this.allHistoricalData = [];
            for(var i=0; i<this.historicalData['dp_numeric1'].values.length; i++){
                this.allHistoricalData.push(this.historicalData['dp_numeric1'].values[i]);
            }
            for(var i=0; i<this.historicalData['dp_numeric2'].values.length; i++){
                this.allHistoricalData.push(this.historicalData['dp_numeric2'].values[i]);
            }
            return client.pointValues.savePointValues(this.allHistoricalData).then(response => {

                return client.pointValues.getRollupPointValuesMultiple(
                    ['dp_numeric1','dp_numeric2'], false, false, false,
                    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                    this.historicalData['dp_numeric1'].from, this.to, this.tz,
                    'AVERAGE', 1, 'SECONDS', true).then(data => {
                    assert.equal(data.length, 15);
                    var valueCount = 0;
                    for(var i=0; i<data.length; i++){
                        assert.equal(data[i].timestamp, moment.tz(this.historicalData['dp_numeric2'].values[i].timestamp, this.tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
                        if(i < 4)
                            assert.equal(data[i]['dp_numeric1'].value, this.historicalData['dp_numeric1'].values[i].value);
                        assert.equal(data[i]['dp_numeric2'].value, this.historicalData['dp_numeric2'].values[i].value);
                    }
                });
            })
        });
    });

    it.skip('GET all numeric data point values with start/end bookends as single array csv, NONE rollup and ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData(['dp_numeric1','dp_numeric2'], 5, 1000, this.tz);
            this.allHistoricalData = [];
            for(var i=0; i<this.historicalData['dp_numeric1'].values.length; i++){
                this.allHistoricalData.push(this.historicalData['dp_numeric1'].values[i]);
                this.allHistoricalData.push(this.historicalData['dp_numeric2'].values[i]);
            }

            return client.pointValues.savePointValues(this.allHistoricalData).then(response => {
                //Ensure we get a start bookend by querying before the 1st data value and after last
                var from = moment.tz(this.historicalData['dp_numeric1'].from.valueOf() - 1, this.tz);
                var to = moment.tz(this.historicalData['dp_numeric1'].to.valueOf() + 1, this.tz);
                return client.pointValues.getPointValuesMultipleCsv(['dp_numeric1','dp_numeric2'], false, false, false,
                    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                    from, to, this.tz, null, true).then(data => {
                    console.log(data);
                    assert.equal(data.length, this.historicalData['dp_numeric1'].values.length + 2);
                    var valueCount = 0;
                    for(var i=0; i<data.length; i++){
                        //TODO Validate the CSV Output
                    }
                });
            })
        });
    });

});
