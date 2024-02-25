import {
    Button,
    ButtonGroup,
    Divider,
    Grid,
    Input,
    Modal,
    Table,
    Text,
} from '@geist-ui/core'
import { ArrowRight, UserCheck, UserPlus } from '@geist-ui/icons'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AdminPageWrapper from '../../../components/Common/AdminPageWrapper'
import { ROLE_ROOT } from '../../../enums/roles'
import {
    USER_PLAN_ACTIVE,
    USER_PLAN_STAGED,
} from '../../../enums/user_plan_status'
import { Fetch } from '../../../utils/Fetch'
import getFormData from '../../../utils/getFormData'
import { withAuth } from '../../../utils/withAuth'

function LogPayment() {
    const [userStatus, setUserStatus] = useState('EXISTING')

    const [user_id, setUserId] = useState(0)
    const [plan_id, setPlanId] = useState(0)
    const [instituteId, setInstituteId] = useState(0)

    const [amount, setAmount] = useState(0)

    const [validityFromDate, setValidityFromDate] = useState('')
    const [validityToDate, setValidityToDate] = useState(null)

    const [students, setStudents] = useState([])
    const [institutes, setInstitutes] = useState([])

    const [currentStatus, setCurrentStatus] = useState('')

    const [userPlans, setUserPlans] = useState([])
    const [studentPlans, setStudentPlans] = useState([])
    const [institutePlans, setInstitutePlans] = useState([])

    const [planConfirmed, setPlanConfirmed] = useState(false)
    const [planAddition, setPlanAddition] = useState(false)

    const [modalData, setModalData] = useState({})
    const [paymentFor, setPaymentFor] = useState('')

    const [studentData, setStudentData] = useState([])
    const [instituteData, setInstituteData] = useState([])
    const [userType, setUserType] = useState('')

    const [nextClicked, setNextClicked] = useState(false)
    const [showUserSelection, setShowUserSelection] = useState(false)

    const calculateEndDate = (startDate, validityDays) => {
        console.log(startDate, validityDays)
        const endDate = new Date(startDate)
        endDate.setUTCDate(endDate.getUTCDate() + validityDays)
        console.log(endDate.toISOString().split('T')[0])
        setValidityToDate(endDate.toISOString().split('T')[0])
    }

    useEffect(() => {
        // Log the updated validityToDate whenever it changes
        console.log('Validity To:', validityToDate)
    }, [validityToDate])
    const handleSetPaymentFor = (val) => {
        setPaymentFor(val)
    }
    const formDate = (timestampString) => {
        const d = new Date(timestampString)

        return `${d.getUTCFullYear()}-${
            d.getUTCMonth() >= 9
                ? d.getUTCMonth() + 1
                : '0' + (d.getUTCMonth() + 1)
        }-${d.getUTCDate().toString().padStart(2, '0')}T${d
            .getUTCHours()
            .toString()
            .padStart(2, '0')}:${d
            .getUTCMinutes()
            .toString()
            .padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}`
    }
    const appendToUsers = (newUserData) => {
        setStudentData((prevUsers) => [...prevUsers, newUserData])
    }
    const appendToInstitutes = (newUserData) => {
        setInstituteData((prevUsers) => [...prevUsers, newUserData])
    }
    useEffect(() => {
        const fetchData = async () => {
            Fetch({
                url: 'http://localhost:4000/plan-pricing/get-inr-for-plan',
                method: 'POST',
                data: {
                    plan_id: plan_id,
                },
            }).then((res) => {
                if (res && res.status === 200) {
                    setAmount(res.data.plan_pricing[0].denomination)
                } else {
                    toast('Error; retry', {
                        type: 'error',
                    })
                }
            })
        }
        if (plan_id != 0) {
            fetchData()
        }
    }, [plan_id])
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
                        body: JSON.stringify({ user_id: user_id }),
                    }
                )
                const data = await response.data
                if (data['userPlan']) {
                    console.log(data['userPlan'])
                    setUserPlans(data['userPlan'])
                } else {
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (user_id !== 0) {
            fetchData()
        }
    }, [user_id])
    useEffect(() => {
        setStudentData([])
        if (students.length > 0) {
            for (var i = 0; i !== students.length; i++) {
                Fetch({
                    url: 'http://localhost:4000/user/get-by-id',
                    method: 'POST',
                    data: {
                        user_id: students[i].user_id,
                    },
                }).then((res) => {
                    if (res && res.status === 200) {
                        appendToUsers(res.data.user)
                    } else {
                        toast('Error updating profile; retry', {
                            type: 'error',
                        })
                    }
                })
            }
        }
    }, [students])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Fetch({
                    url: 'http://localhost:4000/user/get-all-students',
                    method: 'GET',
                })
                const data = response.data
                setStudents(data.users)
                setStudentData([])
            } catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, [])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Fetch({
                    url: 'http://localhost:4000/user/get-all-institutes',
                    method: 'GET',
                })
                const data = response.data
                setInstitutes(data.users)
                setInstituteData([])
            } catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, [])
    useEffect(() => {
        if (institutes.length > 0) {
            setInstituteData([])
            for (var i = 0; i != institutes.length; i++) {
                let uId = institutes[i].user_id
                Fetch({
                    url: 'http://localhost:4000/institute/get-by-instituteid',
                    method: 'POST',
                    data: {
                        institute_id: institutes[i].institute_id,
                    },
                }).then((res) => {
                    if (res && res.status === 200) {
                        res.data.user_id = uId
                        console.log(res.data)
                        appendToInstitutes(res.data)
                    } else {
                        toast('Error updating profile; retry', {
                            type: 'error',
                        })
                    }
                })
            }
        }
    }, [institutes])

    const fetchPlans = useCallback(async () => {
        console.log('in fetch plans for student')
        try {
            const response = await Fetch({
                url: 'http://localhost:4000/plan/get-all-student-plans',
            })
            console.log(response?.data?.plans)
            setStudentPlans(response?.data?.plans)
        } catch (error) {
            toast('Error fetching plans', { type: 'error' })
            console.log(error)
        }
    }, [])
    useEffect(() => {
        fetchPlans()
    }, [fetchPlans])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'http://localhost:4000/plan/get-all-institute-plans'
                )
                setInstitutePlans(response?.data?.plans)
            } catch (error) {
                console.log(error)
            }
        }
        fetchData()
    }, [])
    const renderAction = (value, rowData, index) => {
        const handleLog = async () => {
            try {
                setUserId(rowData.user_id)
                console.log(rowData.institute_id)
                setInstituteId(rowData.institute_id)
                // setStudentModalState(true);
                // setPlanConfirmed(true);
                setPlanAddition(true)
                setModalData(rowData)
            } catch (error) {
                console.error(error)
            }
        }

        return (
            <Grid.Container gap={0.1}>
                <Grid>
                    <Button
                        type="error"
                        auto
                        scale={1 / 3}
                        font="12px"
                        onClick={handleLog}
                    >
                        Add
                    </Button>
                </Grid>
            </Grid.Container>
        )
    }
    useEffect(() => {
        const fetchData = async () => {
            setValidityFromDate(getEndDate(userPlans))
        }
        if (userPlans) {
            fetchData()
        }
    }, [userPlans])
    const getEndDate = (userPlan) => {
        var updatedValidityString = ''
        if (userPlan.length === 0) {
            setCurrentStatus(USER_PLAN_ACTIVE)
            var today = new Date()
            updatedValidityString = today.toISOString()
            console.log('New plan starts from date:', updatedValidityString)
        } else if (userPlan.length === 1) {
            setCurrentStatus(USER_PLAN_STAGED)
            var validityDate = new Date(userPlan[0].validity_to)
            validityDate.setDate(validityDate.getDate() + 1)
            updatedValidityString = validityDate.toISOString()
            console.log('New plan validity from date:', updatedValidityString)
        } else {
            var highestValidityDate = null
            setCurrentStatus(USER_PLAN_STAGED)
            for (var i = 0; i !== userPlan.length; i++) {
                var validityDate = new Date(userPlan[i].validity_to)
                if (
                    highestValidityDate === null ||
                    validityDate > highestValidityDate
                ) {
                    highestValidityDate = validityDate
                }
            }
            if (highestValidityDate !== null) {
                highestValidityDate.setDate(highestValidityDate.getDate() + 1)
                updatedValidityString = highestValidityDate.toISOString()
                console.log(
                    'New plan validity from date:',
                    updatedValidityString
                )
            } else {
                console.log('No valid validity_to dates found.')
            }
        }
        return updatedValidityString
    }
    const renderAction1 = (value, rowData, index) => {
        const handleAdd = async () => {
            setPlanConfirmed(true)
            setPlanId(rowData.plan_id)
            // const user_id1 = user_id;
            // console.log("Allot ", plan_id, "to ", user_id1);
            // console.log(userPlans);
        }

        return (
            <Grid.Container gap={0.1}>
                <Grid>
                    <Button
                        type="error"
                        auto
                        scale={1 / 3}
                        font="12px"
                        onClick={handleAdd}
                    >
                        Assign
                    </Button>
                </Grid>
            </Grid.Container>
        )
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = getFormData(e)
        const formDataCopy = { ...formData }
        delete formData.validity_from
        delete formDataCopy.amount
        delete formDataCopy.payment_date
        delete formDataCopy.payment_method
        formData.amount = formData.amount * 100
        const additionalData1 = {
            payment_for: 'New Plan Manual',
            payment_status: 'succeeded',
            transaction_order_id: 'MANUAL',
            transaction_payment_id: 'MANUAL',
            transaction_signature: 'MANUAL',
            user_id: user_id,
        }
        const additionalData2 = {
            purchase_date: formData.payment_date,
            validity_to: validityToDate,
            is_active: true,
            discount_coupon_id: 0,
            referral_code_id: 0,
            user_id: user_id,
            plan_id: plan_id,
            current_status: currentStatus,
            transaction_order_id: 'MANUAL',
            user_type: userType === 'STUDENT' ? 'STUDENT' : 'INSTITUTE',
            institute_id: instituteId && instituteId !== 0 ? instituteId : 0,
        }
        // current_status;
        const transactionData = {
            ...formData,
            ...additionalData1,
        }
        const userPlanData = {
            ...formDataCopy,
            ...additionalData2,
        }
        console.log(transactionData)
        console.log(userPlanData)
        try {
            const response = await fetch(
                'http://localhost:4000/transaction/add-transaction',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(transactionData),
                }
            )
            if (response.ok) {
                toast('Succesfully logged!')
                try {
                    const response = await fetch(
                        'http://localhost:4000/user-plan/register',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(userPlanData),
                        }
                    )
                    if (response.ok) {
                        toast('Plan subscribed successfully', {
                            type: 'success',
                        })
                        setPlanAddition(false)
                        setPlanConfirmed(false)
                    } else {
                        const errorData = await response.json()
                        toast(errorData.error)
                    }
                } catch (error) {
                    console.log(error)
                    toast('Error subscribing plan', { type: 'error' })
                }
            } else {
                console.error('Failed to make the POST request')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }
    return (
        <AdminPageWrapper heading="Log a payment">
            <div className="">
                <div className="p-8 lg:p-20">
                    <div className="mx-auto max-w-xl rounded-lg border bg-white p-4">
                        <h3 className="text-center text-2xl">Log a Payment</h3>
                        <hr />
                        <div className="mt-4 flex w-full flex-col items-center gap-1">
                            <div className="mt-4 flex w-full flex-row items-center gap-1">
                                <div
                                    className={`flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-2 ${
                                        userStatus === 'EXISTING'
                                            ? 'border-blue-500'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        setUserStatus('EXISTING')
                                        setUserType('')
                                        setNextClicked(false)
                                        setShowUserSelection(true)
                                    }}
                                >
                                    <UserCheck className="h-6 w-6" />
                                    Existing User
                                </div>
                                <div
                                    className={`flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-2 ${
                                        userStatus === 'NEW'
                                            ? 'border-blue-500'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        setUserStatus('NEW')
                                        setUserType('')
                                        setNextClicked(false)
                                        setShowUserSelection(true)
                                    }}
                                >
                                    {' '}
                                    <UserPlus className="h-6 w-6" />
                                    New User
                                </div>
                            </div>
                            <br />
                            {showUserSelection && (
                                <div className="flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-2">
                                    <h5>Choose User Type</h5>
                                    <Button
                                        onClick={() => {
                                            setUserType('STUDENT')
                                            setNextClicked(false)
                                        }}
                                    >
                                        Student
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setUserType('INSTITUTE_OWNER')
                                            setNextClicked(false)
                                        }}
                                    >
                                        Institute
                                    </Button>
                                    <Button
                                        type="warning"
                                        width={'100%'}
                                        onClick={() => {
                                            if (userType === '') {
                                                toast('Choose a user type!')
                                            } else {
                                                setNextClicked(true)
                                            }
                                        }}
                                        iconRight={<ArrowRight />}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                            <br />
                            {userStatus === 'EXISTING' &&
                                userType !== '' &&
                                nextClicked && (
                                    <div>
                                        {userType === 'STUDENT' && (
                                            <div className="flex flex-1 flex-col items-center gap-2 px-4 py-2">
                                                <h5>Existing Students</h5>
                                                <Table
                                                    width={35}
                                                    data={studentData}
                                                    className="bg-white"
                                                >
                                                    <Table.Column
                                                        label="Student Name"
                                                        width={150}
                                                        prop="name"
                                                    />
                                                    <Table.Column
                                                        label="Email ID"
                                                        width={150}
                                                        prop="email"
                                                    />
                                                    <Table.Column
                                                        label="Phone"
                                                        width={150}
                                                        prop="phone"
                                                    />
                                                    <Table.Column
                                                        prop="operation"
                                                        label="SELECT"
                                                        width={150}
                                                        render={renderAction}
                                                    />
                                                </Table>
                                            </div>
                                        )}
                                        {userType === 'INSTITUTE_OWNER' && (
                                            <div>
                                                <h5>Existing Institutes</h5>
                                                <Table
                                                    width={35}
                                                    data={instituteData}
                                                    className="bg-white"
                                                >
                                                    <Table.Column
                                                        label="Institute Name"
                                                        width={150}
                                                        prop="name"
                                                    />
                                                    <Table.Column
                                                        label="Email ID"
                                                        width={150}
                                                        prop="email"
                                                    />
                                                    <Table.Column
                                                        label="Phone"
                                                        width={150}
                                                        prop="phone"
                                                    />
                                                    <Table.Column
                                                        prop="operation"
                                                        label="SELECT"
                                                        width={150}
                                                        render={renderAction}
                                                    />
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            {userStatus === 'NEW' &&
                                userType !== '' &&
                                nextClicked && <h5>New User</h5>}
                        </div>
                        <Modal
                            width="42rem"
                            visible={planAddition}
                            onClose={() => setPlanAddition(false)}
                        >
                            <Modal.Title>Assign a plan</Modal.Title>
                            <br />
                            <br />
                            {userType === 'STUDENT' && (
                                <div>
                                    <Table
                                        width={40}
                                        data={studentPlans}
                                        className="bg-white "
                                    >
                                        <Table.Column
                                            prop="name"
                                            label="Plan Name"
                                        />
                                        <Table.Column
                                            prop="has_playlist_creation"
                                            label="Make Custom Playlists"
                                            render={(data) => {
                                                return data ? 'Yes' : 'No'
                                            }}
                                        />
                                        <Table.Column
                                            prop="playlist_creation_limit"
                                            label="Number of Custom Playlists"
                                            render={(data) => {
                                                return data ? data : '0'
                                            }}
                                        />
                                        <Table.Column
                                            prop="operation"
                                            label="Purchase"
                                            width={150}
                                            render={renderAction1}
                                        />
                                    </Table>
                                </div>
                            )}
                            {userType === 'INSTITUTE_OWNER' && (
                                <div>
                                    <Table
                                        width={40}
                                        data={institutePlans}
                                        className="bg-white "
                                    >
                                        <Table.Column
                                            prop="name"
                                            label="Plan Name"
                                        />
                                        <Table.Column
                                            prop="has_playlist_creation"
                                            label="Make Custom Playlists"
                                            render={(data) => {
                                                return data ? 'Yes' : 'No'
                                            }}
                                        />
                                        <Table.Column
                                            prop="playlist_creation_limit"
                                            label="Number of Custom Playlists"
                                            render={(data) => {
                                                return data ? data : '0'
                                            }}
                                        />
                                        <Table.Column
                                            prop="operation"
                                            label="Purchase"
                                            width={150}
                                            render={renderAction1}
                                        />
                                    </Table>
                                </div>
                            )}
                            <Modal.Action
                                passive
                                onClick={() => setPlanAddition(false)}
                            >
                                Cancel
                            </Modal.Action>
                        </Modal>
                        <Modal
                            width="38rem"
                            visible={planConfirmed}
                            onClose={() => {
                                setPlanConfirmed(false)
                            }}
                        >
                            <Modal.Title>Plan Details</Modal.Title>
                            <Modal.Content>
                                <form
                                    className="flex flex-1 flex-col items-center gap-2 px-4 py-2"
                                    onSubmit={handleSubmit}
                                >
                                    <h6>Validity From</h6>
                                    <Input
                                        name="validity_from"
                                        htmlType="datetime-local"
                                        initialValue={formDate(
                                            validityFromDate
                                        )}
                                    ></Input>
                                    <ButtonGroup type="warning" ghost>
                                        <Button
                                            value={30}
                                            onClick={() =>
                                                calculateEndDate(
                                                    validityFromDate,
                                                    30
                                                )
                                            }
                                        >
                                            30 days
                                        </Button>
                                        <Button
                                            value={60}
                                            onClick={() =>
                                                calculateEndDate(
                                                    validityFromDate,
                                                    60
                                                )
                                            }
                                        >
                                            60 days
                                        </Button>
                                        <Button
                                            value={90}
                                            onClick={() =>
                                                calculateEndDate(
                                                    validityFromDate,
                                                    90
                                                )
                                            }
                                        >
                                            90 days
                                        </Button>
                                        <Button
                                            value={30}
                                            onClick={() =>
                                                calculateEndDate(
                                                    validityFromDate,
                                                    180
                                                )
                                            }
                                        >
                                            180 days
                                        </Button>
                                        <Button
                                            value={30}
                                            onClick={() =>
                                                calculateEndDate(
                                                    validityFromDate,
                                                    365
                                                )
                                            }
                                        >
                                            365 days
                                        </Button>
                                    </ButtonGroup>
                                    <h6>Validity To</h6>
                                    <Text>{validityToDate}</Text>
                                    <h6>Payment Method</h6>
                                    <Input
                                        width="100%"
                                        name="payment_method"
                                    ></Input>
                                    <br />
                                    <Divider />
                                    <h5>Price : INR {amount}</h5>
                                    <h5>
                                        <Text type="secondary">
                                            SGST (9%) : INR {amount * 0.09}
                                        </Text>
                                    </h5>
                                    <h5>
                                        <Text type="secondary">
                                            CGST (9%) : INR {amount * 0.09}
                                        </Text>
                                    </h5>
                                    <h4>
                                        <Text type="success">
                                            Net Amount : INR{' '}
                                            {amount +
                                                amount * 0.09 +
                                                amount * 0.09}
                                        </Text>
                                    </h4>
                                    <br />
                                    <h6>Amount Paid (in INR)</h6>
                                    <Input width="100%" name="amount"></Input>
                                    <h6>Payment Date</h6>
                                    <Input
                                        name="payment_date"
                                        htmlType="datetime-local"
                                    ></Input>
                                    <br />

                                    <br />
                                    <Button htmlType="submit">Register</Button>
                                </form>
                            </Modal.Content>
                            <Modal.Action
                                passive
                                onClick={() => setPlanConfirmed(false)}
                            >
                                Cancel
                            </Modal.Action>
                        </Modal>
                        <br />
                    </div>
                </div>
            </div>
        </AdminPageWrapper>
    )
}

export default withAuth(LogPayment, ROLE_ROOT)
