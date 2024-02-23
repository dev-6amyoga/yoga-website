import { Button, ButtonDropdown, Drawer } from '@geist-ui/core'
import { Menu } from '@geist-ui/icons'
import { memo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useUserStore from '../../../store/UserStore'
import { FetchRetry } from '../../../utils/Fetch'
import RoleShifter from '../RoleShifter'
import './AdminNavbar.css'

const paths = [
    {
        path: '/admin',
        title: 'Dashboard',
    },
    {
        title: 'Member Management',
        type: 'group',
        subPaths: [
            { path: '/admin/members/institutes', title: 'Institutes' },

            { path: '/admin/members/students', title: 'Students' },

            { path: '/admin/members/teachers', title: 'Teachers' },
        ],
    },
    {
        title: 'Schedule Management',
        type: 'group',
        subPaths: [
            {
                path: '/admin/schedule/register',
                title: 'Register New Schedule',
            },
            { path: '/admin/schedule/view', title: 'View All Schedules' },
        ],
    },
    {
        title: 'Content Management',
        type: 'group',
        subPaths: [
            { path: '/admin/video/create', title: 'Register New Asana' },
            { path: '/admin/video/view-all', title: 'View All Asanas' },
            {
                path: '/admin/video/transition/create',
                title: 'Register Transition Video',
            },
            {
                path: '/admin/video/transition/all',
                title: 'View Transition Videos',
            },
            {
                path: '/admin/playlist/create',
                title: 'Register New Playlist',
            },
            { path: '/admin/playlist/view-all', title: 'View All Playlists' },
            { path: '/admin/language/create', title: 'Register Language' },
            { path: '/admin/language/view-all', title: 'View All Languages' },
            {
                path: '/admin/asana-category/create',
                title: 'Register Asana Category',
            },
            {
                path: '/admin/asana-category/all',
                title: 'View All Asana Categories',
            },
        ],
    },
    {
        title: 'Transaction Management',
        type: 'group',
        subPaths: [
            {
                path: '/admin/transactions/log-payment',
                title: 'Log a Payment',
            },
            { path: '/admin/transactions/refund', title: 'Refund Management' },
        ],
    },
    {
        title: 'Plan Management',
        type: 'group',
        subPaths: [
            {
                path: '/admin/plan/create',
                title: 'Register New Plan',
            },
            {
                path: '/admin/plan/view-all',
                title: 'View All Plans',
            },
        ],
    },
    { path: '/admin/discount-management', title: 'Discount Management' },

    { title: 'Free Videos' },
]

function AdminNavbar() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const [user, currentRole, userPlan, resetUserState] = useUserStore(
        useShallow((state) => [
            state.user,
            state.currentRole,
            state.userPlan,
            state.resetUserState,
        ])
    )

    const handleLogout = () => {
        FetchRetry({
            url: 'http://localhost:4000/auth/logout',
            method: 'POST',
            token: true,
        })
            .then((res) => {
                sessionStorage.removeItem('6amyoga_access_token')
                sessionStorage.removeItem('6amyoga_refresh_token')
                resetUserState()
                navigate('/auth')
            })
            .catch((err) => {
                console.error('Logout Error:', err)
                resetUserState()
                navigate('/auth')
            })
    }

    return (
        <div className="">
            <div className="fixed z-[1000] flex w-full items-center gap-4 bg-zinc-900 px-8 py-4 text-white">
                <button onClick={() => setOpen(true)}>
                    <Menu />
                </button>
                <h1 className="text-xl font-bold">6AM Yoga</h1>
            </div>
            <Drawer
                visible={open}
                onClose={() => setOpen(false)}
                placement="left"
            >
                <Drawer.Title>6AM Yoga</Drawer.Title>
                <Drawer.Subtitle>Admin Dashboard</Drawer.Subtitle>
                <Drawer.Content>
                    <div className="flex w-full flex-col gap-4">
                        <RoleShifter />

                        {paths.map((path, index) => {
                            if (path?.type === 'group') {
                                return (
                                    <ButtonDropdown key={index}>
                                        <ButtonDropdown.Item main>
                                            {path.title}
                                        </ButtonDropdown.Item>

                                        {path.subPaths.map((subPath, index) => (
                                            <ButtonDropdown.Item
                                                key={
                                                    'subPath' +
                                                    subPath.path +
                                                    index
                                                }
                                                onClick={() =>
                                                    navigate(subPath.path)
                                                }
                                            >
                                                {subPath.title}
                                            </ButtonDropdown.Item>
                                        ))}
                                    </ButtonDropdown>
                                )
                            } else {
                                return (
                                    <Button
                                        width="100%"
                                        auto
                                        key={'nav_path' + path.title}
                                        onClick={() => {
                                            navigate(path.path)
                                        }}
                                    >
                                        {path.title}
                                    </Button>
                                )
                            }
                        })}
                        <hr />
                        <hr />
                        {user ? (
                            <>
                                <h2 className="text-center text-sm">
                                    Logged in as {user?.name}
                                </h2>
                                <Button type="error" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link to={'/auth'} className="w-full">
                                <Button type="primary" width="100%">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer>
        </div>
    )
}

export default memo(AdminNavbar)
