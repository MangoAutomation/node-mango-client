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

function systemSettingFactory(client) {
    const baseUrl = '/rest/v1/system-settings';
    
    return class SystemSetting {
        static getValue(id, type) {
            return (new this({id, type})).getValue();
        }

        static setValue(id, value, type) {
            const options = {id, type};
            return (new this({id, type})).setValue(value);
        }
        
        constructor(options) {
            Object.assign(this, options);
        }

        getValue() {
            const path = `${baseUrl}/${encodeURIComponent(this.id)}`;
            const params = {};
            if (this.type) params.type = this.type;
            return client.restRequest({
                method: 'GET',
                path,
                params
            }).then(response => {
                return (this.value = response.data);
            });
        }

        setValue(value) {
            const path = `${baseUrl}/${encodeURIComponent(this.id)}`;
            const params = {};
            if (this.type) params.type = this.type;
            return client.restRequest({
                method: 'PUT',
                path,
                params,
                data: value
            }).then(response => {
                return (this.value = value);
            });
        }
    };
}

module.exports = systemSettingFactory;