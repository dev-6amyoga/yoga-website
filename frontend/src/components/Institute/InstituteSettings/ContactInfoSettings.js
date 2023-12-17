import { Button, Input } from '@geist-ui/core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useUserStore from '../../../store/UserStore';
import { Fetch } from '../../../utils/Fetch';
import getFormData from '../../../utils/getFormData';

export default function ContactInfoSettings() {
    const institutes = useUserStore((state) => state.institutes);
    const currentInstituteId = useUserStore(
        (state) => state.currentInstituteId
    );
    const updateInstitute = useUserStore((state) => state.updateInstitute);

    const [currentInstitute, setCurrentInstitute] = useState(null);

    useEffect(() => {
        if (currentInstituteId) {
            setCurrentInstitute(
                institutes?.find(
                    (institute) => institute.institute_id === currentInstituteId
                )
            );
        }
    }, [currentInstituteId, institutes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = getFormData(e);

        if (formData?.email === undefined || formData?.email === '') {
            formData.email = currentInstitute?.email;
        }

        if (formData?.phone === undefined || formData?.phone === '') {
            formData.phone = currentInstitute?.phone;
        }

        // console.log({
        //     ...currentInstitute,
        //     ...formData,
        // });

        Fetch({
            url: 'http://localhost:4000/institute/update',
            method: 'POST',
            data: {
                ...currentInstitute,
                ...formData,
            },
        })
            .then((res) => {
                if (res && res.status === 200) {
                    Fetch({
                        url: 'http://localhost:4000/institute/get-by-instituteid',
                        method: 'POST',
                        data: {
                            institute_id: currentInstitute?.institute_id,
                        },
                    }).then((res) => {
                        if (res && res.status === 200) {
                            toast('Institute updated successfully', {
                                type: 'success',
                            });
                            // console.log({ res: res.data });
                            updateInstitute(res.data);
                        } else {
                            toast('Error updating institute; retry', {
                                type: 'error',
                            });
                        }
                    });
                } else {
                    toast('Error updating institute; retry', { type: 'error' });
                }
            })
            .catch((err) => {
                console.log(err);
                toast('Error updating institute', { type: 'error' });
            });
    };

    return (
        <div>
            <h2>Contact Information Settings</h2>
            <form className='flex flex-col gap-2 my-8' onSubmit={handleSubmit}>
                <Input
                    width='100%'
                    defaultValue={currentInstitute?.email}
                    placeholder={currentInstitute?.email}
                    name='email'>
                    Email
                </Input>
                <Input
                    width='100%'
                    defaultValue={currentInstitute?.phone}
                    placeholder={currentInstitute?.phone}
                    name='phone'>
                    Phone No.
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
