/**
 * Created by Jared on 5/11/2017.
 */

const config = require('./setup');

describe('User service', () => {
    before('Login', () => {
        return User.login(config.username, config.password);
    });

    it('Returns the current user', () => {
        return User.current().then(user => {
            assert.equal(user.username, config.username);
        });
    })
});
