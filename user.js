/**
 * Created by Jared on 5/10/2017.
 */

function userFactory(client) {
    const MangoObject = client.MangoObject;

    return class User extends MangoObject {
        static get baseUrl() {
            return '/rest/v1/users';
        }

        static get idProperty() {
            return 'username';
        }

        static login(username, password) {
            return client.restRequest({
                path: '/rest/v2/login',
                method: 'POST',
                data: {username: username, password}
            }).then(response => {
                return (new User()).updateSelf(response);
            });
        }

        static current() {
            return client.restRequest({
                path: this.baseUrl + '/current'
            }).then(response => {
                return (new User()).updateSelf(response);
            });
        }
    }
}

module.exports = userFactory;
