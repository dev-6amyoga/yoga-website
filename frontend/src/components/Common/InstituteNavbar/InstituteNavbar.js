import { Button, Divider, Drawer, Select, Spacer } from '@geist-ui/core'
import { Menu, Plus } from '@geist-ui/icons'
import { memo, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { USER_PLAN_ACTIVE } from '../../../enums/user_plan_status'
import useUserStore from '../../../store/UserStore'
import { Fetch } from '../../../utils/Fetch'
import RoleShifter from '../RoleShifter'

function InstituteNavbar() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [activePlanID, setActivePlanID] = useState(0)
    const [basicPlaylist, setBasicPlaylist] = useState(false)
    const [playlistCreation, setPlaylistCreation] = useState(false)
    const [selfAudio, setSelfAudio] = useState(false)
    const [moreTeachers, setMoreTeachers] = useState(false)

    const [
        currentInstituteId,
        setCurrentInstituteId,
        user,
        setUser,
        institutes,
    ] = useUserStore((state) => [
        state.currentInstituteId,
        state.setCurrentInstituteId,
        state.user,
        state.setUser,
        state.institutes,
    ])

    const handleInstituteSelection = (value) => {
        console.log('Selected Institute:', value)
        setCurrentInstituteId(parseInt(value))
    }

    const resetUserState = useUserStore((state) => state.resetUserState)
    const handleLogout = () => {
        Fetch({
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
                console.log('Logout Error:', err)
                sessionStorage.removeItem('6amyoga_access_token')
                sessionStorage.removeItem('6amyoga_refresh_token')
                resetUserState()
                navigate('/auth')
            })
    }

    useEffect(() => {
        if (user && currentInstituteId) {
            Fetch({
                url: 'http://localhost:4000/user-plan/get-user-institute-plan-by-id',
                method: 'POST',
                data: {
                    user_id: user?.user_id,
                    institute_id: currentInstituteId,
                },
            }).then((res) => {
                for (var i = 0; i !== res.data.userplans.length; i++) {
                    if (
                        res.data.userplans[i].current_status ===
                        USER_PLAN_ACTIVE
                    ) {
                        setActivePlanID(res.data.userplans[i]?.plan_id)
                        if (res.data.userplans[i].plan.has_basic_playlist) {
                            setBasicPlaylist(true)
                        } else {
                            setBasicPlaylist(false)
                        }
                        if (res.data.userplans[i].plan.has_playlist_creation) {
                            setPlaylistCreation(true)
                        } else {
                            setPlaylistCreation(false)
                        }
                        if (res.data.userplans[i].plan.has_self_audio_upload) {
                            setSelfAudio(true)
                        } else {
                            setSelfAudio(false)
                        }
                        if (res.data.userplans[i].plan.number_of_teachers > 0) {
                            setMoreTeachers(true)
                        } else {
                            setMoreTeachers(false)
                        }
                        break
                    } else {
                        toast(
                            'You dont have an active plan! Please head to the Purchase A Plan page'
                        )
                    }
                }
            })
        }
    }, [user, currentInstituteId])

    return (
        <div>
            <div className="flex w-full items-center gap-4 bg-zinc-800 px-4 py-1 text-white">
                <Button
                    width={'100%'}
                    auto
                    ghost
                    onClick={() => setOpen(true)}
                    icon={<Menu />}
                />
                <p className="text-xl font-bold">6AM Yoga</p>
            </div>
            <Drawer
                visible={open}
                onClose={() => setOpen(false)}
                placement="left"
            >
                <Drawer.Title>6AM Yoga</Drawer.Title>
                <Drawer.Subtitle>Institute Dashboard</Drawer.Subtitle>
                <Drawer.Content>
                    <div className="py-4">
                        <RoleShifter />
                        <Divider />
                        <Spacer h={1} />
                        <Button
                            iconRight={<Plus />}
                            onClick={() => navigate('/institute/create')}
                            width="100%"
                        >
                            Create Institute
                        </Button>
                        <Spacer h={1 / 2} />
                        <Select
                            width="100%"
                            value={String(currentInstituteId)}
                            placeholder="Select An Institute"
                            onChange={handleInstituteSelection}
                            className="my-2"
                        >
                            {institutes?.map((institute) => {
                                return (
                                    <Select.Option
                                        key={institute.institute_id}
                                        value={String(institute.institute_id)}
                                    >
                                        {institute.name}
                                    </Select.Option>
                                )
                            })}
                        </Select>
                    </div>
                    <Divider />
                    <div className="flex w-full flex-col gap-4">
                        <Button className="w-full">
                            <Link
                                to={'/institute'}
                                className="w-full text-zinc-800"
                            >
                                Dashboard
                            </Link>
                        </Button>
                        <Button className="w-full">
                            <Link
                                to={'/institute/purchase-a-plan'}
                                className="w-full text-zinc-800"
                            >
                                Purchase A Plan
                            </Link>
                        </Button>
                        <Button className="w-full">
                            <Link
                                to={'/institute/member-management'}
                                className="w-full text-zinc-800"
                            >
                                Member Management
                            </Link>
                        </Button>
                        <Button
                            onClick={() => {
                                navigate('/institute/add-new-teacher')
                            }}
                            disabled={!moreTeachers}
                        >
                            Add New Teacher
                        </Button>
                        <Button
                            onClick={() => {
                                navigate('/institute/playlist-page')
                            }}
                            disabled={!basicPlaylist}
                        >
                            Playlist Page
                        </Button>
                        <Button
                            onClick={() => {
                                navigate('/institute/make-playlist')
                            }}
                            disabled={!playlistCreation}
                        >
                            Make New Playlist
                        </Button>

                        <Button
                            onClick={() => {
                                navigate('/institute/make-playlist')
                            }}
                            disabled={!selfAudio}
                        >
                            Upload your own audio!
                        </Button>
                        <Button className="w-full">
                            <Link
                                to={'/institute/add-new-teacher'}
                                className="w-full text-zinc-800"
                            >
                                Reports
                            </Link>
                        </Button>
                        <hr />
                        <Button className="w-full">
                            <Link
                                to={'/institute/settings'}
                                className="w-full text-zinc-800"
                            >
                                Institute Settings
                            </Link>
                        </Button>
                        <Button className="w-full">
                            <Link
                                to={'/institute/user/settings'}
                                className="w-full text-zinc-800"
                            >
                                User Settings
                            </Link>
                        </Button>
                        <Button className="w-full">
                            <Link
                                to={'/institute/view-transactions'}
                                className="w-full text-zinc-800"
                            >
                                View Transactions
                            </Link>
                        </Button>

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

export default memo(InstituteNavbar)
