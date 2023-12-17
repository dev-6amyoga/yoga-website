import { Tabs } from '@geist-ui/core';
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper';
import BillingSettings from '../../../components/Institute/InstituteSettings/BillingSettings';
import ContactInfoSettings from '../../../components/Institute/InstituteSettings/ContactInfoSettings';
import GeneralSettings from '../../../components/Institute/InstituteSettings/GeneralSettings';

export default function InstituteSettings() {
    return (
        <InstitutePageWrapper heading='Institute Settings'>
            <div className='max-w-5xl mx-auto'>
                <Tabs initialValue='general' className=''>
                    <Tabs.Item label='General' value='general'>
                        <GeneralSettings />
                    </Tabs.Item>
                    <Tabs.Item label='Contact Information' value='contact'>
                        <ContactInfoSettings />
                    </Tabs.Item>
                    <Tabs.Item label='Billing' value='billing'>
                        <BillingSettings />
                    </Tabs.Item>
                </Tabs>
            </div>
        </InstitutePageWrapper>
    );
}
