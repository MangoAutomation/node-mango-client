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

describe('Test MetaDataSource tools', function() {
    before('Login', config.login);
    this.timeout(10000);
    it('Create virtual data source for trigger and target', () => {

      const vrtDs = new DataSource({
    	  xid: "mst-virtual",
    	  name: "metaSetTest-virtual",
    	  enabled: true,
    	  modelType: "VIRTUAL",
    	  validationMessages: [],
    	  pollPeriod: {
    	    periods: 5,
    	    type: "MINUTES"
    	  },
    	  polling: false,
    	  editPermission: "edit-test",
    	  purgeSettings: {
    	    override: false,
    	    frequency: {
    	      periods: 1,
    	      type: "YEARS"
    	    }
    	  },
    	  alarmLevels: {
    	    POLL_ABORTED: "URGENT"
    	  }
      });

      return vrtDs.save().then((savedDs) => {
        assert.equal(savedDs.xid, 'mst-virtual');
        assert.equal(savedDs.name, 'metaSetTest-virtual');
        assert.equal(savedDs.enabled, true);
        assert.equal(savedDs.polling, false);
        assert.equal(savedDs.pollPeriod.periods, 5);
        assert.equal(savedDs.pollPeriod.type, "MINUTES");

        assert.equal(savedDs.editPermission, "edit-test");
        assert.isNumber(savedDs.id);
      });
    });

    it('Create virtual trigger', () => {

        const trigger = new DataPoint({
        	  enabled: true,
        	  loggingProperties: {
        	    tolerance: 0,
        	    discardExtremeValues: false,
        	    discardLowLimit: -1.7976931348623157e+308,
        	    discardHighLimit: 1.7976931348623157e+308,
        	    loggingType: "ON_CHANGE",
        	    intervalLoggingType: "INSTANT",
        	    intervalLoggingPeriod: {
        	      periods: 15,
        	      type: "MINUTES"
        	    },
        	    overrideIntervalLoggingSamples: false,
        	    intervalLoggingSampleWindowSize: 0,
        	    cacheSize: 1
        	  },
        	  textRenderer: {
        	    zeroLabel: "zero",
        	    zeroColour: "blue",
        	    oneLabel: "one",
        	    oneColour: "black",
        	    type: "textRendererBinary"
        	  },
        	  chartRenderer: {
        	    limit: 10,
        	    type: "chartRendererTable"
        	  },
        	  modelType: "DATA_POINT",
        	  validationMessages: [],
        	  deviceName: "metaSetTest-virtual",
        	  rollup: "NONE",
        	  purgeOverride: false,
        	  purgePeriod: {
        	    periods: 1,
        	    type: "YEARS"
        	  },
        	  chartColour: "",
        	  pointLocator: {
        	    offset: 0,
        	    values: [],
        	    min: 0,
        	    period: 0,
        	    max: 0,
        	    attractionPointXid: "DP_c04987be-827b-4e18-91b8-0091998af6fe",
        	    roll: false,
        	    volatility: 0,
        	    maxChange: 0,
        	    change: 0,
        	    amplitude: 0,
        	    startValue: "false",
        	    modelType: "PL.VIRTUAL",
        	    dataType: "BINARY",
        	    settable: true,
        	    changeType: "NO_CHANGE",
        	    relinquishable: false
        	  },
        	  plotType: "STEP",
        	  setPermission: "",
        	  readPermission: "",
        	  useRenderedUnit: false,
        	  useIntegralUnit: false,
        	  dataSourceName: "metaSetTest-virtual",
        	  dataSourceXid: "mst-virtual",
        	  integralUnit: "s",
        	  renderedUnit: "",
        	  unit: "",
        	  pointFolderId: 0,
        	  name: "trigger",
        	  xid: "mst-trigger"
        	});

        return trigger.save().then((savedDp) => {
          assert.equal(savedDp.xid, 'mst-trigger');
          assert.equal(savedDp.name, 'trigger');
          assert.equal(savedDp.enabled, true);
          assert.equal(savedDp.pointLocator.startValue, "false");

          assert.isNumber(savedDp.id);
        });
      });

    it('Create virtual target', () => {

        const target = new DataPoint({
        	  enabled: true,
        	  loggingProperties: {
        	    tolerance: 0,
        	    discardExtremeValues: false,
        	    discardLowLimit: -1.7976931348623157e+308,
        	    discardHighLimit: 1.7976931348623157e+308,
        	    loggingType: "ON_CHANGE",
        	    intervalLoggingType: "INSTANT",
        	    intervalLoggingPeriod: {
        	      periods: 15,
        	      type: "MINUTES"
        	    },
        	    overrideIntervalLoggingSamples: false,
        	    intervalLoggingSampleWindowSize: 0,
        	    cacheSize: 1
        	  },
        	  textRenderer: {
        	    zeroLabel: "zero",
        	    zeroColour: "blue",
        	    oneLabel: "one",
        	    oneColour: "black",
        	    type: "textRendererBinary"
        	  },
        	  chartRenderer: {
        	    limit: 10,
        	    type: "chartRendererTable"
        	  },
        	  modelType: "DATA_POINT",
        	  validationMessages: [],
        	  deviceName: "metaSetTest-virtual",
        	  rollup: "NONE",
        	  purgeOverride: false,
        	  purgePeriod: {
        	    periods: 1,
        	    type: "YEARS"
        	  },
        	  chartColour: "",
        	  pointLocator: {
        	    offset: 0,
        	    values: [],
        	    min: 0,
        	    period: 0,
        	    max: 0,
        	    attractionPointXid: "DP_c04987be-827b-4e18-91b8-0091998af6fe",
        	    roll: false,
        	    volatility: 0,
        	    maxChange: 0,
        	    change: 0,
        	    amplitude: 0,
        	    startValue: "false",
        	    modelType: "PL.VIRTUAL",
        	    dataType: "BINARY",
        	    settable: true,
        	    changeType: "NO_CHANGE",
        	    relinquishable: false
        	  },
        	  plotType: "STEP",
        	  setPermission: "restricted",
        	  readPermission: "",
        	  useRenderedUnit: false,
        	  useIntegralUnit: false,
        	  dataSourceName: "metaSetTest-virtual",
        	  dataSourceXid: "mst-virtual",
        	  integralUnit: "s",
        	  renderedUnit: "",
        	  unit: "",
        	  pointFolderId: 0,
        	  name: "target",
        	  xid: "mst-target"
        	});

        return target.save().then((savedDp) => {
          assert.equal(savedDp.xid, 'mst-target');
          assert.equal(savedDp.name, 'target');
          assert.equal(savedDp.enabled, true);
          assert.equal(savedDp.pointLocator.startValue, "false");

          assert.isNumber(savedDp.id);
        });
      });

    it('Create meta data source for test', () => {

        const metaDs = new DataSource({
        	  xid: "mst-meta",
        	  name: "metaSetTest-meta",
        	  enabled: true,
        	  modelType: "META",
        	  validationMessages: [],
        	  editPermission: "edit-test",
        	  purgeSettings: {
        	    override: false,
        	    frequency: {
        	      periods: 1,
        	      type: "YEARS"
        	    }
        	  },
        	  alarmLevels: {
        	    SCRIPT_ERROR: "URGENT",
        	    CONTEXT_POINT_DISABLED: "URGENT",
        	    RESULT_TYPE_ERROR: "URGENT"
        	  }
        	});

        return metaDs.save().then((savedDs) => {
          assert.equal(savedDs.xid, 'mst-meta');
          assert.equal(savedDs.name, 'metaSetTest-meta');
          assert.equal(savedDs.enabled, true);

          assert.equal(savedDs.editPermission, "edit-test");
          assert.isNumber(savedDs.id);
        });
      });

    it('Create meta test point', () => {

        const testPoint = new DataPoint({
        	  enabled: true,
        	  loggingProperties: {
        	    tolerance: 0,
        	    discardExtremeValues: false,
        	    discardLowLimit: -1.7976931348623157e+308,
        	    discardHighLimit: 1.7976931348623157e+308,
        	    loggingType: "ON_CHANGE",
        	    intervalLoggingType: "INSTANT",
        	    intervalLoggingPeriod: {
        	      periods: 15,
        	      type: "MINUTES"
        	    },
        	    overrideIntervalLoggingSamples: false,
        	    intervalLoggingSampleWindowSize: 0,
        	    cacheSize: 1
        	  },
        	  textRenderer: {
        	    zeroLabel: "zero",
        	    zeroColour: "blue",
        	    oneLabel: "one",
        	    oneColour: "black",
        	    type: "textRendererBinary"
        	  },
        	  chartRenderer: {
        	    limit: 10,
        	    type: "chartRendererTable"
        	  },
        	  modelType: "DATA_POINT",
        	  validationMessages: [],
        	  deviceName: "metaSetTest-meta",
        	  rollup: "NONE",
        	  purgeOverride: false,
        	  purgePeriod: {
        	    periods: 1,
        	    type: "YEARS"
        	  },
        	  chartColour: "",
        	  pointLocator: {
        	    modelType: "PL.META",
        	    context: [
        	      {
        	        dataPointXid: "mst-target",
        	        variableName: "target",
        	        contextUpdate: false
        	      },
        	      {
        	        dataPointXid: "mst-trigger",
        	        variableName: "trigger",
        	        contextUpdate: true
        	      }
        	    ],
        	    script: "target.set(trigger.value);\nreturn target.value;",
        	    scriptEngine: "JAVASCRIPT",
        	    dataType: "BINARY",
        	    settable: true,
        	    executionDelaySeconds: 0,
        	    updateCronPattern: "",
        	    scriptPermissions: {
        	      dataSourcePermissions: "superadmin",
        	      dataPointSetPermissions: "superadmin",
        	      dataPointReadPermissions: "superadmin",
        	      customPermissions: ""
        	    },
        	    variableName: "my",
        	    updateEvent: "CONTEXT_UPDATE",
        	    relinquishable: false
        	  },
        	  plotType: "STEP",
        	  setPermission: "",
        	  readPermission: "",
        	  useRenderedUnit: false,
        	  useIntegralUnit: false,
        	  dataSourceName: "metaSetTest-meta",
        	  dataSourceXid: "mst-meta",
        	  integralUnit: "s",
        	  renderedUnit: "",
        	  unit: "",
        	  pointFolderId: 0,
        	  name: "test",
        	  xid: "mst-test-point"
        	});

        return testPoint.save().then((savedDp) => {
          assert.equal(savedDp.xid, 'mst-test-point');
          assert.equal(savedDp.name, 'test');
          assert.equal(savedDp.enabled, true);
          assert.equal(savedDp.pointLocator.context.length, 2);

          assert.isNumber(savedDp.id);
        });
      });

    it('Set a value to the trigger point', () => {
    	return client.restRequest({
    		path: '/rest/v1/point-values/mst-trigger',
    		method: 'PUT',
    		data: {
    			annotation:"",
    			value: true,
    			timestamp: 0,
    			dataType: "BINARY"
    		}
    	}).then(response => {
    		assert.equal(response.status, 201);
    		//Test if the target point has been set.
		    return delay(1000).then(() => { client.restRequest({
  		    		path: 'http://localhost:8080/rest/v1/point-values/mst-target/latest?useRendered=false&unitConversion=false&limit=1&useCache=true',
  		    		method: 'GET'
  		    	}).then(response => {
  		    		assert.equal(response.status, 200);
  		    		assert.equal(response.data[0].value, true);

  		    		assert.notEqual(/Meta DPID.*/.exec(response.data[0].annotation), null);
      		});
        });
    	});
    });

//    it('Test if the target point has been set.', () => {
//
//    	return client.restRequest({
//    		path: 'http://localhost:8080/rest/v1/point-values/mst-target/latest?useRendered=false&unitConversion=false&limit=1&useCache=true',
//    		method: 'GET'
//    	}).then(response => {
//    		assert.equal(response.status, 200);
//    		assert.equal(response.data.value, true);
//    		assert.notEqual(/Meta DPID.*/.exec(response.data.annotation), null);
//    	});
//    });


    //Test historical generation for points
    //Tests for websockets
    it('Generate history for multiple points', () => {
      //We generate values in the future because
      // they will get skipped as backdates otherwise
      const startTime = new Date().getTime();
      const endTime = startTime + 30000;

      const dataInterval = 5000;
      const pointValues = [];
      var startValue = true;
      //Create some historical values
      for(var time = startTime; time < endTime; time+=dataInterval){
        pointValues.push({
    			xid: 'mst-trigger',
    			value: startValue,
    			timestamp: time,
    			dataType: "BINARY"
    		});
        startValue = !startValue;
        //console.log(new Date(time).toISOString())
      }
      //console.log(pointValues);
      const isoFrom = new Date(startTime).toISOString();
      const isoTo = new Date(endTime + 1000).toISOString();
      const args = `?from=${isoFrom}&to=${isoTo}`;

      const valuesInsertedDeferred = config.defer();
      const valuesGeneratedDeferred = config.defer();
      var metaTempResourceUrl;

      return Promise.resolve().then(() => {
        return client.restRequest({
            path: '/rest/v1/point-values',
            method: 'PUT',
            data: pointValues
        }).then(response => {
          assert.strictEqual(pointValues.length, response.data.length);
          return valuesInsertedDeferred.resolve();
        }).then(() => config.delay(1000)).then(() => valuesInsertedDeferred.promise).then(() => {
          //Generate the History
          return client.restRequest({
            path: '/rest/v2/meta-utils/generate/mst-test-point' + args,
            method: 'GET'
          }).then(response => {
            metaTempResourceUrl = response.headers.location;
            //console.log(response.headers.location);
          }).then(() => config.delay(1000)).then(()=>{
            return client.restRequest({
              path: metaTempResourceUrl,
              method: 'GET'
            }).then(response => {
              //console.log(response);
              //console.log(response.data.result.updates);
              assert.strictEqual(response.data.result.finished, true);
              assert.strictEqual(response.data.result.from, isoFrom);
              assert.strictEqual(response.data.result.to, isoTo);
              //TODO Check the update count assert.strictEqual(pointValues.length, response.data.result.updates['mst-test-point'])
              //TODO Check the actual values of the mst-test-point?
              return valuesGeneratedDeferred.resolve();
            }).then(() => valuesGeneratedDeferred.promise);
          });
        });
      });
    });

    //TODO Test historical generation for a whole data sourceId

    it('Deletes the new virtual data source and its points', () => {
        return DataSource.delete('mst-virtual');
    });

    it('Deletes the new test data source and its point', () => {
        return DataSource.delete('mst-meta');
    });


    /* Helper Method */
    function delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
});
