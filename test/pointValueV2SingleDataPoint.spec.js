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

describe('Point value V2 service', function() {
    before('Login', config.login);

    //TODO Remove when done debugging
    //this.timeout(200000);

    //TODO Put this somewhere nice
    //Return a date YYYY-MM-ddTHH:mm:ss.SSS{offset}
    Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
        pad2 = function(num){
          var norm = Math.floor(Math.abs(num))
          if(norm < 10)
            return '00' + norm;
          else if(norm < 100)
            return '0' + norm;
          else
            return norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        '.' + pad2(this.getMilliseconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
      }

    global.numericPointXid = 'dp_numeric';
    global.binaryPointXid = 'dp_binary';

    before('Creates a new virtual data source that is enabled', () => {
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

    before('Create numeric point', () => {
        const dp = new DataPoint({
            name: 'Numeric Point',
            xid: global.numericPointXid,
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
            assert.equal(savedDp.xid, global.numericPointXid);
            assert.equal(savedDp.name, 'Numeric Point');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
        });
    });

    before('Create binary point', () => {
        const dp = new DataPoint({
            name: 'Binary Point',
            xid: global.binaryPointXid,
            dataSourceXid : 'mango_client_test',
            pointLocator : {
                startValue : 'true',
                modelType : 'PL.VIRTUAL',
                dataType : 'BINARY',
                settable : true,
                changeType : 'NO_CHANGE',
            }
        });

        return dp.save().then((savedDp) => {
            assert.equal(savedDp.xid, global.binaryPointXid);
            assert.equal(savedDp.name, 'Binary Point');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
        });
    });

    //Setup the data
    before('Generate Data', () => {
      global.numSamples = 100;
      global.pollPeriod = 1000; //in ms
      global.endTime = new Date().getTime();
      global.startTime = global.endTime - ((global.numSamples - 1) * global.pollPeriod);
      global.pointValues = {};
      global.pointValues[global.binaryPointXid] = [];
      global.pointValues[global.numericPointXid] = [];

      var binaryValue = true;
      var numericValue = 0.0;
      var time = global.startTime;
      for(var i=0; i<global.numSamples; i++){
        global.pointValues[global.binaryPointXid].push({
            xid: global.binaryPointXid,
            value: binaryValue,
            timestamp: time,
            dataType: 'BINARY'
        });
        global.pointValues[global.numericPointXid].push({
            xid: global.numericPointXid,
            value: numericValue,
            timestamp: time,
            dataType: 'NUMERIC'
        });
        numericValue = numericValue + 1;
        binaryValue = !binaryValue;
        //console.log(new Date(time).toIsoString());
        time = time + global.pollPeriod;
      }
      //console.log('Start ' + new Date(global.startTime).toIsoString());
      //console.log('End ' + new Date(global.endTime).toIsoString());
    });


    before('Inserts point values', () => {
      var allPointValues = [];
      for(var i=0; i<global.numSamples; i++){
        allPointValues.push(global.pointValues[global.binaryPointXid][i]);
        allPointValues.push(global.pointValues[global.numericPointXid][i]);
      }
      return client.restRequest({
          path: '/rest/v2/point-values',
          method: 'POST',
          data: allPointValues
        }).then(response => {
          for(var i=0; i<response.data.length; i++){
            assert.equal(response.data[i].total, global.numSamples)
          }
        });
    });

    it('Gets all numeric data point values with start/end bookends, NONE rollup and ISO Date Format output', () => {
      //Note that a final bookend is always returned because the query is based on < to
      var isoFrom = new Date(global.startTime + 1).toIsoString();
      var isoTo = new Date(global.endTime + 1).toIsoString();
      return client.restRequest({
          path: '/rest/v2/point-values/' + global.numericPointXid,
          params: {
            from: isoFrom,
            to: isoTo,
            dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          },
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, global.numSamples + 1);
        //Verify in order of our global data
        for(var i=0; i<global.numSamples; i++){
          if(response.data[i].bookend == false){
            assert.equal(response.data[i].timestamp, new Date(global.pointValues[global.numericPointXid][i].timestamp).toIsoString());
            assert.equal(response.data[i].value, global.pointValues[global.numericPointXid][i].value);
          }
        }
      });
    });

    it('Gets all numeric data point values, NONE rollup and ISO Date Format output', () => {
      //Note that a final bookend is always returned because the query is based on < to
      var isoFrom = new Date(global.startTime).toIsoString();
      var isoTo = new Date(global.endTime + 1).toIsoString();
      return client.restRequest({
          path: '/rest/v2/point-values/' + global.numericPointXid,
          params: {
            from: isoFrom,
            to: isoTo,
            dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          },
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, global.numSamples + 1);
        //Verify in order of our global data
        for(var i=0; i<global.numSamples; i++){
          if(response.data[i].bookend == false){
            assert.equal(response.data[i].timestamp, new Date(global.pointValues[global.numericPointXid][i].timestamp).toIsoString());
            assert.equal(response.data[i].value, global.pointValues[global.numericPointXid][i].value);
          }
        }
      });
    });

    it('Gets numeric data point values with limit, NONE rollup expect bookends', () => {
      var isoFrom = new Date(global.startTime).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      var limit = global.numSamples - 2;
      return client.restRequest({
          path: '/rest/v2/point-values/' + global.numericPointXid,
          params: {
            limit: limit,
            from: isoFrom,
            to: isoTo
          },
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, limit + 1);
        //Verify the bookends
        assert.equal(response.data[0].timestamp, global.startTime);
        assert.equal(response.data[limit].timestamp, global.endTime + 1);
        //Verify in order of our global data
        for(var i=0; i<response.data.length; i++){
          if(response.data[i].bookend == false){
            assert.equal(response.data[i].timestamp, global.pointValues[global.numericPointXid][i].timestamp);
            assert.equal(response.data[i].value, global.pointValues[global.numericPointXid][i].value);
          }
        }
      });
    });

    it('Gets all numeric data point values, AVERAGE 1s rollup and ISO Date Format output', () => {
      var isoFrom = new Date(global.startTime).toIsoString();
      var isoTo = new Date(global.endTime + 1).toIsoString();
      return client.restRequest({
          path: '/rest/v2/point-values/' + global.numericPointXid,
          params: {
            from: isoFrom,
            to: isoTo,
            rollup: 'AVERAGE',
            timePeriods: 1,
            timePeriodType: 'SECONDS',
            dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          },
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, global.numSamples);
        //Verify in order of our global data
        for(var i=0; i<global.numSamples; i++){
          assert.equal(response.data[i].timestamp, new Date(global.pointValues[global.numericPointXid][i].timestamp).toIsoString());
          assert.equal(response.data[i].value, global.pointValues[global.numericPointXid][i].value);
        }
      });
    });

    it('Gets all numeric data point values, ALL 1s rollup and ISO Date Format output', () => {
      var isoFrom = new Date(global.startTime).toIsoString();
      var isoTo = new Date(global.endTime + 1).toIsoString();
      return client.restRequest({
          path: '/rest/v2/point-values/' + global.numericPointXid,
          params: {
            from: isoFrom,
            to: isoTo,
            rollup: 'ALL',
            timePeriods: 1,
            timePeriodType: 'SECONDS',
            dateTimeFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          },
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, global.numSamples);
        //Verify in order of our global data
        for(var i=0; i<global.numSamples; i++){
          assert.equal(response.data[i].timestamp, new Date(global.pointValues[global.numericPointXid][i].timestamp).toIsoString());
          assert.equal(response.data[i].AVERAGE, global.pointValues[global.numericPointXid][i].value);
        }
      });
    });

    //TODO Test EVERY SINGLE STATISTIC
    //TODO Test Rollup with LIMIT

    after('Deletes the new virtual data source and its points', () => {
        return DataSource.delete('mango_client_test');
    });

    /**
     * Helper delay function
     */
    function delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

});
