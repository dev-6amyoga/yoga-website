import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Input } from '@geist-ui/core';
import axios from 'axios';
import LoginGoogle from '../../components/Auth/LoginGoogle';
import useUserStore from '../../store/UserStore';
import './login.css';

export default function Login({ switchForm }) {
    const [loginStatus, setLoginStatus] = useState(null);
    const navigate = useNavigate();
    const [type, SetType] = useState('');
    const setUser = useUserStore((state) => state.setUser);

    async function verify_login(username, password) {
        try {
            const baseURL = 'http://localhost:4000';
            const response = await axios.get(`${baseURL}/allUsers`);
            var userExists = false;
            for (const entry of response.data) {
                if (
                    entry.username === username &&
                    entry.password === password
                ) {
                    userExists = true;
                    SetType(entry.user_type);
                    setUser(entry);
                    break;
                }
            }
            console.log(loginStatus);
            setLoginStatus(
                userExists ? 'Login successful' : 'Invalid credentials'
            );
        } catch (error) {
            console.error(error);
            setLoginStatus('Failed to verify login');
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = document.querySelector('#user_name').value;
        const password = document.querySelector('#pass_word').value;
        verify_login(username, password);
    };

    useEffect(() => {
        console.log(loginStatus);
        if (loginStatus === 'Login successful' && type === 'student') {
            const navigateTimeout = setTimeout(() => navigate('/student'), 0);
            return () => clearTimeout(navigateTimeout);
        } else if (loginStatus === 'Login successful' && type === 'admin') {
            const navigateTimeout = setTimeout(() => navigate('/admin'), 0);
            return () => clearTimeout(navigateTimeout);
        } else if (loginStatus === 'Login successful' && type === 'teacher') {
            const navigateTimeout = setTimeout(() => navigate('/teacher'), 0);
            return () => clearTimeout(navigateTimeout);
        }
    }, [loginStatus, type, navigate]);

    return (
        <div className='bg-white p-4 rounded-lg max-w-xl mx-auto'>
            <h3 className='text-center text-2xl'>Login</h3>
            <hr />
            <div className='flex flex-col gap-1 items-center w-full mt-4'>
                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4 w-full'>
                    <Input width='100%' id='user_name'>
                        Username
                    </Input>
                    <Input.Password width='100%' id='pass_word'>
                        Password
                    </Input.Password>
                    <Button htmlType='submit'>Login</Button>
                </form>
                <p
                    onClick={() => switchForm((s) => !s)}
                    className='hover:pointer'>
                    Dont have an account?{' '}
                    <span className='text-blue-500'>Click Here</span>
                </p>
                <p>{'( or )'}</p>
                <LoginGoogle />
            </div>
        </div>
    );
}
