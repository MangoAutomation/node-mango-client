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

describe('Event detector service', () => {
    before('Login', config.login);
    before('Create data source and point', function() {
      global.ds = new DataSource({
          xid: 'mango_client_test',
          name: 'Mango client test',
          enabled: true,
          modelType: 'VIRTUAL',
          pollPeriod: { periods: 5, type: 'SECONDS' },
          purgeSettings: { override: false, frequency: { periods: 1, type: 'YEARS' } },
          alarmLevels: { POLL_ABORTED: 'URGENT' },
          editPermission: null
      });

      return global.ds.save().then((savedDs) => {
          assert.strictEqual(savedDs, global.ds);
          assert.equal(savedDs.xid, 'mango_client_test');
          assert.equal(savedDs.name, 'Mango client test');
          assert.isNumber(savedDs.id);
          global.ds.id = savedDs.id;

          global.dp = new DataPoint({
                xid : "dp_mango_client_test",
                deviceName : "_",
                name : "Virtual Test Point 1",
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

          return global.dp.save().then((savedDp) => {
            assert.equal(savedDp.xid, 'dp_mango_client_test');
            assert.equal(savedDp.name, 'Virtual Test Point 1');
            assert.equal(savedDp.enabled, false);
            assert.isNumber(savedDp.id);
            global.dp.id = savedDp.id; //Save the ID for later
          });

      });
    });

    it('Creates an event detector', () => {
      global.ped = {
        xid : "PED_mango_client_test",
        name : "When true.",
        duration : 10,
        durationType : "SECONDS",
        alarmLevel : "NONE",
        alias : "When true.",
        rtnApplicable : true,
        state: true,
        detectorSourceType : "DATA_POINT",
        sourceId : global.dp.id,
        detectorType : "BINARY_STATE",
      };
      return client.restRequest({
          path: '/rest/v2/event-detectors',
          method: 'POST',
          data: global.ped
      }).then(response => {
        global.ped.id = response.data.id;
      });
    });

    it('Updates an event detector', () => {
      global.ped = {
        xid : "PED_mango_client_test",
        name : "When true.",
        duration : 10,
        durationType : "SECONDS",
        alarmLevel : "NONE",
        alias : "When true.",
        rtnApplicable : true,
        state: false,
        detectorSourceType : "DATA_POINT",
        sourceId : global.dp.id,
        detectorType : "BINARY_STATE",
        id: global.ped.id
      };
      return client.restRequest({
          path: `/rest/v2/event-detectors/${global.ped.id}`,
          method: 'PUT',
          data: global.ped
      }).then(response => {
        assert.equal(response.data.state, false);
      });
    });
    
    /* Validation Testing */
    it('Fails to create a no update detector', () => {
    	global.ped = {
    	        xid : "PED_mango_client_test_zsnu",
    	        name : "No update for zero seconds.",
    	        duration : 0,
    	        durationType : "SECONDS",
    	        alarmLevel : "NONE",
    	        alias : "No update for zero seconds.",
    	        rtnApplicable : true,
    	        detectorSourceType : "DATA_POINT",
    	        sourceId : global.dp.id,
    	        detectorType : "NO_UPDATE",
    	      };
    	return client.restRequest({
    		path: '/rest/v2/event-detectors',
            method: 'POST',
            data: global.ped
    	}).then(response => {
    		assert.equal(true, false);
    	}).catch(response => {
    		assert.equal(/.*(422).*/.exec(response)[1], 422);
    	})
    });

    //TODO Get that detector
    //TODO Get the detectors for that point
    //TODO Get the detectors for the data source

    it('Query event detectors', () => {
      return client.restRequest({
          path: '/rest/v2/event-detectors',
          method: 'GET'
      }).then(response => {
        //TODO Confirm length of 1?
      });
    });

    it('Deletes an event detector', () => {
      return client.restRequest({
          path: `/rest/v2/event-detectors/${global.ped.id}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.id, global.ped.id);
      });
    });

    //Clean up when done
    after('Deletes the new virtual data source and its points to clean up', () => {
        return DataSource.delete('mango_client_test');
    });
});
