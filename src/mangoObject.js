/**
 * Created by Jared on 5/10/2017.
 */

function MangoObjectFactory(client) {
    return class MangoObject {
        constructor(options) {
            Object.assign(this, options);
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

        get() {
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(this[this.constructor.idProperty])
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

        delete() {
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(this[this.constructor.idProperty]),
                method: 'DELETE'
            }).then(response => {
                this.updateSelf(response);
                delete this.originalId;
                return this;
            });
        }

        updateSelf(response) {
            Object.assign(this, response.data);
            this.originalId = this[this.constructor.idProperty];
            return this;
        }
    }
}
module.exports = MangoObjectFactory;
