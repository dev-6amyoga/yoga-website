import { toast } from 'react-toastify'
import { Fetch } from '../../utils/Fetch'
export const PlanAllocator = (teacher_id, institute_id) => {
    //get institute owner
    //get user plan which is active
    const fetchData = async () => {
        if (institute_id > 0) {
            try {
                const response = await Fetch({
                    url: 'http://localhost:4000/user-plan/get-user-institute-plan-by-id',
                    method: 'POST',
                    data: {
                        institute_id: institute_id,
                    },
                })
                if (response.status === 200) {
                    toast('User Plan Fetched')
                } else {
                    toast('Failed')
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
    }
    fetchData()
    //get plan details from user plan
}
