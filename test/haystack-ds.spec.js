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
const fs = require('fs');
const path = require('path');

/**
 *  The DemoServer.java Class Must be running on port 8000
 *    for these tests to all work.
 */
describe.only('Tests haystack datasource and tools', function() {
    before('Login', config.login);
    this.timeout(20000);

    it('Creates haystack data source', () => {

      const ds = new DataSource({
        xid : "DS_HAY_TEST",
        name : "Haystack Test",
        enabled : false,
        modelType : "HAYSTACK_DS",
        uri : 'http://localhost:8000/haystack/',
        quantize : false,
        username : 'admin',
        password: 'admin',
        connectTimeout: 0,
        readTimeout: 0,
        pollPeriod : {
          periods : 5,
          type : "SECONDS"
        },
        editPermission : "edit-test",
        purgeSettings : {
          override : false,
          frequency : {
            periods : 1,
            type : "YEARS"
          }
        },
        alarmLevels : {
          DATA_SOURCE_EXCEPTION_EVENT : "URGENT",
          POINT_READ_ERROR_EVENT : "URGENT",
          SET_POINT_FAILURE : "URGENT"
        }
      });

      return ds.save().then((savedDs) => {
        assert.equal(savedDs.xid, 'DS_HAY_TEST');
        assert.equal(savedDs.name, 'Haystack Test');
        assert.equal(savedDs.enabled, false);
        assert.equal(savedDs.uri, 'http://localhost:8000/haystack/');
        assert.equal(savedDs.quantize, false);
        assert.equal(savedDs.username, 'admin');
        assert.equal(savedDs.password, 'admin');
        assert.equal(savedDs.connectTimeout, 0);
        assert.equal(savedDs.readTimeout, 0);
        assert.equal(savedDs.editPermission, "edit-test");
        assert.isNumber(savedDs.id);
      });
    });

    it('Creates haystack data point', () => {

      const dp = new DataPoint({
            xid : "DP_HAY_TEST",
            deviceName : "HAY",
            name : "Haystack Test Point 1",
            enabled : false,
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
            dataSourceXid : "DS_HAY_TEST",
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
              id : '10',
              modelType : "PL.HAYSTACK",
              dataType : "BINARY",
              settable : false,
              relinquishable : false
            },
          });

      return dp.save().then((savedDp) => {
        assert.equal(savedDp.xid, 'DP_HAY_TEST');
        assert.equal(savedDp.name, 'Haystack Test Point 1');
        assert.equal(savedDp.enabled, false);

        assert.equal(savedDp.pointLocator.id, '10');
        assert.equal(savedDp.pointLocator.dataType, "BINARY");
        assert.equal(savedDp.pointLocator.settable, false);
        assert.equal(savedDp.pointLocator.relinquishable, false);

        assert.isNumber(savedDp.id);
      });
    });

    it('Copies haystack data source', () => {
      return client.restRequest({
          path: '/rest/v1/data-sources/copy/DS_HAY_TEST?copyXid=DS_HAY_TEST_COPY&copyName=HAY_TEST_COPY_NAME',
          method: 'PUT'
      }).then(response => {
        assert.equal(response.data.xid, 'DS_HAY_TEST_COPY');
        assert.equal(response.data.name, 'HAY_TEST_COPY_NAME');
        assert.isNumber(response.data.id);
      });
    });

    it('Deletes the copy haystack data source and its point', () => {
        return DataSource.delete('DS_HAY_TEST_COPY');
    });

    //TODO Enable when we get a publisher setup
    it.skip('Queries against demo haystack database', () => {
      return client.restRequest({
          path: '/rest/v2/haystack-rest/demo/read?filter=point',
          method: 'GET'
      }).then(response => {

      });
    });

    it('Queries against haystack via data source', () => {
      return client.restRequest({
          //equates to filter=point request on server
          path: '/rest/v2/haystack-ds/DS_HAY_TEST/read/point',
          method: 'GET'
      }).then(response => {
        assert(response.data.meta.ver, '2.0');
        assert(response.data.cols.length, 11);
        assert(response.data.rows.length, 30);
//        for(var i=0; i<response.data.cols.length; i++)
//          console.log(response.data.cols[i]);
//        for(var i=0; i<response.data.rows.length; i++)
//          console.log(response.data.rows[i]);
      });
    });

    it('Requests historical data from haystack server', () => {
        var start = new Date().getTime() - (1000*60*60*4); //4Hrs ago
        var isoFrom = new Date(start).toISOString();
        var isoTo = new Date(start + (1000*60*60*4)).toISOString();
        return client.restRequest({
            path: '/rest/v2/haystack-ds/DS_HAY_TEST/history-import?timezone=America/New_York&from=' + isoFrom + '&isoTo=' + isoTo,
            method: 'GET'
        }).then(response => {
          return delay(500).then(() => {
            return client.restRequest({
              path: response.headers.location,
              method: 'GET'
            }).then(response => {
              assert.equal(response.data.results[0].imported, 16); //Dummy data is every 15 minutes
              assert.equal(response.data.finished, true);
            });
          });
        });
    });

    it('Deletes the new haystack data source and its point', () => {
        return DataSource.delete('DS_HAY_TEST');
    });

    /* Helper Method */
    function delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
});
