/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function publisherFactory(client) {
    const MangoObject = client.MangoObject;

    return class Publisher extends MangoObject {
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid: xid,
                name: xid + ' Name',
                enabled: false,
                publishType: 'ALL',
                cacheWarningSize: 100,
                cacheDiscardSize: 1000,
                sendSnapshot: false,
                snapshotSendPeriod: { periods: 5, type: 'SECONDS' },
                publishAttributeChanges: false,
                alarmLevels: { POLL_ABORTED: 'URGENT' },
            };
        }

        static get baseUrl() {
            return '/rest/v3/publishers';
        }
    };
}

module.exports = publisherFactory;
