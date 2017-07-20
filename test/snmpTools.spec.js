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

describe.skip('Test SNMP Data Source REST Tools', function() {
    before('Login', config.login);
    this.timeout(5000);
    it('Create SNMP v1 data source', () => {

      const ds = new DataSource({
        xid : "DS_SNMP_TEST_V1",
        name : "SNMP Test",
        enabled : false,
        modelType : "SNMP",
        host : "localhost",
        port : 1600,
        timeout : 1000,
        retries : 0,
        authPassphrase : "",
        authProtocol : "",
        readCommunity : "public",
        writeCommunity: "public",
        contextEngineId : "",
        engineId : "",
        privPassphrase : "",
        privProtocol : "",
        securityName : "",
        snmpVersion : 0,
        trapPort : 162,
        maxRequestVars : 0,
        localAddress : "",
        contextName : "",
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
          POLL_ABORTED : "URGENT",
          PDU_EXCEPTION : "URGENT",
          DATA_SOURCE_EXCEPTION : "URGENT"
        }
      });

      return ds.save().then((savedDs) => {
        assert.equal(savedDs.xid, 'DS_SNMP_TEST_V1');
        assert.equal(savedDs.name, 'SNMP Test');
        assert.equal(savedDs.enabled, false);
        assert.equal(savedDs.host, "localhost");
        assert.equal(savedDs.port, 1600);
        assert.equal(savedDs.timeout, 1000);
        assert.equal(savedDs.retries, 0);
        assert.equal(savedDs.authPassphrase, "");
        assert.equal(savedDs.authProtocol, "");
        assert.equal(savedDs.readCommunity, "public");
        assert.equal(savedDs.writeCommunity, "public");

        assert.equal(savedDs.editPermission, "edit-test");
        assert.isNumber(savedDs.id);
      });
    });

    it('Create SNMP data point', () => {

      const dp = new DataPoint({
            xid : "DP_SNMP_TEST",
            deviceName : "SNMP",
            name : "SNMP Test Point 1",
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
            dataSourceXid : "DS_SNMP_TEST_V1",
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
              oid : "1.1.1.1.1.3",
              setType : "NONE",
              trapOnly : false,
              multiplicand : 1.0,
              augend : 0.0,
              binary0Value : "0",
              modelType : "PL.SNMP",
              dataType : "BINARY",
              settable : false,
              relinquishable : false
            },
          });

      return dp.save().then((savedDp) => {
        assert.equal(savedDp.xid, 'DP_SNMP_TEST');
        assert.equal(savedDp.name, 'SNMP Test Point 1');
        assert.equal(savedDp.enabled, false);

        assert.equal(savedDp.pointLocator.oid, "1.1.1.1.1.3");
        assert.equal(savedDp.pointLocator.setType, "NONE");
        assert.equal(savedDp.pointLocator.trapOnly, false);
        assert.equal(savedDp.pointLocator.multiplicand, 1.0);
        assert.equal(savedDp.pointLocator.augend, 0.0);
        assert.equal(savedDp.pointLocator.binary0Value, "0");
        assert.equal(savedDp.pointLocator.dataType, "BINARY");
        assert.equal(savedDp.pointLocator.settable, false);
        assert.equal(savedDp.pointLocator.relinquishable, false);

        assert.isNumber(savedDp.id);
      });
    });

    it('Sets OID by data source', () =>{
      return client.restRequest({
          path: '/rest/v2/snmp/set-oid/DS_SNMP_TEST_V1',
          method: 'POST',
          data: {
            oid: '1.3.6.1.2.1.2.2.1.4.1',
            dataType: 'INTEGER_32',
            value: 7
          }
      }).then(response => {
        //TODO Test for OK response
      });
    });

    it('Reads OID By Data Source', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid/DS_SNMP_TEST_V1',
          method: 'GET',
          params: {
            oid: '1.3.6.1.2.1.2.2.1.4.1'
          }
      }).then(response => {
        assert.equal(response.data, 7);
      });
    });

    it('Sets OID v1 with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/set-oid',
          method: 'POST',
          data: {
            version: 'v1',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1.4.1',
            dataType: 'INTEGER_32',
            value: 39
          }
      }).then(response => {
        assert.equal(response.status, 200);
      });
    });

    it('Reads OID v1 with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v1',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1.4.1'
          }
      }).then(response => {
        assert.equal(response.data, 39);
      });
    });

    it('Reads Operating System OID v1 with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v1',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.1.1.0'
          }
      }).then(response => {
        //Data will contain SNMP4J-Agent - O.S. info
        assert.isNotNull(response.data);
      });
    });

    it('Read loopback OID v1 with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v1',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1.2.2',
          }
      }).then(response => {
        assert.equal(response.data, 'loopback');
      });
    });

    it('Read loopback OID v2c with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v2c',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1.2.2'
          }
      }).then(response => {
        assert.equal(response.data, 'loopback');
      });
    });

    it.skip('Read loopback OID v3 with settings', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v3',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            oid: '1.3.6.1.2.1.2.2.1.1.2',
            securityName: '',
            authProtocol: '',
            authPassphrase: '',
            privProtocol: '',
            privPassphrase: '',
            engineId: 'MangoTestAgent',
            contextEngineId: '',
            contextName: ''
          }
      }).then(response => {
        assert.equal(response.data, 'loopback');
      });
    });

    it('Fails to read OID on unreachable device', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/get-oid',
          method: 'POST',
          data: {
            version: 'v1',
            host: '192.168.199.199',
            port: 1,
            retries: 0,
            timeout: 100,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1.2.2'
          }
      }).then(response => {
        throw new Error('Returned success response');
      }, error => {
        console.log(error);
        assert.strictEqual(error.response.statusCode, 500);
      });
    });

    it('MIB walk from OID v1', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/walk',
          method: 'POST',
          data: {
            version: 'v1',
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 100000,
            readCommunity: 'public',
            oid: '1.3.6.1.2.1.2.2.1', //DemoTable '1.3.6.1.4.1.4976.10.1.1.20.1.2.1' //Test Table: '1.3.6.1.2.1.2.2.1'
          }
      }).then(response => {
        return delay(1000).then(() => {
          return client.restRequest({
            path: response.headers.location,
            method: 'GET'
          }).then(response => {
            for(var i=0; i<response.data.results.length; i++)
              console.log(response.data.results[i]);
            //TODO Validate the results
            assert.equal(response.data.results[0].oid, '1.3.6.1.2.1.2.2.1.1.1');
            assert.equal(response.data.finished, true);
            assert.equal(response.data.results.length, 16);  //We don't walk the indexes

          });
        });
      });
    });

    it('MIB walk from OID with file', () => {
      var files = [];
      files.push(path.join(__dirname, '../test-resources/AGENTPP-GLOBAL-REG.txt'));
      files.push(path.join(__dirname, '../test-resources/SNMP4J-AGENT-REG.txt'));
      files.push(path.join(__dirname, '../test-resources/SNMP4J-CONFIG-MIB.txt'));
      files.push(path.join(__dirname, '../test-resources/SNMP4J-LOG-MIB.txt'));
      files.push(path.join(__dirname, '../test-resources/SNMP4J-DEMO-MIB.txt'));

      return client.restRequest({
          path: '/rest/v2/snmp/mib-walk/DS_SNMP_TEST_V1',
          method: 'POST',
          params: {
            rootOID: '1.3.6.1.4.1.4976.10.1.1.20.1.2.1'
          },
          uploadFiles: files
      }).then(response => {
          console.log('Resource: ' + response.headers.location);
          return delay(1000).then(() => {
            return client.restRequest({
              path: response.headers.location,
              method: 'GET'
            }).then(response => {
              assert.equal(response.data.finished, true);
              assert.equal(response.data.results[0].oid, '1.3.6.1.4.1.4976.10.1.1.20.1.2.1.3.1');
              for(var i=0; i<response.data.results.length; i++)
                console.log(response.data.results[i]);


              assert.equal(response.data.results.length, 6);
            });
          });
      });
    });

    it('Deletes the new snmp data source and its point', () => {
        return DataSource.delete('DS_SNMP_TEST_V1');
    });


    /** Tests for V3 NOT WORKING YET, missing Context Engine ID from test agent... **/
    it.skip('MIB walk from OID v3', () => {
      return client.restRequest({
          path: '/rest/v2/snmp/walk-v3',
          method: 'POST',
          data: {
            host: 'localhost',
            port: 1600,
            retries: 1,
            timeout: 1000,
            readCommunity: 'public',
            oid: '1.3.6.1.4.1.4976.10.1.1.20.1.2.1',
            securityName: '',
            authProtocol: '',
            authPassphrase: '',
            privProtocol: '',
            privPassphrase: '',
            engineId: 'MangoTestAgent',
            contextEngineId: '',
            contextName: ''
          }
      }).then(response => {
        return delay(3000).then(() => {
          return client.restRequest({
            path: response.headers.location,
            method: 'GET'
          }).then(response => {
            for(var i=0; i<response.data.walkResults.length; i++)
              console.log(response.data.walkResults[i]);
            assert.equal(response.data.finished, true);
            assert.equal(response.data.walkResults.length, 6);  //We don't walk the indexes

          });
        });
      });
    });


    it.skip('Deletes the new snmp v3 data source and its point', () => {
        return DataSource.delete('DS_SNMP_TEST_V3');
    });

    /* Helper Method */
    function delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

});
