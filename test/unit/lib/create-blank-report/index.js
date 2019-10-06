'use strict';

const path = require('path');
const fs = require('fs-extra');
const createBlankReport = require('lib/create-blank-report');
const DataTree = require('lib/merge-reports/data-tree');
const serverUtils = require('lib/server-utils');
const {stubTool} = require('../../utils');

describe('lib/merge-reports/report-builder', () => {
    const sandbox = sinon.sandbox.create();

    const createBlankdReport_ = async (destPath = 'default-dest-report/path', pluginConfig, tool) => {
        return await createBlankReport(destPath, pluginConfig, tool);
    };

    const events = {
        CLI: 'cli',
        INIT: 'init'
    };

    // const config = {};
    const config = {
        defaultView: 'failed',
        baseHost: 'test',
        scaleImages: false,
        lazyLoadOffset: 2500,
        errorPatterns: []
    };
    const hermioneTool = stubTool({pluginConfig: {path: 'some/report/dir'}}, Object.assign(events, {RUNNER_END: 'runnerEnd'}));

    beforeEach(() => {
        sandbox.stub(serverUtils, 'require').returns({});
        sandbox.stub(serverUtils, 'prepareCommonJSData');
        sandbox.stub(serverUtils.logger, 'warn');
        sandbox.stub(fs, 'move');
        sandbox.stub(fs, 'writeFileSync');
        sandbox.stub(fs, 'copy').resolves();
        sandbox.stub(fs, 'readdir').resolves([]);

        sandbox.stub(DataTree, 'create').returns(Object.create(DataTree.prototype));
        sandbox.stub(DataTree.prototype, 'mergeWith').resolves();
    });

    afterEach(() => sandbox.restore());

    describe('create', () => {
        it('should create "data.js" file with config and zero counters', async () => {
            const configData = {
                skips: [],
                config: {
                    defaultView: 'failed',
                    baseHost: 'test',
                    scaleImages: false,
                    lazyLoadOffset: 2500,
                    errorPatterns: []
                },
                apiValues: undefined,
                date: new Date().toString(),
                saveFormat: 'sqlite',
                total: 0,
                updated: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                retries: 0,
                warned: 0
            };

            await createBlankdReport_('dest-report/path', config, hermioneTool);
            assert.calledWith(serverUtils.prepareCommonJSData, sinon.match(configData));
        });
    });

    describe('save', () => {
        it('should move static files to destination folder', async () => {
            fs.readdir.resolves(['file-path']);
            const destFilePath = path.resolve('dest-report', 'path');
            await createBlankdReport_('dest-report/path', config, hermioneTool);

            assert.calledWithMatch(fs.copy, 'index.html', path.join(destFilePath, 'index.html'));
            assert.calledWithMatch(fs.copy, 'report.min.js', path.join(destFilePath, 'report.min.js'));
            assert.calledWithMatch(fs.copy, 'report.min.css', path.join(destFilePath, 'report.min.css'));
        });

        it('should move sql.js files to destination folder', async () => {
            fs.readdir.resolves(['file-path']);
            const destFilePath = path.resolve('dest-report', 'path');
            await createBlankdReport_('dest-report/path', config, hermioneTool);

            assert.calledWithMatch(fs.copy, 'sql-wasm.js', path.join(destFilePath, 'sql-wasm.js'));
            assert.calledWithMatch(fs.copy, 'sql-wasm.wasm', path.join(destFilePath, 'sql-wasm.wasm'));
        });

        it('should write "data.js"  to destination folder', async () => {
            fs.readdir.resolves(['file-path']);
            const destFilePath = path.resolve('dest-report', 'path');
            await createBlankdReport_('dest-report/path', config, hermioneTool);

            assert.calledWithMatch(fs.writeFileSync, path.join(destFilePath, 'data.js'));
        });
    });
});
