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

describe.only('Advanced schedules service', () => {
    before('Login', config.login);

    it('Creates a date calendar rule set', () => {

      global.crsWilcardDate = {
        xid: 'CRS_TEST_WILDCARD_DATE',
        name: 'Test rule set',
        userId: 1,
        rules: [
          {
            year: null,
            month: null,
            day: null,
            dayOfWeek: 1,
            type: 'WildcardDateRule1'
          }
        ],
        editPermission: 'admin',
        modelType: 'ADVANCED_SCHEDULE_RULESET'
      };

      return client.restRequest({
          path: '/rest/v2/schedule-rule-sets',
          method: 'POST',
          data: global.crsWilcardDate
      }).then(response => {
        global.crsWilcardDate = response.data;
        //console.log(response.data);
      });
    });

    it('Creates a date range calendar rule set', () => {

      global.crsWilcardDateRange = {
        xid: 'CRS_TEST_WILDCARD_DATERANGE',
        name: 'Test rule set',
        userId: 1,
        rules: [
          {
            startDate: {
              year: 2010,
              month: 1,
              day: null,
              dayOfWeek: null,
              type: 'WildcardDateRule1'
            },
            endDate: {
              year: 2018,
              month: 12,
              day: null,
              dayOfWeek: null,
              type: 'WildcardDateRule1'
            },
            type: 'WildcardDateRangeRule1'
          }
        ],
        editPermission: 'admin',
        modelType: 'ADVANCED_SCHEDULE_RULESET'
      };

      return client.restRequest({
          path: '/rest/v2/schedule-rule-sets',
          method: 'POST',
          data: global.crsWilcardDateRange
      }).then(response => {
        global.crsWilcardDateRange = response.data;
        //console.log(response.data);
      });
    });

    it('Updates a calendar rule set', () => {
      global.crsWilcardDate.editPermission = 'admin,user';
      return client.restRequest({
          path: `/rest/v2/schedule-rule-sets/${global.crsWilcardDate.xid}`,
          method: 'PUT',
          data: global.crsWilcardDate
      }).then(response => {
        //console.log(response.data);
      });
    });

    it('Query calendar rule sets', () => {
      return client.restRequest({
          path: '/rest/v2/schedule-rule-sets',
          method: 'GET'
      }).then(response => {
        assert.isAtLeast(response.data.items.length, 2);
      });
    });

    it('Get calendar rule set by xid', () => {
      return client.restRequest({
          path: `/rest/v2/schedule-rule-sets/${global.crsWilcardDate.xid}`,
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.editPermission, global.crsWilcardDate.editPermission);
      });
    });

    //
    //  Schedule Tests
    //
    it('Creates a schedule', () => {

      global.schedule = {
        xid: 'ADVSCH_TEST',
        name: 'Test schedule',
        userId: 1,
        active: false,
        readPermission: null,
        editPermission: 'admin',
        alarmLevel: 'URGENT',
        defaultSchedule:
            [
              ["10:00", "16:00"], //Sunday
              ["08:00", "18:00"], //Monday
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["10:00", "16:00"]  //Saturday
            ],
        exceptions: [],
        modelType: 'ADVANCED_SCHEDULE'
      };

      return client.restRequest({
          path: '/rest/v2/schedules',
          method: 'POST',
          data: global.schedule
      }).then(response => {
        assert.equal(response.data.xid, global.schedule.xid);
        assert.equal(response.data.defaultSchedule[0][0], "10:00");

        global.schedule = response.data;
      });
    });

    it('Creates a schedule with exception', () => {

      global.exceptionSchedule = {
        xid: 'ADVSCH_EXCTEST',
        name: 'Test exception schedule',
        userId: 1,
        active: false,
        readPermission: null,
        editPermission: 'admin',
        alarmLevel: 'URGENT',
        defaultSchedule:
            [
              ["10:00", "16:00"], //Sunday
              ["08:00", "18:00"], //Monday
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["10:00", "16:00"]  //Saturday
            ],
        exceptions: [
          {
            userId: 1,
            editPermission: '',
            schedule: ["08:00", "14:00"],
            ruleSet: {xid: 'CRS_TEST_WILDCARD_DATERANGE'}
          }
        ],
        modelType: 'ADVANCED_SCHEDULE'
      };

      return client.restRequest({
          path: '/rest/v2/schedules',
          method: 'POST',
          data: global.exceptionSchedule
      }).then(response => {
        assert.equal(response.data.xid, global.exceptionSchedule.xid);
        assert.equal(response.data.defaultSchedule[0][0], "10:00");
        global.exceptionSchedule = response.data;
      });
    });

    it('Fails to create a schedule with exception that as a ruleset that DNE', () => {

      global.invalidSchedule = {
        xid: 'ADVSCH_BAD',
        name: 'Test bad exception schedule',
        userId: 1,
        active: false,
        readPermission: null,
        editPermission: 'admin',
        alarmLevel: 'URGENT',
        defaultSchedule:
            [
              ["10:00", "16:00"], //Sunday
              ["08:00", "18:00"], //Monday
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["08:00", "18:00"],
              ["10:00", "16:00"]  //Saturday
            ],
        exceptions: [
          {
            userId: 1,
            editPermission: '',
            schedule: ["08:00", "14:00"],
            ruleSet: {xid: 'CRS_DNE'}
          }
        ],
        modelType: 'ADVANCED_SCHEDULE'
      };

      return client.restRequest({
          path: '/rest/v2/schedules',
          method: 'POST',
          data: global.invalidSchedule
      }).then(response => {
          throw new Error('Returned successful response', response.status);
      }, error => {
          assert.strictEqual(error.response.statusCode, 422);
      });
    });

    it('Query schedules', () => {
      return client.restRequest({
          path: '/rest/v2/schedules',
          method: 'GET'
      }).then(response => {
        assert.isAtLeast(response.data.items.length, 1);
      });
    });

    it('Get schedule by xid', () => {
      return client.restRequest({
          path: `/rest/v2/schedules/${global.schedule.xid}`,
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.editPermission, global.schedule.editPermission);
      });
    });

    it('Deletes a schedule', () => {
      return client.restRequest({
          path: `/rest/v2/schedules/${global.schedule.xid}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
        global.schedule = response.data;
        //console.log(response.data);
      });
    });

    it('Deletes a schedule with exception', () => {
      return client.restRequest({
          path: `/rest/v2/schedules/${global.exceptionSchedule.xid}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
        //console.log(response.data);
      });
    });

    it('Deletes a date calendar rule set', () => {
      return client.restRequest({
          path: `/rest/v2/schedule-rule-sets/${global.crsWilcardDate.xid}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.id, global.crsWilcardDate.id);
      });
    });

    it('Deletes a date range calendar rule set', () => {
      return client.restRequest({
          path: `/rest/v2/schedule-rule-sets/${global.crsWilcardDateRange.xid}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.id, global.crsWilcardDateRange.id);
      });
    });
});
