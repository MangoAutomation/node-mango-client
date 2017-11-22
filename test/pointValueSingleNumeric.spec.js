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

describe.skip('Numeric Point value tests', function() {
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

    before('Create numeric point', function() {
        const dp = new DataPoint({
            name: 'Numeric Point',
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
            assert.equal(savedDp.name, 'Numeric Point');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
        });
    });

    afterEach('Delete all values for point', () => {
        return client.pointValues.deletePointValues('dp_numeric1', {from: 0, to: moment()})
    });

    after('Deletes the new virtual data source and its points', () => {
        return DataSource.delete('mango_client_test');
    });

    it('GET numeric data point values with start/end bookends, NONE rollup and ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData('dp_numeric1', 5, 1000, this.tz);
            return client.pointValues.savePointValues(this.historicalData.values).then(response => {
                //Ensure we get a start bookend by querying before the 1st data value and after last
                var from = moment.tz(this.historicalData.from.valueOf() - 1, this.tz);
                var to = moment.tz(this.historicalData.to.valueOf() + 1, this.tz);
                return client.pointValues.getPointValues('dp_numeric1',
                    {
                        useRendered: false,
                        dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                        from: from,
                        to: to,
                        timezone: this.tz,
                        bookend: true
                    }).then(data => {
                    assert.equal(data.length, this.historicalData.values.length + 2);
                    var valueCount = 0;
                    for(var i=0; i<data.length; i++){
                        if(data[i].bookend != true){
                            assert.equal(data[i].timestamp, moment.tz(this.historicalData.values[valueCount].timestamp, this.tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
                            assert.equal(data[i].value, this.historicalData.values[valueCount].value);
                            valueCount++;
                        }
                    }
                });
            })
        });
    });

    //TODO test limit

    it('GET numeric data point values 1s AVERAGE rollup, ISO Date Format output, rendered value', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData('dp_numeric1', 5, 1000, this.tz);
            return client.pointValues.savePointValues(this.historicalData.values).then(response => {
                var to = moment.tz(this.historicalData.to.valueOf() + 1, this.tz);
                return client.pointValues.getRollupPointValues(
                    'dp_numeric1', 'AVERAGE',
                    {
                        useRendered: true,
                        dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                        from: this.historicalData.from,
                        to: to,
                        timezone: this.tz,
                        timePeriods: 1,
                        timePeriodType: 'SECONDS'
                    }).then(data => {
                    assert.equal(data.length, this.historicalData.values.length);
                    for(var i=0; i<data.length; i++){
                        assert.equal(data[i].timestamp, moment.tz(this.historicalData.values[i].timestamp, this.tz).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
                        assert.equal(data[i].value, this.historicalData.values[i].value);
                    }
                });
            })
        });
    });

    it('GET numeric data point values with start/end bookends as csv, NONE rollup and ISO Date Format output', function() {
        return client.User.current().then(function(user){
            this.tz = user.systemTimezone;
            this.historicalData = client.pointValues.generateIncrementalNumericData('dp_numeric1', 5, 1000, this.tz);
            return client.pointValues.savePointValues(this.historicalData.values).then(response => {
                //Ensure we get a start bookend by querying before the 1st data value and after last
                var from = moment.tz(this.historicalData.from.valueOf() - 1, this.tz);
                var to = moment.tz(this.historicalData.to.valueOf() + 1, this.tz);
                return client.pointValues.getPointValuesCsv(
                    'dp_numeric1', {
                        useRendered: false,
                        dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
                        from: from,
                        to: to,
                        timezone: this.tz
                    }).then(data => {
                    console.log(data);
                    //TODO Validate CSV Format
                }).then(null, response =>{
                    console.log(response.data);
                });
            })
        });
    });

});
