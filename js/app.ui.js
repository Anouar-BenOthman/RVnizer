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

/* global window, document, tau, console*/

/**
 * Application UI module.
 * It is responsible for managing user interface.
 *
 * @module app.ui
 * @namespace app.ui
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

// strict mode wrapper function
(function defineAppUi(app) {
    'use strict';

    // create namespace for the module
    app.ui = app.ui || {};

    /**
     * Cleans all inputs.
     *
     * @memberof app.ui
     * @private
     */
    function cleanInputs() {
        var inputs = document.getElementsByTagName('input'),
            inputsLen = inputs.length,
            i = 0;

        for (i = 0; i < inputsLen; i += 1) {
            inputs[i].value = '';
        }
    }

    /**
     * Shows add view.
     *
     * @memberof app.ui
     * @public
     */
    app.ui.showAddView = function showAddView() {
        cleanInputs();
        tau.changePage('#add-account-view', {transition: 'none'});
    };

    /**
     * Shows edit view.
     *
     * @memberof app.ui
     * @public
     * @param {Account} account
     */
    app.ui.showEditView = function showEditView(account) {
        if (account.data[0].key === 'data') {
            document.getElementById('edit-account-data')
                .value = account.data[0].value;
        }
        tau.changePage('#edit-account-view', {transition: 'none'});
    };

    /**
     * Shows account view.
     *
     * @memberof app.ui
     * @public
     * @param {object} account
     * @param {string} account.name
     * @param {object[]} account.data
     * @param {string} account.data.key
     * @param {string} account.data.value
     */
    app.ui.showInfoView = function showAccountView(account) {
        var extData = account.data,
            extDataLen = extData.length,
            i = 0,
            dataHTML = '';

        for (i = 0; i < extDataLen; i += 1) {
            dataHTML += '<p>' + extData[i].key + ': ' +
                extData[i].value + '</p>';
        }

        document.getElementById('login').innerText = account.name;
        document.getElementById('data').innerHTML = dataHTML;

        tau.changePage('#info-account-view', {transition: 'none'});
    };

    /**
     * Returns true if info view is opened, false otherwise.
     *
     * @memberof app.ui
     * @public
     * @returns {boolean}
     */
    app.ui.isInfoViewOpened = function isInfoViewOpened() {
        var activePage = tau.getActivePage();

        return activePage && activePage.id === 'info-account-view';
    };

    /**
     * Handles click event on add button in add view.
     *
     * @memberof app.ui
     * @private
     */
    function onAddButtonClick() {
        var usr = document.getElementById('add-account-usr').value.trim(),
            data = document.getElementById('add-account-data')
                .value.trim(),
            externalData = {};

        if (usr === '' || data === '') {
            window.alert('Login or data is incorrect.');
            return;
        }

        externalData.data = data;
        app.doAddAccount(usr, externalData);
    }

    /**
     * Handles click event on remove button in info view.
     *
     * @memberof app.ui
     * @private
     */
    function onRemoveButtonClick() {
        if (!window.confirm('Do you want to remove account?')) {
            return;
        }

        app.doRemoveAccount();
    }

    /**
     * Handles click event on update button in edit view.
     *
     * @memberof app.ui
     * @private
     */
    function onUpdateButtonClick() {
        var data = document.getElementById('edit-account-data').value;

        app.doUpdateAccount(data);
    }

    /**
     * Tizen hardware key event listener.
     *
     * @memberof app.ui
     * @private
     * @param {Event} event
     */
    function onTizenHWKey(event) {
        if (event.keyName === 'back') {
            app.exit();
        }
    }

    /**
     * Binds events to add view.
     *
     * @memberof app.ui
     * @public
     */
    app.ui.bindAddViewEvents = function bindAddViewEvents() {
        document.addEventListener(
            'tizenhwkey',
            onTizenHWKey.bind(app.ui)
        );
        document.getElementById('save-button')
            .addEventListener(
            'click',
            onAddButtonClick.bind(app.ui)
        );
    };

    /**
     * Binds events to edit view.
     *
     * @memberof app.ui
     * @public
     */
    app.ui.bindConfigViewEvents = function bindConfigViewEvents() {
        document.addEventListener(
            'tizenhwkey',
            onTizenHWKey.bind(app.ui)
        );
        document.getElementById('edit-save-button')
            .addEventListener(
            'click',
            onUpdateButtonClick.bind(app.ui)
        );
        document.getElementById('edit-remove-button')
            .addEventListener(
            'click',
            onRemoveButtonClick.bind(app.ui)
        );
    };

    /**
     * Binds events to info view.
     *
     * @memberof app.ui
     * @public
     */
    app.ui.bindInfoViewEvents = function bindInfoViewEvents() {
        document.addEventListener(
            'tizenhwkey',
            onTizenHWKey.bind(app.ui)
        );
        document.getElementById('remove-button')
            .addEventListener(
            'click',
            onRemoveButtonClick.bind(app.ui)
        );
        document.getElementById('save-button')
            .addEventListener(
            'click',
            onAddButtonClick.bind(app.ui)
        );
    };

    /**
     * Shows error message.
     *
     * @memberof app.ui
     * @public
     * @param {object} error
     */
    app.ui.showError = function showError(error) {
        window.alert(error.message);
        console.error(error);
    };

})(window.app);
