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
 * Application model module.
 * It is responsible for managing account.
 * It adds, removes and updates account.
 *
 * @module app.model
 * @namespace app.model
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

// strict mode wrapper function
(function defineAppModel(app) {
    'use strict';

    /**
     * Event listeners attached to tizen Account API.
     *
     * @memberof app.model
     * @public
     * @type {object}
     * @property {function} added
     * @property {function} removed
     * @property {function} updated
     */
    var eventListeners = {
            added: null,
            removed: null,
            updated: null
        };

    // create namespace for the module
    app.model = app.model || {};

    app.model.eventListeners = eventListeners;

    /**
     * Returns application id.
     *
     * @memberof app.model
     * @private
     * @param {function} onError
     * @returns {string}
     */
    function getApplicationId(onError) {
        var context = null;

        try {
            context = tizen.application.getCurrentApplication();
            return context.appInfo.id;
        } catch (error) {
            onError(error);
        }
    }

    /**
     * Returns application app control operation.
     *
     * @memberof app.model
     * @public
     * @param {function} onError
     * @returns {string}
     */
    app.model.getAppcontrolOperation =
            function getAppcontrolOperation(onError) {
        var appControl = null;

        try {
            appControl = tizen.application.getCurrentApplication()
                .getRequestedAppControl();
            return appControl.appControl.operation;
        } catch (error) {
            onError(error);
        }
    };

    /**
     * Returns account provider.
     *
     * @memberof app.model
     * @private
     * @param {function} onError
     * @returns {AccountProvider}
     */
    function getAccountProvider(onError) {
        try {
            return tizen.account.getProvider(
                getApplicationId(onError)
            );
        } catch (error) {
            onError(error);
        }
    }

    /**
     * Adds account.
     *
     * @memberof app.model
     * @public
     * @param {string} userName
     * @param {object} data
     * @param {function} onError
     */
    app.model.addAccount = function addAccount(userName, data, onError) {
        var account = new tizen.Account(
                getAccountProvider(onError),
                {userName: userName}
            ),
            key = '';

        try {
            tizen.account.add(account);
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    account.setExtendedData(key, data[key]);
                }
            }
        } catch (error) {
            onError(error);
        }
    };

    /**
     * Removes account.
     *
     * @memberof app.model
     * @public
     * @param {string} accountId
     * @param {function} onError
     */
    app.model.removeAccount = function removeAccount(accountId, onError) {
        try {
            tizen.account.remove(accountId);
        } catch (error) {
            onError(error);
        }
    };

    /**
     * Updates account data.
     *
     * @memberof app.model
     * @public
     * @param {object} data
     * @param {function} onError
     */
    app.model.updateAccountData = function editAccount(data, onError) {
        app.model.getCurrentAccount(function onSuccess(accounts) {
            var key = '',
                account = accounts[0];

            if (data.user) {
                account.userName = data.user;
            }

            if (data.extData) {
                for (key in data.extData) {
                    if (data.extData.hasOwnProperty(key)) {
                        account.setExtendedData(key, data.extData[key]);
                    }
                }
            }

            try {
                tizen.account.update(account);
            } catch (error) {
                onError(error.message);
            }
        }, onError);
    };

    /**
     * Returns account data.
     *
     * @memberof app.model
     * @public
     * @param {Account} account
     * @param {function} onSuccess
     * @param {function} onError
     */
    app.model.getAccountData =
        function getAccountData(account, onSuccess, onError) {
            account.getExtendedData(
                function success(extData) {
                    onSuccess(
                        {
                            name: account.userName,
                            data: extData
                        }
                    );
                },
                onError
            );
        };

    /**
     * Gets account for current account provider and calls callback.
     *
     * @memberof app.model
     * @public
     * @param {function} onSuccess
     * @param {function} onError
     */
    app.model.getCurrentAccount =
            function getCurrentAccount(onSuccess, onError) {
        try {
            tizen.account.getAccounts(onSuccess, onError,
                getApplicationId(onError));
        } catch (error) {
            onError(error);
        }
    };

    /**
     * Adds event listener for added, removed and updated.
     *
     * @memberof app.model
     * @public
     * @param {string} name
     * @param {function} callback
     */
    app.model.addEventListener = function addEventListener(name, callback) {
        app.model.eventListeners[name] = callback;
    };

    /**
     * Triggers a listener.
     *
     * @memberof app.model
     * @private
     * @param {string} name
     * @param {object} param
     */
    function triggerListener(name, param) {
        if (!app.model.eventListeners[name]) {
            return;
        }

        app.model.eventListeners[name](param);
    }

    /**
     * Initializes model.
     * Adds events listeners for account API.
     *
     * @memberof app.model
     * @public
     * @param {function} onError
     */
    app.model.init = function init(onError) {

        try {
            tizen.account.addAccountListener({
                onadded: function onAdded(account) {
                    triggerListener('added', account);
                },
                onremoved: function onRemoved(accountId) {
                    triggerListener('removed', accountId);
                },
                onupdated: function onUpdate(account) {
                    triggerListener('updated', account);
                }
            });
        } catch (error) {
            onError(error);
        }
    };

})(window.app);
