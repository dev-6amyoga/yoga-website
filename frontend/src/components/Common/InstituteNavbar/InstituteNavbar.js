import { Button, ButtonDropdown, Drawer } from '@geist-ui/core';
import { Menu } from '@geist-ui/icons';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../../../store/UserStore';

export default function InstituteNavbar() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    let user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);

    return (
        <div>
            <div className='w-full px-4 py-1 flex bg-zinc-800 text-white items-center gap-4'>
                <Button
                    width={'100%'}
                    auto
                    ghost
                    onClick={() => setOpen(true)}
                    icon={<Menu />}
                />
                <p className='font-bold text-xl'>6AM Yoga</p>
            </div>
            <Drawer
                visible={open}
                onClose={() => setOpen(false)}
                placement='left'>
                <Drawer.Title>6AM Yoga</Drawer.Title>
                <Drawer.Subtitle>Institute Dashboard</Drawer.Subtitle>
                <Drawer.Content>
                    <div className='flex flex-col gap-4 w-full'>
                        <Button className='w-full'>
                            <Link
                                to={'/admin'}
                                className='w-full text-zinc-800'>
                                Dashboard
                            </Link>
                        </Button>

                        <Button className='w-full'>
                            <Link
                                to={'/content/video/create'}
                                className='w-full text-zinc-800'>
                                Member Management
                            </Link>
                        </Button>
                        <ButtonDropdown className='w-full'>
                            <ButtonDropdown.Item main>
                                Content Management
                            </ButtonDropdown.Item>
                        </ButtonDropdown>

                        <Button className='w-full'>
                            <Link
                                to={'/content/video/create'}
                                className='w-full text-zinc-800'>
                                Reports
                            </Link>
                        </Button>
                        <hr />
                        <Button className='w-full'>
                            <Link
                                to={'/institute/settings'}
                                className='w-full text-zinc-800'>
                                Institute Settings
                            </Link>
                        </Button>
                        <Button className='w-full'>
                            <Link
                                to={'/institute/user/settings'}
                                className='w-full text-zinc-800'>
                                User Settings
                            </Link>
                        </Button>
                        <hr />
                        {user ? (
                            <>
                                <h2 className='text-sm text-center'>
                                    Logged in as {user?.name}
                                </h2>
                                <Button
                                    type='error'
                                    onClick={() => {
                                        setUser(null);
                                        navigate('/auth');
                                    }}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link to={'/auth'} className='w-full'>
                                <Button type='primary' width='100%'>
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer>
        </div>
    );
}
