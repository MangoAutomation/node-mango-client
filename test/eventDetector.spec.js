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

describe.only('Event detector service', () => {
    before('Login', config.login);

    //TODO First Create a known data source and some data points
    //TODO Create Event Detector for known point ID
    //TODO Get that detector
    //TODO Get the detectors for that point
    //TODO Get the detectors for the data source
    //TODO Update the detector
    //TODO Delete the detector

    it('Query event detectors', () => {
      return client.restRequest({
          path: '/rest/v2/event-detectors',
          method: 'GET'
      }).then(response => {
        for(var i=0; i<response.data.items.length; i++)
          console.log(response.data.items[i]);
      });
    });

    //Clean up when done
    it('Deletes the new virtual data source and its points to clean up', () => {
        return DataSource.delete('mango_client_test');
    });
});
