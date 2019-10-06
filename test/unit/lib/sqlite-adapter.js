'use strict';

const SqliteAdapter = require('lib/sqlite-adapter');
const sqlite3 = require('sqlite3').verbose();

describe('lib/sqlite-adapter', () => {
    const sandbox = sinon.createSandbox();
    const config = {path: './test'};
    beforeEach(() => {
        sandbox.stub(sqlite3, 'Database');
        sandbox.stub(SqliteAdapter.prototype, '_createTable');
    });
    afterEach(() => {
        // fs.unlink('test/sqlite.db', err => {
        //     if (err) {
        //         throw err;
        //     }
        // });
        sandbox.restore();
    });

    it('should create a database on init', () => {
        SqliteAdapter.create(config, 'sqlite.db').init();
        assert.calledWith(sqlite3.Database, 'test/sqlite.db');
    });

    // it.only('creates "suites" table with correct structure', () => {
    //      SqliteAdapter.create(config, 'sqlite.db').init().close();
    //     const db =  new sqlite3.Database('test/sqlite.db');
    //     console.log(db);
    //      db.all('select name from sqlite_master where type=\'table\'', function(err, tables) {
    //         console.log(tables);
    //          db.close();
    //         assert.match(tables, [{name: 'suites'}]);
    //     });
    // });

    it('should create "suites" tables on init', () => {
        SqliteAdapter.create(config, 'sqlite.db').init();
        assert.calledOnce(SqliteAdapter.prototype._createTable);
    });
});
