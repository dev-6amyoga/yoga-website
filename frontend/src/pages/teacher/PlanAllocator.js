import { toast } from 'react-toastify'
import { Fetch } from '../../utils/Fetch'
import { useState } from 'react'
export const PlanAllocator = (teacher_id, institute_id) => {
    //get institute owner
    //get user plan which is active
    const [instituteOwnerId, setInstituteOwnerId] = useState(0)
    const [planId, setPlanId] = useState(0)
    const fetchData = async () => {
        if (institute_id > 0) {
            try {
                Fetch({
                    url: 'http://localhost:4000/user/get-by-instituteid',
                    method: 'POST',
                    data: {
                        institute_id: institute_id,
                    },
                }).then((res) => {
                    if (res.status === 200) {
                        setInstituteOwnerId(res.data.users[0].user_id)
                        toast('User Plan Fetched')
                        Fetch({
                            url: 'http://localhost:4000/user-plan/get-active-user-plan-by-id',
                            method: 'POST',
                            data: {
                                user_id: res.data.users[0].user_id,
                            },
                        }).then((res) => {
                            if (res.status === 200) {
                                setPlanId(res.data.userPlan[0].plan_id)
                                console.log(res.data.userPlan[0])
                                toast('User Plan Fetched')
                            }
                        })
                    }
                })
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
    }
    fetchData()
}
