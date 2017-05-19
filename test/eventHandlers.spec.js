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

describe('Test Event Handlers Endpoints', function() {
    before('Login', config.login);

    var dataPointId;

    //TODO Create a binary data point for the set point event handler
    it.skip('Create set point event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers',
          method: 'POST',
          data: {
              xid : "EVTH_SET_POINT_TEST",
              name : null,
              alias : "Testing setpoint",
              disabled : false,
              targetPointId : 75,
              activePointId : -1,
              inactivePointId : -1,
              activeAction : "STATIC_VALUE",
              inactiveAction : "STATIC_VALUE",
              activeValueToSet : "false",
              inactiveValueToSet : "true",
              eventType : {
                refId1 : 0,
                duplicateHandling : "ALLOW",
                typeName : "SYSTEM",
                systemEventType : "SYSTEM_STARTUP",
                rateLimited : false
              },

              handlerType : "SET_POINT"
            }
      }).then(response => {
        assert.equal(response.data.xid, 'EVTH_SET_POINT_TEST');
        assert.equal(response.data.alias, 'Testing setpoint');
        assert.equal(response.data.targetPointId, 75);
        assert.equal(response.data.activePointId, -1);
        assert.equal(response.data.inactivePointId, -1);
        assert.equal(response.data.activeAction, "STATIC_VALUE");
        assert.equal(response.data.inactiveAction, "STATIC_VALUE");
        assert.equal(response.data.activeValueToSet, "false");
        assert.equal(response.data.inactiveValueToSet, "true");
        assert.isNumber(response.data.id);
      });
    });


    //TODO Un-comment when we have a data point service that
    // creates a data point for this handler
    it.skip('Delete set point event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers/EVTH_SET_POINT_TEST',
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.xid, 'EVTH_SET_POINT_TEST');
          assert.equal(response.data.alias, 'Testing setpoint');
          assert.isNumber(response.data.id);
      });
    });


    it('Create email event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers',
          method: 'POST',
          data: {
              xid : "EVTH_EMAIL_TEST",
              name : null,
              alias : "Testing email",
              disabled : false,
              activeRecipients: [ {
                username : "admin",
                type : "USER"
              } ],
              escalationDelay : 5,
              escalationDelayType : "MINUTES",
              escalationRecipients : [ ],
              sendEscalation : false,
              sendInactive : false,
              inactiveOverride : false,
              inactiveRecipients : [ ],
              includeSystemInfo : true,
              includePointValueCount : 10,
              includeLogfile : true,
              customTemplate : "",
              eventType : {
                refId1 : 0,
                duplicateHandling : "ALLOW",
                typeName : "SYSTEM",
                systemEventType : "SYSTEM_STARTUP",
                rateLimited : false
              },
              handlerType : "EMAIL"
            }
      }).then(response => {
        assert.equal(response.data.xid, 'EVTH_EMAIL_TEST');
        assert.equal(response.data.alias, 'Testing email');
        assert.equal(response.data.activeRecipients[0].username, "admin");
        assert.equal(response.data.escalationDelay, 5);
        assert.equal(response.data.escalationDelayType, "MINUTES");
        assert.equal(response.data.includePointValueCount, 10);
        assert.equal(response.data.includeSystemInfo, true);
        assert.equal(response.data.includeLogfile, true);

        assert.isNumber(response.data.id);
      });
    });

    it('Delete email event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers/EVTH_EMAIL_TEST',
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.xid, 'EVTH_EMAIL_TEST');
          assert.equal(response.data.alias, 'Testing email');
          assert.isNumber(response.data.id);
      });
    });

    it('Create process event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers',
          method: 'POST',
          data: {
              xid : "EVTH_PROCESS_TEST",
              name : null,
              alias : "Testing process",
              disabled : false,
              activeProcessCommand : "ls",
              activeProcessTimeout : 19,
              inactiveProcessCommand : "ls -la",
              inactiveProcessTimeout : 7,
              eventType : {
                refId1 : 0,
                duplicateHandling : "ALLOW",
                typeName : "SYSTEM",
                systemEventType : "SYSTEM_STARTUP",
                rateLimited : false
              },
              handlerType : "PROCESS"
            }
      }).then(response => {
        assert.equal(response.data.xid, 'EVTH_PROCESS_TEST');
        assert.equal(response.data.alias, 'Testing process');
        assert.equal(response.data.activeProcessCommand, "ls");
        assert.equal(response.data.activeProcessTimeout, 19);
        assert.equal(response.data.inactiveProcessCommand, "ls -la");
        assert.equal(response.data.inactiveProcessTimeout, 7);
        assert.isNumber(response.data.id);
      });
    });

    it('Update process event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers/EVTH_PROCESS_TEST',
          method: 'PUT',
          data: {
              xid : "EVTH_PROCESS_TEST",
              name : null,
              alias : "Testing process edit",
              disabled : false,
              activeProcessCommand : "ls",
              activeProcessTimeout : 19,
              inactiveProcessCommand : "ls -la",
              inactiveProcessTimeout : 7,
              eventType : {
                refId1 : 0,
                duplicateHandling : "ALLOW",
                typeName : "SYSTEM",
                systemEventType : "SYSTEM_STARTUP",
                rateLimited : false
              },
              handlerType : "PROCESS"
            }
      }).then(response => {
        assert.equal(response.data.xid, 'EVTH_PROCESS_TEST');
        assert.equal(response.data.alias, 'Testing process edit');
        assert.equal(response.data.activeProcessCommand, "ls");
        assert.equal(response.data.activeProcessTimeout, 19);
        assert.equal(response.data.inactiveProcessCommand, "ls -la");
        assert.equal(response.data.inactiveProcessTimeout, 7);
        assert.isNumber(response.data.id);
      });
    });

    it('Get process event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers/EVTH_PROCESS_TEST',
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.xid, 'EVTH_PROCESS_TEST');
        assert.equal(response.data.alias, 'Testing process edit');
        assert.equal(response.data.activeProcessCommand, "ls");
        assert.equal(response.data.activeProcessTimeout, 19);
        assert.equal(response.data.inactiveProcessCommand, "ls -la");
        assert.equal(response.data.inactiveProcessTimeout, 7);
        assert.isNumber(response.data.id);
      });
    });

    it('Query process event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers?xid=EVTH_PROCESS_TEST',
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.items.length, 1);
        assert.equal(response.data.total, 1);
        assert.equal(response.data.items[0].xid, 'EVTH_PROCESS_TEST');
        assert.equal(response.data.items[0].alias, 'Testing process edit');
        assert.equal(response.data.items[0].activeProcessCommand, "ls");
        assert.equal(response.data.items[0].activeProcessTimeout, 19);
        assert.equal(response.data.items[0].inactiveProcessCommand, "ls -la");
        assert.equal(response.data.items[0].inactiveProcessTimeout, 7);
        assert.isNumber(response.data.items[0].id);
      });
    });

    it('Delete process event handler', () => {
      return client.restRequest({
          path: '/rest/v1/event-handlers/EVTH_PROCESS_TEST',
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.xid, 'EVTH_PROCESS_TEST');
          assert.equal(response.data.alias, 'Testing process edit');
          assert.isNumber(response.data.id);
      });
    });
});
