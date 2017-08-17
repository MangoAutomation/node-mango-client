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

describe('Log file query tests', function(){
    before('Login', config.login);
    this.timeout(20000);

    it('Simple limit query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?limit(1)',
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, 1);
      });
    });

    it('Simple level query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?level=INFO&limit(1)',
          method: 'GET'
      }).then(response => {
        //Looking for the Starting Mango Message
        assert.equal(response.data.length, 1);
        assert.equal(response.data[0].method, 'main');
        assert.equal(response.data[0].classname, 'com.serotonin.m2m2.Main');
        assert.match(response.data[0].message, /Starting Mango.*/);
      });
    });

    it('Simple time query', () => {
      global.fiveMinAgo = new Date(new Date().getTime() - 300000);
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?time=gt=' + global.fiveMinAgo.toISOString(),
          method: 'GET'
      }).then(response => {
        //Test that all timestamps are > five min ago
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.isAbove(response.data[i].time, global.fiveMinAgo.getTime());
        }

      });
    });

    it('Simple classname eq query', () => {
      global.classname = 'com.serotonin.m2m2.Main';
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?classname=eq=' + global.classname,
          method: 'GET'
      }).then(response => {
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.equal(response.data[i].classname, global.classname);
        }
      });
    });

    it('Simple classname like query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?like(classname,.*m2m2.*)',
          method: 'GET'
      }).then(response => {
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.match(response.data[i].classname, /.*m2m2.*/);
        }
      });
    });

    it('Simple method eq query', () => {
      global.method = 'loadModules';
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?method=eq=' + global.method,
          method: 'GET'
      }).then(response => {
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.equal(response.data[i].method, global.method);
        }
      });
    });

    it('Simple method like query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?like(method,.*load.*)',
          method: 'GET'
      }).then(response => {
        //Should all match loadModules method
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.match(response.data[i].method, /.*load.*/);
        }
      });
    });

    it('Simple message eq query', () => {
      global.message = 'Mapped URL path [/users.shtm] onto handler of type [class com.serotonin.m2m2.web.mvc.controller.UsersController] ';
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?message=eq=' + encodeURIComponent(global.message),
          method: 'GET'
      }).then(response => {
        assert.equal(response.data.length, 1);
        assert.equal(response.data[0].message, global.message);
      });
    });

    it('Simple message like query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?like(message,' + encodeURIComponent('Starting Mango.*)'),
          method: 'GET'
      }).then(response => {
        //Should all match loadModules method
        assert.isAbove(response.data.length, 1);
        for(var i=0; i<response.data.length; i++){
          assert.match(response.data[i].message, /Starting Mango.*/);
        }
      });
    });

    it('Expect 403 when trying to query an existing logfile that is not log4J ', function() {
        return client.restRequest({
            path: '/rest/v1/logging/by-filename/createTables.log',
            method: 'GET'
        }).then(response => {
            throw new Error('Returned successful response', response.status);
        }, error => {
            assert.strictEqual(error.response.statusCode, 403);
        });
    });
});
