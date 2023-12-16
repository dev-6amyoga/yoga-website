import { Tabs } from '@geist-ui/core';
import ChangePassword from '../../../components/Admin/UserSettings/ChangePassword';
import GeneralSettings from '../../../components/Admin/UserSettings/GeneralSettings';
import AdminNavbar from '../../../components/Common/AdminNavbar/AdminNavbar';
import PageWrapper from '../../../components/Common/PageWrapper';

export default function Settings() {
    return (
        <>
            <AdminNavbar />
            <PageWrapper>
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
            </PageWrapper>
        </>
    );
}
