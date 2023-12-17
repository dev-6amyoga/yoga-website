import { Tabs } from '@geist-ui/core';
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper';

export default function InstituteSettings() {
    return (
        <InstitutePageWrapper heading='Institute Settings'>
            <div className='max-w-5xl mx-auto'>
                <Tabs initialValue='general' className=''>
                    <Tabs.Item label='General' value='general'>
                        <h2>General</h2>
                    </Tabs.Item>
                    <Tabs.Item label='Contact Information' value='contact'>
                        <h2>Contact Information</h2>
                    </Tabs.Item>
                    <Tabs.Item label='Billing' value='billing'>
                        <h2>Billing</h2>
                    </Tabs.Item>
                </Tabs>
            </div>
        </InstitutePageWrapper>
    );
}
