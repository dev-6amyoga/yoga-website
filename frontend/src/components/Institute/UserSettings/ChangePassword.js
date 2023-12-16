import { Button, Input } from '@geist-ui/core';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useUserStore from '../../../store/UserStore';
import { Fetch } from '../../../utils/Fetch';
import getFormData from '../../../utils/getFormData';

export default function ChangePassword() {
    let user = useUserStore((state) => state.user);

    useEffect(() => {}, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = getFormData(e);
        // console.log(formData);

        Fetch({
            url: 'http://localhost:4000/user/update-password',
            method: 'POST',
            data: { ...formData, user_id: user?.user_id },
        })
            .then((res) => {
                if (res && res.status === 200) {
                    toast('Password updated successfully', {
                        type: 'success',
                    });
                } else {
                    toast('Error updating password; retry', {
                        type: 'error',
                    });
                }
            })
            .catch((err) => {
                toast(
                    'Error updating password: ' + err?.response?.data?.error,
                    {
                        type: 'error',
                    }
                );
            });
    };

    return (
        <div>
            <h2>Change Password</h2>
            <form className='flex flex-col gap-2 my-8' onSubmit={handleSubmit}>
                <Input.Password width='100%' required name='old_password'>
                    Old Password
                </Input.Password>
                <Input.Password width='100%' required name='new_password'>
                    New Password
                </Input.Password>
                <Input.Password
                    width='100%'
                    required
                    name='confirm_new_password'>
                    Confirm New Password
                </Input.Password>
                <div className='flex flex-row gap-2 w-full'>
                    <Button
                        className='flex-1'
                        type='secondary'
                        htmlType='submit'>
                        Update
                    </Button>
                    <Button className='flex-1' htmlType='reset'>
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}
