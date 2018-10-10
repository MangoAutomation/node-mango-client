/**
 * Copyright 2018 Infinite Automation Systems Inc.
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

describe('Global scripts', function() {
    before('Login', config.login);

    it.only('Validate an invalid global script', () => {
      return client.restRequest({
          path: '/rest/v2/global-scripts/validate-script',
          method: 'POST',
          data: 'return 0;'
      }).then(response => {
        //Script will fail because it returns a value
        console.log(response.data);
        assert.equal(response.data.valid, false);
        assert.equal(response.data.failures, null);
        assert.equal(response.data.scriptErrors.length, 1);
        assert.equal(response.data.scriptActions, null);
        assert.equal(response.data.output, '');
        assert.equal(response.data.result, null);
      });
    });

    it.only('Validate a correct global script', () => {
      return client.restRequest({
          path: '/rest/v2/global-scripts/validate-script',
          method: 'POST',
          data: 'function test(){ return 1;}'
      }).then(response => {
        //Script will fail because it returns a value
        console.log(response.data);
        assert.equal(response.data.valid, true);
        assert.equal(response.data.failures, null);
        assert.equal(response.data.scriptErrors, null);
        assert.equal(response.data.scriptActions, null);
        assert.equal(response.data.output, '');
        assert.equal(response.data.result, 'run completed');
      });
    });

    it('Creates a global script', () => {
      global.globalScriptOne = {
        xid: 'GS_TEST_ONE',
        name: 'Test global script one',
        script: 'function test(){return 1;}'
      };

      return client.restRequest({
          path: '/rest/v2/global-scripts',
          method: 'POST',
          data: global.globalScriptOne
      }).then(response => {
          assert.equal(response.data.xid, global.globalScriptOne.xid);
          assert.equal(response.data.name, global.globalScriptOne.name);
          assert.equal(response.data.script, global.globalScriptOne.script);
          global.globalScriptOne = response.data;
      });
    });

    it('Creates a second global script', () => {
      global.globalScriptTwo = {
        xid: 'GS_TEST_TWO',
        name: 'Test global script two',
        script: 'function test(){return 2;}'
      };

      return client.restRequest({
          path: '/rest/v2/global-scripts',
          method: 'POST',
          data: global.globalScriptTwo
      }).then(response => {
          assert.equal(response.data.xid, global.globalScriptTwo.xid);
          assert.equal(response.data.name, global.globalScriptTwo.name);
          assert.equal(response.data.script, global.globalScriptTwo.script);
          global.globalScriptTwo = response.data;
      });
    });

    it('Update global script one', () => {
        global.globalScriptOne.name = 'updated name';
        return client.restRequest({
            path: `/rest/v2/global-scripts/${global.globalScriptOne.xid}`,
            method: 'PUT',
            data: global.globalScriptOne
        }).then(response => {
            assert.equal(response.data.xid, global.globalScriptOne.xid);
            assert.equal(response.data.name, global.globalScriptOne.name);
            assert.equal(response.data.script, global.globalScriptOne.script);
        });
    });

    it('Get global script one', () => {
        return client.restRequest({
            path: `/rest/v2/global-scripts/${global.globalScriptOne.xid}`,
            method: 'GET'
        }).then(response => {
            assert.equal(response.data.xid, global.globalScriptOne.xid);
            assert.equal(response.data.name, global.globalScriptOne.name);
            assert.equal(response.data.script, global.globalScriptOne.script);
        });
    });

    it('Query by xid', () => {
        return client.restRequest({
            path: `/rest/v2/global-scripts?xid=${global.globalScriptOne.xid}`,
            method: 'GET'
        }).then(response => {
            assert.equal(response.data.total, 1);
            assert.equal(response.data.items[0].xid, global.globalScriptOne.xid);
            assert.equal(response.data.items[0].name, global.globalScriptOne.name);
            assert.equal(response.data.items[0].script, global.globalScriptOne.script);
        });
    });
    //TODO Query by script contents?

    it('Deletes global script one', () => {
      return client.restRequest({
          path: `/rest/v2/global-scripts/${global.globalScriptOne.xid}`,
          method: 'DELETE',
          data: {}
      }).then(response => {
          assert.equal(response.data.id, global.globalScriptOne.id);
      });
    });
    it('Deletes global script two', () => {
        return client.restRequest({
            path: `/rest/v2/global-scripts/${global.globalScriptTwo.xid}`,
            method: 'DELETE',
            data: {}
        }).then(response => {
            assert.equal(response.data.id, global.globalScriptTwo.id);
        });
    });
    //TODO Get them to ensure they are 404
});
