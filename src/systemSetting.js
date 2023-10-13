/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

function systemSettingFactory(client) {
    const baseUrl = '/rest/v3/system-settings';
    
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
