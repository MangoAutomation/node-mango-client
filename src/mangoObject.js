/**
 * Created by Jared on 5/10/2017.
 */

function MangoObjectFactory(client) {
    return class MangoObject {
        constructor(options) {
            this.isNew = true;
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

        get() {
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(this[this.constructor.idProperty])
            }).then(response => {
                return this.updateSelf(response);
            });
        }

        save() {
            const method = this.isNew ? 'POST' : 'PUT';
            return client.restRequest({
                path: this.constructor.baseUrl + '/' + encodeURIComponent(this.originalId),
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
                this.isDeleted = true;
                return this;
            });
        }

        updateSelf(response) {
            Object.assign(this, response.data);
            this.originalId = this[this.constructor.idProperty];
            delete this.isNew;
            return this;
        }
    }
}
module.exports = MangoObjectFactory;
