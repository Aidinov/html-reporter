'use strict';
import actionNames from 'lib/static/modules/action-names';
import defaultState from 'lib/static/modules/default-state';

const proxyquire = require('proxyquire');
const reducer = proxyquire('lib/static/modules/reducer', {
    './local-storage-wrapper': {
        setItem: sinon.stub(),
        getItem: sinon.stub()
    }
}).default;

describe('lib/static/modules/reducer', () => {
    describe('reducer', () => {
        describe('regression', () => {
            it('shouldn\'t change "Expand" filter when "Show all" or "Show only failed" state changing', function() {
                let newState = [
                    {type: actionNames.VIEW_EXPAND_RETRIES},
                    {type: actionNames.VIEW_SHOW_ALL}
                ].reduce(reducer, defaultState);

                assert.equal(newState.view.expand, 'retries');

                newState = [
                    {type: actionNames.VIEW_EXPAND_RETRIES},
                    {type: actionNames.VIEW_SHOW_FAILED}
                ].reduce(reducer, defaultState);

                assert.equal(newState.view.expand, 'retries');
            });
        });

        describe('VIEW_SHOW_ALL', () => {
            it('should change "viewMode" field on "all" value', () => {
                const action = {type: actionNames.VIEW_SHOW_ALL};

                const newState = reducer(defaultState, action);

                assert.equal(newState.view.viewMode, 'all');
            });
        });

        describe('VIEW_SHOW_FAILED', () => {
            it('should change "viewMode" field on "failed" value', () => {
                const action = {type: actionNames.VIEW_SHOW_FAILED};

                const newState = reducer(defaultState, action);

                assert.equal(newState.view.viewMode, 'failed');
            });
        });

        describe('parsing database results', () => {
            it('should build correct tree', () => {
                const values = [
                    [JSON.stringify(['test', 'smalltest1']), 'smalltest1', 'browser', 'url', JSON.stringify({muted: false}), 'yml', null, null, JSON.stringify([]), 0, 1, 'fail', 0],
                    [JSON.stringify(['test', 'smalltest1']), 'smalltest1', 'browser', 'url', JSON.stringify({muted: false}), 'yml', null, null, JSON.stringify([]), 0, 1, 'success', 1],
                    [JSON.stringify(['test', 'smalltest2']), 'smalltest2', 'browser', 'url', JSON.stringify({muted: false}), 'yml', null, null, JSON.stringify([]), 0, 1, 'success', 1]
                ];

                const db = {
                    exec: function() {
                        return [{values: values}];
                    }
                };
                const action = {
                    type: actionNames.FETCH_DB, payload: {db: db, stats: {fetched: 1}}
                };
                const newState = reducer(defaultState, action);
                assert.match(newState.suites['test'].children[0].name, 'smalltest1');
                assert.match(newState.suites['test'].children[1].name, 'smalltest2');
                assert.match(newState.suites['test'].children[0].browsers[0].retries.length, 1);
                assert.match(newState.suites['test'].children[1].browsers[0].retries.length, 0);
            });
        });
    });
});
