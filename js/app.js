/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global window, tizen*/

/**
 * Main application module.
 * Provides a namespace for other application modules.
 * Handles application life cycle.
 *
 * @module app
 * @requires {@link app.ui}
 * @requires {@link app.model}
 * @namespace app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

// strict mode wrapper function
(function defineApp(app) {
    'use strict';

    /**
     * Closes application.
     *
     * @memberof app
     * @public
     */
    app.exit = function exit() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (error) {
            app.ui.showError(error);
        }
    };

    /**
     * Adds account.
     *
     * @memberof app
     * @public
     * @param {string} userName
     * @param {object} data
     */
    app.doAddAccount = function doAddAccount(userName, data) {
        app.model.addAccount(userName, data, app.ui.showError);
    };

    /**
     * Removes current account.
     *
     * @memberof app
     * @public
     */
    app.doRemoveAccount = function doRemoveAccount() {

        app.model.getCurrentAccount(
            function remove(accounts) {
                if (accounts[0]) {
                    app.model.removeAccount(accounts[0].id);
                }
            },
            app.ui.showError
        );
    };

    /**
     * Updates data of the current account.
     *
     * @memberof app
     * @public
     * @param {object} data
     */
    app.doUpdateAccount = function doUpdateAccount(data) {
        app.model.updateAccountData({extData: {data: data}}, app.ui.showError);
    };

    /**
     * Binds events to add view.
     *
     * @memberof app
     * @private
     */
    app.bindAddViewEvents = function bindAddViewEvents() {
        app.ui.bindAddViewEvents();
        app.model.addEventListener('updated', app.exit);
    };

    /**
     * Binds events to edit view.
     *
     * @memberof app
     * @private
     */
    app.bindConfigViewEvents = function bindConfigViewEvents() {
        app.ui.bindConfigViewEvents();
        app.model.addEventListener('updated', app.exit);
        app.model.addEventListener('removed', app.exit);

    };

    /**
     * Binds events to info view.
     *
     * @memberof app
     * @private
     */
    app.bindInfoViewEvents = function bindInfoViewEvents() {

        app.ui.bindInfoViewEvents();
        app.model.addEventListener('updated', function onUpdated(account) {
            // do nothing if info view is already opened
            if (app.ui.isInfoViewOpened()) {
                return;
            }

            app.model.getAccountData(
                account,
                app.ui.showInfoView,
                app.ui.showError
            );
        });
        app.model.addEventListener('removed', app.ui.showAddView);
    };

    /**
     * Initializes application.
     *
     * @memberof app
     * @private
     */
    app.init = function init() {
        var appControlOperation = null;

        app.model.init(app.ui.showError);
        appControlOperation = app.model.getAppcontrolOperation(
            app.ui.showError
        );

        switch (appControlOperation) {
            // application opened from account settings by add new account
            case 'http://tizen.org/appcontrol/operation/account/add':
                app.ui.showAddView();
                app.bindAddViewEvents();
                break;
            // application opened from account settings by account configuration
            case 'http://tizen.org/appcontrol/operation/account/configure':
                app.model.getCurrentAccount(function callback(account) {
                    app.model.getAccountData(
                        account[0],
                        app.ui.showEditView,
                        app.ui.showError
                    );
                    app.bindConfigViewEvents();
                }, app.ui.showError);
                break;
            // application opened from home menu
            default :
                app.model.getCurrentAccount(function callback(account) {
                    if (account.length === 0) {
                        app.ui.showAddView();
                        app.bindInfoViewEvents();
                    } else {
                        app.model.getAccountData(
                            account[0],
                            app.ui.showInfoView,
                            app.ui.showError
                        );
                        app.bindInfoViewEvents();
                    }

                }, app.ui.showError);
        }
    };

    /**
     * Runs the application.
     *
     * @memberof app
     * @public
     */
    app.run = function run() {
        app.init();
    };

    window.addEventListener('load', app.run);

})(window.app);
