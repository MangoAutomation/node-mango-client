/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function dataSourceFactory(client) {
    const MangoObject = client.MangoObject;

    return class DataSource extends MangoObject {
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid: xid,
                name: xid + ' Name',
                enabled: false,
                quantize: true,
                useCron: false,
                cronPattern: '',
                pollPeriod: { periods: 5, type: 'SECONDS' },
                purgeSettings: { override: false, frequency: { periods: 1, type: 'YEARS' } },
                eventAlarmLevels: [],
                editPermission: null,
            };
        }

        static get baseUrl() {
            return '/rest/v3/data-sources';
        }
    };
}

module.exports = dataSourceFactory;
