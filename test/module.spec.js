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

describe('Modules Endpoints', function() {
    before('Login', config.login);
    this.timeout(20000);

	it('Gets the Core module information', () => {
		return client.restRequest({
			path: '/rest/v1/modules/core',
			method: 'GET'
		}).then(response => {
			var responseFields = [
				  'name',
				  'version',
          'normalVersion',
				  'buildNumber',
				  'licenseType',
				  'description',
				  'longDescription',
				  'vendor',
				  'vendorUrl',
				  'dependencies',
				  'releaseNotes',
				  'markedForDeletion',
				  'versionState',
				  'unloaded'];

			for(var key in response.data) {
				//console.log("Read Core key: " + key);
				expect(responseFields).to.contain(key);
			}
		});
	});

	//One would expect the upgrade lists to be empty for a nightly core,
	// but there is no reason to make this method so fragile as that.
	it('Gets the possible upgrades', () => {
		return client.restRequest({
			path: '/rest/v1/modules/upgrades-available',
			method: 'GET'
		}).then(response => {
			var responseFields = ['upgrades', 'newInstalls'];

			for(var k = 0; k < responseFields.length; k+=1) {
				assert.isOk(responseFields[k] in response.data);
			}
		});
	});

  it('Performs upgrade and gets status', () => {
		return client.restRequest({
			path: '/rest/v1/modules/upgrade?backup=false&restart=false',
			method: 'POST',
      data: {
        upgrades: [{name: 'mangoApi', version: 3.1}],
        newInstalls: [{name: 'virtualDS', version: 3.1}]
      }
		}).then(response => {
      return client.restRequest({
        path: '/rest/v1/modules/upgrade-status',
        method: 'GET'
      });
		});
	});

  //TODO Skip this test until we put a demo user in the store
  it.skip('Downloads license file', () => {
		return client.restRequest({
			path: '/rest/v1/modules/download-license',
			method: 'PUT',
      data: {
        username: 'testStoreUser@infiniteautomation.com',
        password: 'testStoreUserPassword'
      }
		}).then(response => {
      return client.restRequest({
        path: '/rest/v1/modules/upgrade-status',
        method: 'GET'
      });
		});
	});
});
