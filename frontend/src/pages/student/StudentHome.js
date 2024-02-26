import StudentNavbar from '../../components/Common/StudentNavbar/StudentNavbar'
// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from 'react'
import Playlist from '../../components/Sidebar/Playlist'
import VideoPlayerWrapper from '../../components/StackVideo/VideoPlayerWrapper'
import useUserStore from '../../store/UserStore'
import './MovingText.css'

function StudentHome() {
    const [position, setPosition] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition((prevPosition) => (prevPosition + 1) % 100)
        }, 100)

        return () => clearInterval(interval)
    }, [])

    let user = useUserStore((state) => state.user)
    const [userPlan, setUserPlan] = useState({})
    const [planId, setPlanId] = useState(0)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/user-plan/get-user-plan-by-id',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ user_id: user.user_id }),
                    }
                )
                const data = await response.json()
                setUserPlan(data['userPlan'])
                setPlanId(data['userPlan']['plan_id'])
            } catch (error) {
                console.log(error)
            }
        }
        if (user) {
            fetchData()
        }
    }, [user])

    return (
        <div className="flex-col justify-center">
            <StudentNavbar />
            {/* <div>Welcome {user.name}!</div> */}
            <br />
            <br />
            <div className="moving-text-bar">
                <div
                    className="moving-text"
                    style={{ transform: `translateX(${position}%)` }}
                >
                    This video is for personal self-practice only and not to be
                    used by teachers for taking classes. Any unauthorized use
                    may kindly be notified to : +91-9980802351
                </div>
            </div>

            <div className="mx-auto max-w-7xl">
                <div className="my-10">
                    <VideoPlayerWrapper />
                    <hr />
                    <Playlist />
                </div>
            </div>
        </div>
    )
}

export default StudentHome
