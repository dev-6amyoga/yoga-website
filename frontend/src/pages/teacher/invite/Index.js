import { Button, Input, Tag } from '@geist-ui/core';
import { useState } from 'react';
import getFormData from '../../../utils/getFormData';

function Card({ title, description }) {
    return (
        <div className='border rounded-lg p-4'>
            <h1 className='text-center'>{title}</h1>
            <p className='text-center'>{description}</p>
        </div>
    );
}

export default function InvitePage() {
    const [accepted, setAccepted] = useState(false);
    const [verified, setVerified] = useState(false);
    const [used, setUsed] = useState(false);
    const [expired, setExpired] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');

    const handleAccept = (e) => {
        e.preventDefault();
        setVerified(true);
    };

    const handleReject = (e) => {
        e.preventDefault();
    };

    const handleUpdateDetails = (e) => {
        e.preventDefault();

        const formData = getFormData(e);

        console.log(formData);
    };

    return (
        <div className='grid place-content-center min-h-screen'>
            {!expired ? (
                <>
                    {!accepted ? (
                        <>
                            {!used ? (
                                <>
                                    {verified ? (
                                        <div className='border rounded-lg p-4'>
                                            <h1 className='text-center'>
                                                Invite
                                            </h1>
                                            <div className='text-sm text-center'>
                                                <p>
                                                    To join the institute :
                                                    XYZABCD123456789101112
                                                </p>
                                                <p>
                                                    Invite Expires in : {6} Days
                                                </p>
                                                <div className='mt-4'>
                                                    <Tag
                                                        type='success'
                                                        w='100%'>
                                                        Teacher Verified
                                                    </Tag>
                                                </div>
                                            </div>

                                            <form
                                                className='flex flex-col gap-4 mt-4'
                                                onSubmit={handleUpdateDetails}>
                                                <p className='text-center font-bold'>
                                                    Update your login details!
                                                </p>
                                                <label for='username'>
                                                    Username
                                                    <Input
                                                        name='username'
                                                        w='100%'
                                                    />
                                                </label>
                                                <label for='password'>
                                                    Password
                                                    <Input.Password
                                                        name='password'
                                                        w='100%'
                                                    />
                                                </label>
                                                <label for='confirm_password'>
                                                    Confirm Password
                                                    <Input.Password
                                                        name='confirm_password'
                                                        w='100%'
                                                    />
                                                </label>
                                                <Button
                                                    type='success'
                                                    htmlType='submit'>
                                                    Submit
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className='border rounded-lg p-4'>
                                            <h1 className='text-center'>
                                                Invite
                                            </h1>
                                            <div className='text-sm text-center'>
                                                <p>
                                                    To join the institute :
                                                    XYZABCD123456789101112
                                                </p>
                                                <p>
                                                    Invite Expires in : {6} Days
                                                </p>
                                            </div>

                                            <Input
                                                name='confirm_email'
                                                placeholder='Enter Email to verify'
                                                w='100%'
                                                onChange={(val) =>
                                                    setConfirmEmail(val)
                                                }
                                            />
                                            <div className='flex gap-2'>
                                                <Button
                                                    type='success'
                                                    onClick={handleAccept}>
                                                    Accept
                                                </Button>
                                                <Button
                                                    type='primary'
                                                    onClick={handleReject}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Card
                                    title='You have declined the invitation'
                                    description='You can no longer create your account; Contact the institute owner'
                                />
                            )}
                        </>
                    ) : (
                        <Card
                            title='You have accepted the invitation'
                            description='You can now create your account'
                        />
                    )}
                </>
            ) : (
                <>
                    <Card
                        title='Invite Expired'
                        description='You can no longer create your account; Contact the institute owner'
                    />
                </>
            )}
        </div>
    );
}
