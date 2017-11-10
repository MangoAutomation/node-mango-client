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

describe('User Event query tests', function(){
    before('Login', config.login);

    it('Describe event query', () => {
      return client.restRequest({
          path: '/rest/v2/user-events/explain-query',
          method: 'GET'
      }).then(response => {
        //Looking for the Starting Mango Message
        console.log(response.data);

      });
    });


    it('Simple event query', () => {
      return client.restRequest({
          path: '/rest/v2/user-events?limit(1)',
          method: 'GET'
      }).then(response => {
        assert.isAbove(response.data.total, 0);
        assert.equal(response.data.items.length, 1);
      });
    });
});