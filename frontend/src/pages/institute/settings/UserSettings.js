import { Tabs } from '@geist-ui/core';
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper';
import ChangePassword from '../../../components/Institute/UserSettings/ChangePassword';
import GeneralSettings from '../../../components/Institute/UserSettings/GeneralSettings';

export default function UserSettings() {
    return (
        <InstitutePageWrapper heading='User Settings'>
            <div className='max-w-5xl mx-auto'>
                <Tabs initialValue='general' className=''>
                    <Tabs.Item label='General' value='general'>
                        <GeneralSettings />
                    </Tabs.Item>
                    <Tabs.Item label='Change Password' value='password'>
                        <ChangePassword />
                    </Tabs.Item>
                </Tabs>
            </div>
        </InstitutePageWrapper>
    );
}
