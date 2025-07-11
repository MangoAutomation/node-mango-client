/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const { v4: uuid } = require('uuid');

function roleFactory(client) {
    const MangoObject = client.MangoObject;

    return class Role extends MangoObject {
        
        static get defaultProperties() {
            const xid = uuid();
            return {
                xid: xid,
                name: xid + ' Name'
            };
        }
        
        static get baseUrl() {
            return '/rest/v3/roles';
        }
    };
}

module.exports = roleFactory;
