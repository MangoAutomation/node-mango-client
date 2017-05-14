/**
 * Created by Jared on 5/11/2017.
 */

const config = require('./setup');

describe('Data source service', () => {
    before('Login', () => {
        return User.login(config.username, config.password);
    });

    it('Gets the internal data source', () => {
        return DataSource.get('internal_mango_monitoring_ds').then(ds => {
            assert.equal(ds.xid, 'internal_mango_monitoring_ds');
            assert.equal(ds.name, 'Mango Internal');
            assert.isTrue(ds.enabled);
        });
    });

    it('Creates a new virtual data source', () => {
        const ds = new DataSource({
            xid: 'mango_client_test',
            name: 'Mango client test',
            enabled: true,
            modelType: 'VIRTUAL',
            pollPeriod: { periods: 5, type: 'SECONDS' },
            purgeSettings: { override: false, frequency: { periods: 1, type: 'YEARS' } },
            alarmLevels: { POLL_ABORTED: 'URGENT' },
            editPermission: null
        });

        return ds.save().then((savedDs) => {
            assert.strictEqual(savedDs, ds);
            assert.equal(savedDs.xid, 'mango_client_test');
            assert.equal(savedDs.name, 'Mango client test');
            assert.isNumber(savedDs.id);
        });
    });

    it('Modifies the new virtual data source', () => {
        return DataSource.get('mango_client_test').then(ds => {
            assert.equal(ds.xid, 'mango_client_test');
            assert.equal(ds.name, 'Mango client test');
            ds.name = 'xyz';
            return ds.save().then((savedDs) => {
                assert.equal(savedDs.name, 'xyz');
            });
        });
    });

    it('Deletes the new virtual data source', () => {
        return DataSource.delete('mango_client_test');
    });
});
