/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import cockpit from 'cockpit';
import WickedAdapter from './wicked/adapter';
import init from 'y3network_wasm';

/**
 * Class responsible for interacting with the network.
 *
 * This class should be the entry point when it comes to read or modify the
 * network configuration.
 */
class NetworkClient {
    constructor(adapter) {
        this.adapter = adapter || new WickedAdapter();
    }

    /**
     * Whether the service for interacting with network is active or not
     *
     * @return {Promise.<boolean>} Promise that resolves to true if service is active or false if not
     */
    async isActive() {
        const command = `systemctl --system is-active ${this.adapter.serviceName()}`;
        const output = await cockpit.spawn(command.split(' '), { superuser: true });

        return output.trim() === "active";
    }

    /**
     * Returns the list of available connection configurations
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    async getConnections() {
        return await this.adapter.connections();
    }

    /**
     * Returns the list of available interfaces
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    async getInterfaces() {
        const ifaces = await this.adapter.interfaces();
        return ifaces.filter(i => i.name !== 'lo');
    }

    /**
     * Returns the list of configured routes
     *
     * @returns {Promise<Array|Error>} Resolves to an array of objects in case of success
     */
    async getRoutes() {
        return await this.adapter.routes();
    }

    /**
     *
     *  Returns the DNS global settings object
     *
     * @returns {Promise<DnsSettings>} - DNS global settings object
     *
     */
    async getDnsSettings() {
        return this.adapter.dnsSettings();
    }

    updateDnsSettings(changes) {
        return this.adapter.updateDnsSettings(changes);
    }

    addConnection(connection) {
        return this.adapter.addConnection(connection);
    }

    deleteConnection(connection) {
        return this.adapter.deleteConnection(connection);
    }

    /**
     * Reloads a connection
     *
     * @param {String} name - Connection's name
     * @returns {Promise}
     */
    reloadConnection(name) {
        return this.adapter.reloadConnection(name);
    }

    setUpConnection(connection) {
        return this.adapter.setUpConnection(connection);
    }

    setDownConnection(connection) {
        return this.adapter.setDownConnection(connection);
    }

    /**
     * Update the given connection
     *
     * It asks the network system to update the information for the given connection
     *
     * @param {Connection} Connection - Connection to update
     * @return {Promise<Connection|Error>}
     */
    updateConnection(connection) {
        return new Promise((resolve, reject) => {
            this.adapter.updateConnection(connection)
                    .then(() => resolve(connection))
                    .catch(error => {
                        console.error("Error while updating the connection:", error);
                        reject(error);
                    });
        });
    }

    /**
     * Update routes
     *
     * @param {Array<Object>} routes - List of routes to update
     * @returns {Promise<Array|Error>} Resolves to an array of connection objects in case of success
     */
    async updateRoutes(routes) {
        return await this.adapter.updateRoutes(routes);
    }

    /**
     *
     * @param {Interface} Interface - Obtains the list of networks available for the given interface
     * @returns {Promise<Array<String>|Error>}
     */
    async getEssidList(iface) {
        const essidLabel = 'ESSID';
        const link_up = `ip link set ${iface} up`;
        const scan = `iwlist ${iface} scan`;
        const output = await cockpit.spawn(
            ["bash", "-c", `${link_up} && ${scan}`], { superuser: true }
        );

        const extractValue = function(labelValuePair) {
            const quotedValue = labelValuePair
                    .split(':')
                    .slice(1)
                    .join(':');
            const unquotedValue = quotedValue
                    .split('"')
                    .slice(1, -1)
                    .join('"');
            return unquotedValue;
        };

        const trimmedOutputLines = output.split('\n').map(s => s.trim());
        const essidEntriesArrayWithLabel = trimmedOutputLines.filter(s => s.startsWith(essidLabel));
        const essidValuesArray = essidEntriesArrayWithLabel.map(s => extractValue(s));

        return essidValuesArray;
    }

    /**
     * Callback that runs when an interface changes
     */
    onInterfaceChange(fn) {
        this.adapter.onInterfaceChange(fn);
    }
}

export default NetworkClient;
