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
import React, { useEffect } from 'react';
import { useNetworkDispatch, useNetworkState, fetchDnsSettings } from '../context/network';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import DnsSettings from './DnsSettings';

const _ = cockpit.gettext;

const DnsTab = () => {
    const { dns } = useNetworkState();
    const dispatch = useNetworkDispatch();

    useEffect(() => {
        fetchDnsSettings(dispatch);
    }, [dispatch]);

    return (
        <>
            <Card>
                <CardTitle>{_("DNS")}</CardTitle>
                <CardBody>
                    <DnsSettings dns={dns} />
                </CardBody>
            </Card>
        </>
    );
};

export default DnsTab;