import { Divider, Modal, Tooltip } from '@geist-ui/core'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useShallow } from 'zustand/react/shallow'
import usePlaylistStore from '../../store/PlaylistStore'
import useUserStore from '../../store/UserStore'
import { Fetch } from '../../utils/Fetch'
import PlaylistItem from './PlaylistItem'

function Playlist() {
    const [modalState, setModalState] = useState(false)
    const [asana_details, setAsanaDetails] = useState([])
    const appendToAsanaDetails = (newItem) => {
        setAsanaDetails((prevAsanaDetails) => [...prevAsanaDetails, newItem])
    }
    const [modalData, setModalData] = useState({
        playlist_id: 0,
        playlist_name: '',
        applicable_teachers: [],
        user_id: 0,
        institute_id: 0,
        asana_ids: [],
    })
    const [isInstitute, setIsInstitute] = useState(false)
    const [isTeacher, setIsTeacher] = useState(false)
    const [isPersonal, setIsPersonal] = useState(true)
    const [institutePlaylists, setInstitutePlaylists] = useState([])
    const [teacherPlaylists, setTeacherPlaylists] = useState([])
    const [madeForTeacher, setMadeForTeacher] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [userPlaylists, setUserPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [user, institutes, currentInstituteId] = useUserStore(
        useShallow((state) => [
            state.user,
            state.institutes,
            state.currentInstituteId,
        ])
    )
    const user_id = user?.user_id
    const [currentInstitute, setCurrentInstitute] = useState(null)
    const [allAsanas, setAllAsanas] = useState([])
    const [allTransitions, setAllTransitions] = useState([])
    const [schedulePresent, setSchedulePresent] = useState(false)
    const [schedules, setSchedules] = useState([])
    const [nextMonthSchedulePresent, setNextMonthSchedulePresent] =
        useState(false)
    const [nextMonthSchedules, setNextMonthSchedules] = useState([])
    const queue = usePlaylistStore((state) => state.queue)
    const archive = usePlaylistStore((state) => state.archive)
    const addToQueue = usePlaylistStore((state) => state.addToQueue)
    const clearQueue = usePlaylistStore((state) => state.clearQueue)

    useEffect(() => {
        console.log(currentInstitute, 'IS THE INSTITUTE')
        console.log(user_id, 'IS THE USER')
        console.log(user, 'IS THE USER')
        if (currentInstituteId) {
            Fetch({
                url: 'http://localhost:4000/schedule/getSchedulesById',
                method: 'POST',
                data: {
                    user_id: user_id,
                    user_type: 'INSTITUTE',
                    institute_id: currentInstituteId,
                },
            }).then((res) => {
                if (res.status === 200) {
                    setSchedules(res.data)
                    if (res.data.length > 0) {
                        setSchedulePresent(true)
                        Fetch({
                            url: 'http://localhost:4000/schedule/getNextMonthSchedulesById',
                            method: 'POST',
                            data: {
                                user_id: user_id,
                                user_type: 'INSTITUTE',
                                institute_id: currentInstituteId,
                            },
                        }).then((res) => {
                            if (res.status === 200) {
                                console.log(res.data, 'IS RES!!')
                                setNextMonthSchedules(res.data)
                                if (res.data.length > 0) {
                                    setNextMonthSchedulePresent(true)
                                }
                            }
                        })
                    }
                }
            })

            //after fetching, check if user_id is a teacher, and if so, fetch their schedules
        }
        //user_id is a student, fetch their schedules
    }, [currentInstitute, user_id])

    useState(() => {
        if (currentInstituteId) {
            setCurrentInstitute(
                institutes?.find(
                    (institute) => institute.institute_id === currentInstituteId
                )
            )
        }
    }, [currentInstituteId, institutes])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/content/video/getAllAsanas'
                )
                const data = await response.json()
                setAllAsanas(data)
            } catch (error) {
                toast('Error fetching asanas')
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/content/video/getAllTransitions'
                )
                const data = await response.json()
                setAllTransitions(data)
            } catch (error) {
                toast(error)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setAsanaDetails([])
            for (var i = 0; i < modalData.asana_ids.length; i++) {
                try {
                    const response = await fetch(
                        'http://localhost:4000/content/get-asana-by-id',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                asana_id: modalData.asana_ids[i],
                            }),
                        }
                    )
                    if (response.ok) {
                        const data = await response.json()
                        appendToAsanaDetails(data)
                    }
                } catch (err) {
                    console.log(err)
                }
            }
        }
        if (modalData.asana_ids.length > 0) {
            fetchData()
        }
    }, [modalData.asana_ids])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/institute-playlist/get-playlists',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            institute_id: currentInstituteId,
                        }),
                    }
                )
                if (response.ok) {
                    const data = await response.json()
                    setInstitutePlaylists(data)
                } else {
                }
            } catch (err) {
                console.log(err)
            }
        }
        if (isInstitute && currentInstituteId) {
            fetchData()
        }
    }, [isInstitute, currentInstituteId])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/teacher-playlist/get-playlists',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: user?.user_id,
                            institute_id: currentInstituteId,
                        }),
                    }
                )
                if (response.ok) {
                    const data = await response.json()
                    setTeacherPlaylists(data)
                    try {
                        const response = await fetch(
                            'http://localhost:4000/institute-playlist/get-playlists',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    institute_id: currentInstituteId,
                                }),
                            }
                        )
                        if (response.ok) {
                            const data = await response.json()
                            const filteredMadeForTeacher = data.filter(
                                (item) => {
                                    const applicableTeachers = Array.isArray(
                                        item.applicable_teachers
                                    )
                                        ? item.applicable_teachers
                                        : []
                                    const userId = user && user.user_id
                                    return (
                                        userId &&
                                        applicableTeachers.includes(
                                            Number(userId)
                                        )
                                    )
                                }
                            )
                            if (madeForTeacher.length > 0) {
                                setMadeForTeacher([])
                            }
                            setMadeForTeacher((prev) => [
                                ...prev,
                                ...filteredMadeForTeacher,
                            ])
                        }
                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    console.log('No playlists made!')
                }
            } catch (err) {
                console.log(err)
            }
        }
        if (isTeacher && currentInstituteId && user) {
            fetchData()
        }
    }, [isTeacher, currentInstituteId, user])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/user-institute/get-role-by-user-institute-id',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: user?.user_id,
                            institute_id: currentInstituteId,
                        }),
                    }
                )
                const data = await response.json()
                if (data?.user_institute?.length === 1) {
                    if (data.user_institute[0].role.name === 'TEACHER') {
                        setIsTeacher(true)
                        setIsPersonal(false)
                    } else if (
                        data.user_institute[0].role.name === 'INSTITUTE_OWNER'
                    ) {
                        setIsInstitute(true)
                        setIsPersonal(false)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (currentInstituteId && user) {
            fetchData()
        }
    }, [currentInstituteId, user])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/content/playlists/getAllPlaylists'
                )
                const data = await response.json()
                setPlaylists(data)
                setLoading(false)
            } catch (error) {
                setLoading(false)
                console.log(error)
            }
        }
        fetchData()
    }, [user_id, currentInstituteId])

    const getAllAsanas = async (asana_ids) => {
        if (asana_ids.length === 0) {
            return []
        }
        const allAsanasData = asana_ids.map((asana_id) => {
            if (Number(asana_id)) {
                const asanaObject = allAsanas.find(
                    (asana) => asana.id === asana_id
                )
                return asanaObject || null
            } else {
                const transitionObject = allTransitions.find(
                    (transition) => transition.transition_id === asana_id
                )
                return transitionObject || null
            }
        })
        return allAsanasData
    }

    const handleAddToQueue = (asana_ids) => {
        getAllAsanas(asana_ids)
            .then((asanas) => {
                addToQueue(asanas.filter((v) => v !== null))
            })
            .catch((err) => console.log(err))
    }

    const showDetails = (x) => {
        console.log('in show details')
        setModalData(x)
        setModalState(true)
    }
    const closeModal = () => {
        setModalState(false)
    }

    return (
        <div className="rounded-xl">
            <Modal visible={modalState} onClose={closeModal}>
                <Modal.Title>Playlist Details</Modal.Title>
                <Modal.Subtitle>
                    {modalData.playlist_name || modalData.schedule_name}
                </Modal.Subtitle>
                <h5>
                    Playlist Duration : {(modalData.duration / 60).toFixed(2)}{' '}
                    minutes
                </h5>
                {asana_details?.map((asanaDetail) => (
                    <div>
                        <p>
                            {asanaDetail?.asana_name}
                            {asanaDetail?.language
                                ? ` - ${asanaDetail.language}`
                                : ''}
                        </p>
                    </div>
                ))}

                <Modal.Action passive onClick={closeModal}>
                    Close
                </Modal.Action>
            </Modal>
            {isInstitute && (
                <div>
                    <h4>Institutes Playlists</h4>
                    <p className="pb-4 text-sm">
                        Choose from institutes' playlists to practice.
                    </p>
                    <div className="flex flex-row gap-2">
                        {institutePlaylists.map((playlist) => (
                            <PlaylistItem
                                key={playlist.playlist_name}
                                type={
                                    queue
                                        ? queue.includes(playlist)
                                            ? 'success'
                                            : 'secondary'
                                        : 'secondary'
                                }
                                add={() => handleAddToQueue(playlist.asana_ids)}
                                deets={() => showDetails(playlist)}
                                playlist={playlist}
                                isFuture={false}
                            />
                        ))}
                    </div>
                    <Divider />
                </div>
            )}
            {schedulePresent && (
                <div>
                    <h4>Schedules</h4>
                    <p className="pb-4 text-sm">
                        Choose from applicable schedules to practice.
                    </p>
                    <div className="flex flex-row gap-2">
                        {schedules.map((schedule) => (
                            <PlaylistItem
                                key={schedule.schedule_name}
                                type={
                                    queue
                                        ? queue.includes(schedule)
                                            ? 'success'
                                            : 'secondary'
                                        : 'secondary'
                                }
                                add={() => handleAddToQueue(schedule.asana_ids)}
                                deets={() => showDetails(schedule)}
                                playlist={schedule}
                                isFuture={false}
                            />
                        ))}
                    </div>
                    <Divider />
                    <h4>Next Months Schedules</h4>
                    <p className="pb-4 text-sm">View Next Months Schedules.</p>
                    <div className="flex flex-row gap-2">
                        {nextMonthSchedules.map((schedule) => (
                            <PlaylistItem
                                key={schedule.schedule_name}
                                type={
                                    queue
                                        ? queue.includes(schedule)
                                            ? 'success'
                                            : 'secondary'
                                        : 'secondary'
                                }
                                add={() => handleAddToQueue(schedule.asana_ids)}
                                deets={() => showDetails(schedule)}
                                playlist={schedule}
                                isFuture={true}
                            />
                        ))}
                    </div>
                    <Divider />
                </div>
            )}
            {isTeacher && (
                <div>
                    <h4>Teacher's Playlists</h4>
                    <p className="pb-4 text-sm">
                        Choose from your playlists to practice.
                    </p>
                    <div className="flex flex-row gap-2">
                        {teacherPlaylists.map((playlist) => (
                            <Tooltip
                                text={'Made for ' + playlist.student_name}
                                type="dark"
                            >
                                <PlaylistItem
                                    key={playlist.playlist_name}
                                    type={
                                        queue
                                            ? queue.includes(playlist)
                                                ? 'success'
                                                : 'secondary'
                                            : 'secondary'
                                    }
                                    add={() =>
                                        handleAddToQueue(playlist.asana_ids)
                                    }
                                    deets={() => showDetails(playlist)}
                                    playlist={playlist}
                                    isFuture={false}
                                />
                            </Tooltip>
                        ))}

                        <br />
                    </div>
                    <Divider />
                </div>
            )}
            {isTeacher && (
                <div>
                    <h4>Made for you : </h4>
                    <div className="flex flex-row gap-2">
                        {madeForTeacher.map((playlist) => (
                            <PlaylistItem
                                key={playlist.playlist_name}
                                type={
                                    queue
                                        ? queue.includes(playlist)
                                            ? 'success'
                                            : 'secondary'
                                        : 'secondary'
                                }
                                add={() =>
                                    handleAddToQueue(playlist?.asana_ids)
                                }
                                deets={() => showDetails(playlist)}
                                playlist={playlist}
                                isFuture={false}
                            />
                        ))}
                    </div>
                    <Divider />
                </div>
            )}
            {isPersonal && (
                <div>
                    <h4>My Playlists</h4>
                    <p className="pb-4 text-sm">
                        Choose from your playlists to practice.
                    </p>
                    <div className="flex flex-row gap-2">
                        {userPlaylists.map((playlist) => (
                            <PlaylistItem
                                key={playlist.playlist_name}
                                type={
                                    queue
                                        ? queue.includes(playlist)
                                            ? 'success'
                                            : 'secondary'
                                        : 'secondary'
                                }
                                add={() => handleAddToQueue(playlist.asana_ids)}
                                deets={() => showDetails(playlist)}
                                playlist={playlist}
                                isFuture={false}
                            />
                        ))}
                    </div>
                    <Divider />
                </div>
            )}

            <h4>6AM Yoga Playlists</h4>
            <p className="pb-4 text-sm">
                Choose from a variety of playlists to practice.
            </p>
            <div className="grid grid-cols-3 gap-2">
                {playlists.map((playlist) => (
                    <PlaylistItem
                        key={playlist.playlist_name}
                        type={
                            queue
                                ? queue.includes(playlist)
                                    ? 'success'
                                    : 'secondary'
                                : 'secondary'
                        }
                        add={() => handleAddToQueue(playlist.asana_ids)}
                        deets={() => showDetails(playlist)}
                        playlist={playlist}
                        isFuture={false}
                    />
                ))}
            </div>
            <Divider />
        </div>
    )
}

export default Playlist
