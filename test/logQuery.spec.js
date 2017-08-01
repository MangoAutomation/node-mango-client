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
    it.skip('Broken query', () => {
      return client.restRequest({
          path: '/rest/v1/logging/by-filename/ma.log?level=WARN&limit(20)',
          method: 'GET'
      }).then(response => {
          console.log(response);
      });
    });

    //TODO Timestamp query
    //TODO classname query
    //TODO method query
    //TODO message query

});
