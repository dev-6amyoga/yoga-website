import { Button, Input } from '@geist-ui/core';
import { toast } from 'react-toastify';
import useUserStore from '../../../store/UserStore';
import { Fetch } from '../../../utils/Fetch';
import getFormData from '../../../utils/getFormData';

export default function GeneralSettings() {
    let user = useUserStore((state) => state.user);
    let setUser = useUserStore((state) => state.setUser);

    // useEffect(() => {}, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = getFormData(e);

        if (formData?.name === undefined || formData?.name === '') {
            formData.name = user?.name;
        }

        if (formData?.email === undefined || formData?.email === '') {
            formData.email = user?.email;
        }

        if (formData?.phone === undefined || formData?.phone === '') {
            formData.phone = user?.phone || null;
        }

        // console.log(formData, user);

        Fetch({
            url: 'http://localhost:4000/user/update-profile',
            method: 'POST',
            data: {
                ...formData,
                user_id: user?.user_id,
            },
        })
            .then((res) => {
                if (res && res.status === 200) {
                    Fetch({
                        url: 'http://localhost:4000/user/get-by-id',
                        method: 'POST',
                        data: {
                            user_id: user?.user_id,
                        },
                    }).then((res) => {
                        if (res && res.status === 200) {
                            toast('Profile updated successfully', {
                                type: 'success',
                            });
                            // console.log(res.data.user);
                            setUser(res.data.user);
                        } else {
                            toast('Error updating profile; retry', {
                                type: 'error',
                            });
                        }
                    });
                } else {
                    toast('Error updating profile; retry', { type: 'error' });
                }
            })
            .catch((err) => {
                console.log(err);
                toast('Error updating profile', { type: 'error' });
            });
    };

    return (
        <div>
            <h2>General Settings</h2>
            <form className='flex flex-col gap-2 my-8' onSubmit={handleSubmit}>
                <Input
                    width='100%'
                    defaultValue={user?.name}
                    placeholder={user?.name}
                    name='name'>
                    Name
                </Input>
                <Input
                    width='100%'
                    defaultValue={user?.email}
                    placeholder={user?.email}
                    name='email'>
                    Email
                </Input>
                <Input
                    width='100%'
                    defaultValue={user?.phone}
                    placeholder={user?.phone}
                    name='phone'>
                    Phone
                </Input>
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
