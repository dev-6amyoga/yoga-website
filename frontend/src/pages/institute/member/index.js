import { Tabs } from '@geist-ui/core';
import { useState } from 'react';
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper';

export default function MemberManagement() {
    const [tabValue, setTabValue] = useState('teachers');
    return (
        <InstitutePageWrapper heading={'Member Management'}>
            <Tabs value={tabValue} onChange={(val) => setTabValue(val)}>
                <Tabs.Item label='Teachers' value='teachers'>
                    <h2>Teachers</h2>
                </Tabs.Item>
                <Tabs.Item label='Members' value='members'>
                    <h2>Members</h2>
                </Tabs.Item>
            </Tabs>
        </InstitutePageWrapper>
    );
}
