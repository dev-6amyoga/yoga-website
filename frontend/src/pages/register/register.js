import { Tabs } from '@geist-ui/core';
// import { useEffect, useState } from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InstituteRegisterForm from '../../components/Auth/InstituteRegisterForm';
import LoginGoogle from '../../components/Auth/LoginGoogle';
import StudentRegisterForm from '../../components/Auth/StudentRegisterForm';
import { Fetch } from '../../utils/Fetch';
import {
    validateEmail,
    validatePassword,
    validatePhone,
    validateUsername,
} from '../../utils/formValidation';
import getFormData from '../../utils/getFormData';
import './register.css';

export default function Register({ switchForm }) {
    // const { toast } = useToast();
    const notify = (x) => toast(x);
    const navigate = useNavigate();

    const [billingAddressSame, setBillingAddressSame] = useState(true);

    const handleStudentRegistration = async (e) => {
        e.preventDefault();
        const formData = getFormData(e);
        console.log(formData);

        const [is_phone_valid, phone_error] = validatePhone(formData?.phone_no);

        if (!is_phone_valid) {
            notify(phone_error.message);
            return;
        }

        const [is_email_valid, email_error] = validateEmail(formData?.email_id);

        if (!is_email_valid) {
            notify(email_error.message);
            return;
        }

        if (formData?.password !== formData?.confirm_password) {
            notify('Passwords do not match');
            return;
        }

        const [is_password_valid, pass_error] = validatePassword(
            formData?.password
        );

        if (!is_password_valid) {
            notify(pass_error.message);
            return;
        }

        const newUser = {
            ...formData,
            institute_name: 'Institute 1',
            role_name: 'STUDENT',
            is_google_login: false,
        };
        try {
            const response = await fetch(
                'http://localhost:4000/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                }
            );
            if (response.ok) {
                notify('New User added successfully');
                setTimeout(() => {
                    navigate('/student');
                }, 2000);
            } else {
                const errorData = await response.json();
                notify(errorData.error);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleInstituteRegistration = async (e) => {
        e.preventDefault();
        const formData = getFormData(e);
        // console.log(formData);

        let [is_username_valid, username_error] = validateUsername(
            formData?.username
        );

        if (!is_username_valid) {
            notify(username_error.message);
            return;
        }

        let [is_phone_valid, phone_error] = validatePhone(formData?.phone);

        if (!is_phone_valid) {
            notify(phone_error.message);
            return;
        }

        [is_phone_valid, phone_error] = validatePhone(formData?.contact_phone);

        if (!is_phone_valid) {
            notify(phone_error.message);
            return;
        }

        let [is_email_valid, email_error] = validateEmail(formData?.user_email);

        if (!is_email_valid) {
            notify(email_error.message);
            return;
        }

        [is_email_valid, email_error] = validateEmail(formData?.contact_email);

        if (!is_email_valid) {
            notify(email_error.message);
            return;
        }

        if (formData?.password !== formData?.confirm_password) {
            notify('Passwords do not match');
            return;
        }

        const [is_password_valid, pass_error] = validatePassword(
            formData?.password
        );

        if (!is_password_valid) {
            notify(pass_error.message);
            return;
        }

        try {
            if (formData.pincode) formData.pincode = parseInt(formData.pincode);
            console.log(formData.pincode);
        } catch (err) {
            notify('Pincode must be a number');
            return;
        }

        const addressCombination = `${formData?.address1}, ${formData?.address2}, ${formData?.city} - ${formData?.pincode}, ${formData?.state}, ${formData?.country}`;

        const user = {
            name: formData?.name,
            username: formData?.username,
            email_id: formData?.user_email,
            phone_no: formData?.phone,
            password: formData?.password,
            confirm_password: formData?.confirm_password,
            role_name: 'INSTITUTE_OWNER',
            is_google_login: false,
        };

        const institute = {
            name: formData?.institute_name,
            address1: formData?.address1,
            address2: formData?.address2,
            pincode: formData?.pincode,
            billing_address: billingAddressSame
                ? addressCombination
                : formData?.billing_address,
            email: formData?.contact_email,
            phone: formData?.phone,
        };

        console.log(user, institute);

        Fetch({
            url: 'http://localhost:4000/institute/register',
            method: 'POST',
            data: institute,
        })
            .then((res) => {
                notify('Institute added successfully');
                if (res && res.status === 200) {
                    user.institute_name = institute.name;
                    Fetch({
                        url: 'http://localhost:4000/auth/register',
                        method: 'POST',
                        data: user,
                    })
                        .then((res) => {
                            if (res && res.status === 200) {
                                notify('User added successfully');
                                // setTimeout(() => {
                                //     navigate('/institute');
                                // }, 2000);
                            } else {
                                notify('Error registering user');
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            notify(
                                'Error registering user: ' +
                                    err?.response?.data?.error
                            );
                        });
                } else {
                    notify('Error registering institute');
                }
            })
            .catch((err) => {
                console.log(err);
                notify(
                    'Error registering institute: ' + err?.response?.data?.error
                );
            });
    };

    return (
        <div className='bg-white p-4 rounded-lg max-w-xl mx-auto'>
            <h3 className='text-center text-2xl'>Register</h3>
            <br />
            <Tabs initialValue='student' leftSpace='150px'>
                <Tabs.Item
                    label={
                        <span style={{ textAlign: 'center' }}>
                            Register as Institute
                        </span>
                    }
                    value='institute'>
                    <InstituteRegisterForm
                        handleSubmit={handleInstituteRegistration}
                        billingAddressSame={billingAddressSame}
                        setBillingAddressSame={setBillingAddressSame}
                    />
                </Tabs.Item>
                <Tabs.Item label='Register as Student' value='student'>
                    <StudentRegisterForm
                        handleSubmit={handleStudentRegistration}
                    />
                </Tabs.Item>
            </Tabs>
            <hr />
            <div className='flex flex-col gap-1 items-center w-full mt-4'>
                <p
                    onClick={() => switchForm((s) => !s)}
                    className='hover:pointer'>
                    Already have an account?{' '}
                    <span className='text-blue-500'>Click Here</span>
                </p>
                <div>
                    <LoginGoogle />
                </div>
            </div>
        </div>
    );
}
