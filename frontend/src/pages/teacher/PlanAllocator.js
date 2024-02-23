import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Fetch } from '../../utils/Fetch'

export const usePlanAllocator = (teacher_id, institute_id) => {
    const [instituteOwnerId, setInstituteOwnerId] = useState(0)
    const [userPlan, setUserPlan] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            console.log('hi!')
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
                                    setUserPlan(res.data.userPlan[0])
                                    const toBeChecked = {
                                        transaction_order_id:
                                            res.data.userPlan[0]
                                                .transaction_order_id,
                                        current_status: 'ACTIVE',
                                        user_type: 'TEACHER',
                                        user_id: teacher_id,
                                        plan_id: res.data.userPlan[0].plan_id,
                                        institute_id: institute_id,
                                    }
                                    console.log(toBeChecked)
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
    }, [institute_id])

    return { instituteOwnerId, userPlan }
}
