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

/*

*/

const config = require('./setup');

describe.only('Test MQTT Data Source REST', function() {
    before('Login', config.login);

    it('Create MQTT data source', () => {

      const ds = new DataSource({
		      xid: "DS_mqtt-test",
		      name: "MQTT Client Test",
    		  enabled: false,
    		  modelType: "MqttClient",
    		  keepAliveInterval: 60,
    		  connectionTimeout: 30,
    		  topicFilters: "#",
    		  userName: "userName",
    		  clientId: "Mango Automation MQTT Client 1497542808167",
    		  cleanSession: true,
    		  x509CaCrt: "TEEST",
    		  autoReconnect: false,
    		  qosType: "EXACTLY_ONCE",
    		  userPassword: "password",
    		  brokerUri: "tcp://localhost:1883",
    		  editPermission: "edit-test",
    		  alarmLevels: {
    			DATA_SOURCE_EXCEPTION_EVENT: "URGENT",
    			MQTT_CONNECTION_FAILURE_EVENT: "URGENT",
    			MQTT_PUBLISH_FAILURE_EVENT: "URGENT",
    			POINT_READ_EXCEPTION_EVENT: "URGENT",
    			MQTT_UNKNOWN_TOPIC: "URGENT",
    			POINT_WRITE_EXCEPTION_EVENT: "URGENT"
		  },
		  purgeSettings: {
			     override: false,
			     frequency: {
			          periods: 1,
			          type: "YEARS"
			     }
		  }
		});

    return ds.save().then((savedDs) => {
        assert.equal(savedDs.xid, 'DS_mqtt-test');
        assert.equal(savedDs.name, 'MQTT Client Test');
        assert.equal(savedDs.enabled, false);
        assert.equal(savedDs.brokerUri, "tcp://localhost:1883");
        assert.equal(savedDs.autoReconnect, false);
        assert.equal(savedDs.topicFilters, "#");
        assert.equal(savedDs.keepAliveInterval, 60);
        assert.equal(savedDs.connectionTimeout, 30);
        assert.equal(savedDs.clientId, "Mango Automation MQTT Client 1497542808167");
        assert.equal(savedDs.userName, "userName");
		    assert.equal(savedDs.cleanSession, true);
		    assert.equal(savedDs.x509CaCrt, "TEEST");
		    assert.equal(savedDs.qosType, "EXACTLY_ONCE");

        assert.equal(savedDs.editPermission, "edit-test");
        assert.isNumber(savedDs.id);
      });
    });

	it('Create MQTT data point', () => {

      const dp = new DataPoint({
		  enabled: false,
		  templateXid: "Numeric_Default",
		  loggingProperties: {
			tolerance: 0,
			discardExtremeValues: false,
			discardLowLimit: -1.7976931348623157e+308,
			discardHighLimit: 1.7976931348623157e+308,
			loggingType: "INTERVAL",
			intervalLoggingType: "AVERAGE",
			intervalLoggingPeriod: {
			  periods: 1,
			  type: "MINUTES"
			},
			overrideIntervalLoggingSamples: false,
			intervalLoggingSampleWindowSize: 0,
			cacheSize: 1
		  },
		  textRenderer: {
			useUnitAsSuffix: true,
			unit: "",
			renderedUnit: "",
			format: "0.00",
			suffix: "",
			type: "textRendererAnalog"
		  },
		  chartRenderer: {
			timePeriod: {
			  periods: 1,
			  type: "DAYS"
			},
			type: "chartRendererImage"
		  },
		  modelType: "DATA_POINT",
		  validationMessages: [],
		  id: 193,
		  useRenderedUnit: false,
		  useIntegralUnit: false,
		  dataSourceId: 257,
		  deviceName: "MQTT Client TEST",
		  rollup: "NONE",
		  readPermission: "",
		  purgePeriod: {
			periods: 1,
			type: "YEARS"
		  },
		  plotType: "SPLINE",
		  purgeOverride: false,
		  pointLocator: {
			dataType: "NUMERIC",
			subscribeJsonTimestampPath: null,
			subscribeJsonTimestampPattern: null,
			publishJsonValueName: null,
			subscribeJsonValuePath: null,
			subscribeTopicType: "PLAIN",
			subscribeTopic: "test",
			publishTopicType: "PLAIN",
			publishJsonTimestampZone: null,
			publishJsonTimestampName: null,
			publishJsonTimestampPattern: null,
			publishTopic: "test",
			modelType: "PL.MQTT-Client",
			relinquishable: false,
			settable: true
		  },
		  setPermission: "",
		  chartColour: "",
		  dataSourceXid: "DS_mqtt-test",
		  unit: "",
		  renderedUnit: "",
		  pointFolderId: 0,
		  integralUnit: "s",
		  dataSourceName: "MQTT Client Test",
		  name: "MQTT test point",
		  xid: "DP_MQTT_TEST"
		});

      return dp.save().then((savedDp) => {
        assert.equal(savedDp.xid, 'DP_MQTT_TEST');
        assert.equal(savedDp.name, 'MQTT test point');
        assert.equal(savedDp.enabled, false);
		assert.equal(savedDp.deviceName, "MQTT Client TEST");

		assert.equal(savedDp.pointLocator.dataType, "NUMERIC");
        assert.equal(savedDp.pointLocator.subscribeJsonTimestampPath, null);
        assert.equal(savedDp.pointLocator.subscribeJsonTimestampPattern, null);
        assert.equal(savedDp.pointLocator.publishJsonValueName, null);
        assert.equal(savedDp.pointLocator.subscribeJsonValuePath, null);
        assert.equal(savedDp.pointLocator.subscribeTopicType, "PLAIN");
        assert.equal(savedDp.pointLocator.subscribeTopic, "test");
        assert.equal(savedDp.pointLocator.publishTopicType, "PLAIN");
        assert.equal(savedDp.pointLocator.publishJsonTimestampZone, null);
		assert.equal(savedDp.pointLocator.publishJsonTimestampName, null);
		assert.equal(savedDp.pointLocator.publishJsonTimestampPattern, null);
		assert.equal(savedDp.pointLocator.publishTopic, "test");
		assert.equal(savedDp.pointLocator.relinquishable, false);
		assert.equal(savedDp.pointLocator.settable, true);

        assert.isNumber(savedDp.id);
      });
    });


    it('Copy MQTT data source', () => {
      return client.restRequest({
          path: '/rest/v1/data-sources/copy/DS_mqtt-test?copyXid=DS_mqtt-test_COPY&copyName=MQTT_TEST_COPY_NAME',
          method: 'PUT'
      }).then(response => {
        assert.equal(response.data.xid, 'DS_mqtt-test_COPY');
        assert.equal(response.data.name, 'MQTT_TEST_COPY_NAME');
        assert.isNumber(response.data.id);
      });
    });

    it('Deletes the copy mqtt data source and its point', () => {
        return DataSource.delete('DS_mqtt-test_COPY');
    });

    it('Deletes the new mqtt data source and its point', () => {
        return DataSource.delete('DS_mqtt-test');
    });
});
