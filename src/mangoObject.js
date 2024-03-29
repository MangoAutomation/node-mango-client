/*
 * Copyright (C) 2023 Radix IoT LLC. All rights reserved.
 */

const {merge} = require('./util');

function MangoObjectFactory(client) {
    return class MangoObject {
        constructor(options) {
            merge(this, this.constructor.defaultProperties, options);
        }

        static get idProperty() {
            return 'xid';
        }

        static get(id) {
            var options = {};
            options[this.idProperty] = id;
            return (new this(options)).get();
        }

        static delete(id) {
            var options = {};
            options[this.idProperty] = id;
            return (new this(options)).delete();
        }

        static copy(existingXid, newXid, newName) {
            var options = {};
            options[this.idProperty] = existingXid;
            return (new this(options)).copy(newXid, newName);
        }
        
        static patch(id, values) {
            var options = {};
            options[this.idProperty] = id;
            return (new this(options).patch(values));
        }

        static list() {
            return this.query();
        }

        static query(queryString) {
            let path = this.baseUrl;
            if (queryString) path += '?' + queryString;

            return client.restRequest({
                path: path
            }).then((response) => {
                if (response.data.length != null) {
                    return response;
                }
                response.data.items.total = response.data.total;
                return response.data.items;
            });
        }

        get() {
            const id = this.originalId || this[this.constructor.idProperty];
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(id)
            }).then(response => {
                return this.updateSelf(response);
            });
        }

        save() {
            let method  = 'POST';
            let path = this.constructor.baseUrl;
            if (this.originalId) {
                method = 'PUT';
                path += '/' + encodeURIComponent(this.originalId);
            }

            return client.restRequest({
                path: path,
                method: method,
                data: this
            }).then(response => {
                return this.updateSelf(response);
            });
        }
        
        patch(values) {
            const id = this.originalId || this[this.constructor.idProperty];
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(id),
                method: 'PATCH',
                data: values
            }).then(response => {
                return this.updateSelf(response);
            });
        }

        delete() {
            const id = this.originalId || this[this.constructor.idProperty];
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(id),
                method: 'DELETE'
            }).then(response => {
                this.updateSelf(response);
                delete this.originalId;
                return this;
            });
        }

        copy(newXid, newName) {
            const id = this.originalId || this[this.constructor.idProperty];
            return client.restRequest({
                path: this.constructor.baseUrl + '/copy/' + encodeURIComponent(id),
                method: 'PUT',
                params: {
                    copyXid: newXid,
                    copyName: newName
                }
            }).then(response => {
                const copy = new this.constructor();
                return copy.updateSelf(response);
            });
        }

        updateSelf(response) {
            Object.assign(this, response.data);
            this.originalId = this[this.constructor.idProperty];
            return this;
        }
    };
}
module.exports = MangoObjectFactory;
