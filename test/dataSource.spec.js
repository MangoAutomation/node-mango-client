/**
 * Created by Jared on 5/11/2017.
 */

const config = require('./setup');

describe('Data source service', () => {
    before('Login', () => {
        return User.login(config.username, config.password);
    });

    it('Returns the internal data source', () => {
        return DataSource.get('internal_mango_monitoring_ds').then(ds => {
            assert.equal(ds.xid, 'internal_mango_monitoring_ds');
            assert.equal(ds.name, 'Mango Internal');
            assert.isTrue(ds.enabled);
        });
    })
});
