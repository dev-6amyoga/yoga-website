import { useState } from 'react';
import Login from '../login/login';
import Register from '../register/register';
import './Auth.css';

export default function Auth() {
    const [regOpen, setRegOpen] = useState(true);

    return (
        <div className='bg-[#f0efed] min-h-screen'>
            <div className='h-20 bg-zinc-800 text-white'>
                <h1 className='text-center'>6AM Yoga</h1>
            </div>

            <div className=''>
                {regOpen ? (
                    <div className='p-8 lg:p-20'>
                        <Register switchForm={setRegOpen} />
                    </div>
                ) : (
                    <div className='p-8 lg:p-20'>
                        <Login switchForm={setRegOpen} />
                    </div>
                )}
            </div>
        </div>
    );
}
