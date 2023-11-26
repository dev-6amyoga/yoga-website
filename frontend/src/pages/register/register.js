import { Button, Input, Select } from '@geist-ui/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginGoogle from '../../components/Auth/LoginGoogle';
import './register.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register({ switchForm }) {
    const [userType1, setUserType1] = useState('');
    const handler = (val) => {
        setUserType1(val);
    };
    const [allUsers, setAllUsers] = useState([]);
    const navigate = useNavigate();
    const notify = () =>
        toast('Email/Phone Number already exists! Please login.');
    useEffect(() => {
        fetch('http://localhost:4000/allUsers')
            .then((response) => response.json())
            .then((users) => {
                setAllUsers(users);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const phoneNo = document.querySelector('#phone_no').value;
        const emailId = document.querySelector('#email_id').value;
        const name = document.querySelector('#name_user').value;
        const today = new Date();
        const username = document.querySelector('#user_name').value;
        const password = document.querySelector('#pass_word').value;
        const maxId = allUsers.reduce(
            (max, user) => (user.user_id > max ? user.user_id : max),
            0
        );
        const userType = userType1;
        const found = allUsers.some(
            (entry) =>
                entry.email_id === emailId || entry.phone_number === phoneNo
        );
        if (found) {
            notify();
            return;
        } else {
            const newUser = {
                user_id: maxId + 1,
                user_name: name,
                creation_date: today,
                phone_number: phoneNo,
                email_id: emailId,
                username: username,
                password: password,
                user_type: userType,
                institute_id: 1,
                institute_name: '6AM Yoga',
            };
            try {
                const response = await fetch('http://localhost:4000/addUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser),
                });
                if (response.ok) {
                    console.log('New User added successfully');
                    navigate('/student');
                } else {
                    console.error('Failed to add new user');
                }
            } catch (error) {
                console.error('Error while making the request:', error);
            }
        }
    };
    return (
        <div className='bg-white p-4 rounded-lg max-w-xl mx-auto'>
            <h3 className='text-center text-2xl'>Register</h3>
            <hr />
            <div className='flex flex-col gap-1 items-center w-full mt-4'>
                <form
                    className='flex flex-col gap-4 w-full'
                    onSubmit={handleSubmit}>
                    <Input width='100%' id='phone_no' placeholder='9999999999'>
                        Phone Number
                    </Input>
                    <Input
                        width='100%'
                        id='email_id'
                        placeholder='abc@email.com'>
                        Email ID
                    </Input>
                    <Input width='100%' id='name_user' placeholder='John Doe'>
                        Name
                    </Input>
                    <Input width='100%' id='user_name' placeholder='johnDoe123'>
                        Username
                    </Input>
                    <Input.Password width='100%' id='pass_word'>
                        Password
                    </Input.Password>
                    <Select
                        placeholder='Choose Account Type'
                        onChange={handler}
                        id='user_type'>
                        <Select.Option value='student'>Student</Select.Option>
                    </Select>
                    <Button htmlType='submit'>Register</Button>
                </form>
                <p
                    onClick={() => switchForm((s) => !s)}
                    className='hover:pointer'>
                    Already have an account?{' '}
                    <span className='text-blue-500'>Click Here</span>
                </p>
                <div>
                    <ToastContainer />
                </div>
                <LoginGoogle />
            </div>
        </div>
    );
}
