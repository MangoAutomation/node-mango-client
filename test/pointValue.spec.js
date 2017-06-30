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

describe('Point value service', function() {
    before('Login', config.login);
    this.timeout(20000);

    it('Creates a new virtual data source that is enabled', () => {
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

    it('Creates binary virtual data point that is enabled', () => {

      const dp = new DataPoint({
            xid : "dp_mango_client_test",
            deviceName : "_",
            name : "Virtual Test Point 1",
            enabled : true,
            templateXid : "Binary_Default",
            loggingProperties : {
              tolerance : 0.0,
              discardExtremeValues : false,
              discardLowLimit : -1.7976931348623157E308,
              discardHighLimit : 1.7976931348623157E308,
              loggingType : "ON_CHANGE",
              intervalLoggingType: "INSTANT",
              intervalLoggingPeriod : {
                periods : 15,
                type : "MINUTES"
              },
              overrideIntervalLoggingSamples : false,
              intervalLoggingSampleWindowSize : 0,
              cacheSize : 1
            },
            textRenderer : {
              zeroLabel : "zero",
              zeroColour : "blue",
              oneLabel : "one",
              oneColour : "black",
              type : "textRendererBinary"
            },
            chartRenderer : {
              limit : 10,
              type : "chartRendererTable"
            },
            dataSourceXid : "mango_client_test",
            useIntegralUnit : false,
            useRenderedUnit : false,
            readPermission : "read",
            setPermission : "write",
            chartColour : "",
            rollup : "NONE",
            plotType : "STEP",
            purgeOverride : false,
            purgePeriod : {
              periods : 1,
              type : "YEARS"
            },
            unit : "",
            pointFolderId : 0,
            integralUnit : "s",
            renderedUnit : "",
            modelType : "DATA_POINT",
            pointLocator : {
              startValue : "true",
              modelType : "PL.VIRTUAL",
              dataType : "BINARY",
              settable : true,
              changeType : "ALTERNATE_BOOLEAN",
              relinquishable : false
            }
          });

      return dp.save().then((savedDp) => {
        assert.equal(savedDp.xid, 'dp_mango_client_test');
        assert.equal(savedDp.name, 'Virtual Test Point 1');
        assert.equal(savedDp.enabled, true);
        assert.isNumber(savedDp.id);
      });
    });

    global.numSamples = 100;
    global.pollPeriod = 1000; //in ms
    global.endTime = new Date().getTime();
    global.startTime = global.endTime - (global.numSamples * global.pollPeriod);
    global.pointValues = [];
    var value = true;
    var time = global.startTime;
    for(var i=0; i<global.numSamples; i++){
      global.pointValues.push({
          xid: 'dp_mango_client_test',
          value: value,
          timestamp: time,
          dataType: 'BINARY'
      });
      value = !value;
      time = time + global.pollPeriod;
    }

    it('Inserts point values', () => {
      return client.restRequest({
          path: '/rest/v1/point-values',
          method: 'PUT',
          data: global.pointValues
        }).then(response => {
          return delay(1000).then(() => {
            assert.equal(global.pointValues.length, response.data.length);
          });
        });
    });

    it('Gets latest point values data point as single json array', () => {
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/latest',
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data.length);
        //Verify in reverse order of our global data
        var j = 0;
        for(var i=global.pointValues.length-1; i>=0; i--){
          assert.equal(global.pointValues[i].timestamp, response.data[j].timestamp);
          assert.equal(global.pointValues[i].value, response.data[j].value);
          j++;
        }
      });
    });

    it('Gets latest point values for data source as single json array', () => {
      return client.restRequest({
          path: '/rest/v1/point-values/mango_client_test/latest-data-source-single-array',
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<global.pointValues.length; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i]['dp_mango_client_test']);
        }
      });
    });

    it('Gets latest point values for data source as multiple json arrays', () => {
      return client.restRequest({
          path: '/rest/v1/point-values/mango_client_test/latest-data-source-multiple-arrays',
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data['dp_mango_client_test'].length);
        //Verify in reverse order of our global data
        var j=0;
        for(var i=global.pointValues.length-1; i>=0; i--){
          assert.equal(global.pointValues[i].timestamp, response.data['dp_mango_client_test'][j].timestamp);
          assert.equal(global.pointValues[i].value, response.data['dp_mango_client_test'][j].value);
          j++;
        }
      });
    });

    it('Gets latest point values for multiple points as a single json array', () => {
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/latest-multiple-points-single-array',
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<global.pointValues.length; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i]['dp_mango_client_test']);
        }
      });
    });

    it('Gets latest point values for multiple points as a multiple json arrays', () => {
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/latest-multiple-points-multiple-arrays',
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data['dp_mango_client_test'].length);
        //Verify in reverse order of our global data
        var j=0;
        for(var i=global.pointValues.length-1; i>=0; i--){
          assert.equal(global.pointValues[i].timestamp, response.data['dp_mango_client_test'][j].timestamp);
          assert.equal(global.pointValues[i].value, response.data['dp_mango_client_test'][j].value);
          j++;
        }
      });
    });

    it('Gets first and last point values', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/first-last?from=' + isoFrom + '&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(2, response.data.length);
        //Verify first
        assert.equal(global.pointValues[0].timestamp, response.data[0].timestamp);
        assert.equal(global.pointValues[0].value, response.data[0].value);
        //Verify last
        assert.equal(global.pointValues[global.pointValues.length-1].timestamp, response.data[1].timestamp);
        assert.equal(global.pointValues[global.pointValues.length-1].value, response.data[1].value);
      });
    });

    it('Gets point values for multiple points as single array', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/multiple-points-single-array?from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<global.pointValues.length; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i]['dp_mango_client_test']);
        }
      });
    });

    it('Gets point values for multiple points as single array with limit 20', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/multiple-points-single-array?limit=20&from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(20, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<20; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i]['dp_mango_client_test']);
        }
      });
    });

    it('Gets point values for multiple points as a multiple json arrays', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/multiple-points-multiple-arrays?from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data['dp_mango_client_test'].length);
        //Verify in order of our global data
        for(var i=0; i>global.pointValues.length; i++){
          assert.equal(global.pointValues[i].timestamp, response.data['dp_mango_client_test'][i].timestamp);
          assert.equal(global.pointValues[i].value, response.data['dp_mango_client_test'][i].value);
        }
      });
    });

    it('Gets latest point values for multiple points as a multiple json arrays with limit 20', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test/multiple-points-multiple-arrays?limit=20&from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(20, response.data['dp_mango_client_test'].length);
        //Verify in order of our global data
        for(var i=0; i>20; i++){
          assert.equal(global.pointValues[i].timestamp, response.data['dp_mango_client_test'][i].timestamp);
          assert.equal(global.pointValues[i].value, response.data['dp_mango_client_test'][i].value);
        }
      });
    });

    it('Gets point values for single point', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test?from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(global.pointValues.length, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<global.pointValues.length; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i].value);
        }
      });
    });

    it('Gets point values for single point with limit 20', () => {
      var isoFrom = new Date(global.startTime - 1).toISOString();
      var isoTo = new Date(global.endTime + 1).toISOString();
      return client.restRequest({
          path: '/rest/v1/point-values/dp_mango_client_test?limit=20&from=' + isoFrom +'&to=' + isoTo,
          method: 'GET'
      }).then(response => {
        assert.equal(20, response.data.length);
        //Verify in order of our global data
        for(var i=0; i<20; i++){
          assert.equal(global.pointValues[i].timestamp, response.data[i].timestamp);
          assert.equal(global.pointValues[i].value, response.data[i].value);
        }
      });
    });

    it('Deletes the new virtual data source and its points', () => {
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
