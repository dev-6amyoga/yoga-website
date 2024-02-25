import {
    Button,
    Card,
    Divider,
    Input,
    Modal,
    Note,
    Select,
    Spacer,
} from '@geist-ui/core'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import StudentPageWrapper from '../../components/Common/StudentPageWrapper'
import {
    USER_PLAN_ACTIVE,
    USER_PLAN_STAGED,
} from '../../enums/user_plan_status'
import useUserStore from '../../store/UserStore'
import { Fetch, FetchRetry } from '../../utils/Fetch'
import getFormData from '../../utils/getFormData'
import RenderRazorpay from './RenderRazorpay'

function FeatureTag({ children }) {
    return (
        <div className="rounded-lg border border-blue-500 p-1 text-blue-500">
            {children}
        </div>
    )
}

function FeatureAvailable({ children }) {
    return (
        <div className="flex flex-row items-center gap-2">
            <span className="text-green-600">✓</span>
            {children}
        </div>
    )
}

function FeatureNotAvailable({ children }) {
    return (
        <div className="flex flex-row items-center gap-2">
            <span className="text-red-600">✗</span>
            {children}
        </div>
    )
}

function PlansCards({ allPlans, subscribePlan, selectedCurrency }) {
    return (
        <div className="grid w-full grid-cols-1 place-content-center place-items-center gap-4 md:grid-cols-3 lg:grid-cols-4">
            {allPlans?.map((plan) => {
                const selectedPricing = plan.pricing.find(
                    (x) => x.currency.short_tag === selectedCurrency
                )
                return (
                    <Card key={plan.plan_id}>
                        <Card.Content>
                            <h3 className="text-center">{plan.name}</h3>
                            <Divider />

                            <Spacer h={1} />

                            <p className="text-center text-2xl font-bold text-blue-500">
                                {selectedCurrency}{' '}
                                {selectedPricing.denomination}
                            </p>

                            <Spacer h={1} />

                            <p className="text-center">
                                <span className="text-sm uppercase text-zinc-500">
                                    Watch Time Limit
                                </span>
                                <br />
                                <span className="text-3xl font-bold text-green-600">
                                    {plan.watch_time_limit / 3600} Hours
                                </span>
                            </p>
                            <Spacer h={1} />

                            <p className="text-center">
                                <span className="text-sm uppercase text-zinc-500">
                                    Validity
                                </span>
                                <br />
                                <span className="text-3xl font-bold text-green-600">
                                    {plan.plan_validity_days} Days
                                </span>
                            </p>

                            <Spacer h={2} />

                            <div>
                                <p className="text-center text-sm uppercase text-zinc-500">
                                    Features
                                </p>
                                <div className="my-4 flex flex-col items-start gap-2">
                                    {plan.has_basic_playlist ? (
                                        <FeatureAvailable>
                                            Play 6AM Yoga playlists
                                        </FeatureAvailable>
                                    ) : (
                                        <FeatureNotAvailable>
                                            Play 6AM Yoga playlists
                                        </FeatureNotAvailable>
                                    )}

                                    {plan.has_playlist_creation ? (
                                        <FeatureAvailable>
                                            Create custom curated playlists
                                        </FeatureAvailable>
                                    ) : (
                                        <FeatureNotAvailable>
                                            Create custom curated playlists
                                        </FeatureNotAvailable>
                                    )}

                                    {/* {plan.has_self_audio_upload ? (
												<FeatureAvailable>
													Upload your own audio
												</FeatureAvailable>
											) : (
												<FeatureNotAvailable>
													Upload your own audio
												</FeatureNotAvailable>
											)} */}
                                </div>
                            </div>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                type="success"
                                width={'100%'}
                                onClick={() => subscribePlan(plan)}
                            >
                                Purchase
                            </Button>
                        </Card.Actions>
                    </Card>
                )
            })}
        </div>
    )
}

function DiscountCouponForm({ handleDiscountCouponFormSubmit }) {
    return (
        <form
            className="flex items-end gap-1"
            onSubmit={handleDiscountCouponFormSubmit}
        >
            <Input width="100%" name="discount_coupon">
                <strong>Discount Coupon</strong>
            </Input>
            <Button htmlType="submit" scale={0.8} width="35%">
                Apply
            </Button>
        </form>
    )
}

// returns price in paise
function calculateTotalPrice(
    price,
    currency,
    applyTax,
    tax,
    discountCoupon,
    multiplier = 100
) {
    let at = currency === 'INR' && applyTax

    let p = price

    if (discountCoupon) {
        p = p * (1 - discountCoupon.discount_percentage / 100)
    }

    if (at) {
        p = p * (1 + tax / 100)
    }

    return Math.ceil(p * multiplier)
}

function StudentPlan() {
    let user = useUserStore((state) => state.user)
    const [allPlans, setAllPlans] = useState([])
    const [showCard, setShowCard] = useState(false)
    const [cardData, setCardData] = useState(null)

    const [price, setPrice] = useState(0)
    const [discountCouponApplied, setDiscountCouponApplied] = useState(false)
    const [discountCoupon, setDiscountCoupon] = useState(null)

    const [displayRazorpay, setDisplayRazorpay] = useState(false)
    const [orderDetails, setOrderDetails] = useState({
        orderId: null,
        currency: null,
        amount: null,
    })

    const [myPlans, setMyPlans] = useState([])
    const [currentStatus, setCurrentStatus] = useState('')
    const [validityFromDate, setValidityFromDate] = useState('')
    // const [selectedValidity, setSelectedValidity] = useState(30);

    const [currencies, setAllCurrencies] = useState([])
    const [selectedCurrency, setSelectedCurrency] = useState('INR')
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(1)

    const [planId, setPlanId] = useState(-1)
    const [toBeRegistered, setToBeRegistered] = useState({})

    const [loading, setLoading] = useState(false)

    const today = new Date()
    const formattedDate = today?.toISOString().split('T')[0]

    useEffect(() => {
        if (user) {
            navigator.geolocation.getCurrentPosition((pos) => {
                console.log(pos)
            })
        }
    }, [user])

    const calculateEndDate = (validityDays) => {
        const endDate = new Date(validityFromDate)
        endDate.setUTCDate(endDate.getUTCDate() + validityDays)
        return endDate.toISOString().split('T')[0]
    }

    const handleDiscountCouponFormSubmit = async (e) => {
        e.preventDefault()

        const formData = getFormData(e)

        const discount_coupon = formData?.discount_coupon

        const error = await validateDiscountCoupon(discount_coupon)

        if (error) {
            setDiscountCouponApplied(false)
            setDiscountCoupon(null)
            toast(error.message, {
                type: 'error',
            })
            return
        }
    }

    const getEndDate = (userPlan) => {
        var updatedValidityString = ''

        if (userPlan.length === 0) {
            setCurrentStatus(USER_PLAN_ACTIVE)
            var today = new Date()
            updatedValidityString = today?.toISOString()
            console.log('New plan starts from date:', updatedValidityString)
        } else if (userPlan.length === 1) {
            setCurrentStatus(USER_PLAN_STAGED)
            var validityDate = new Date(userPlan[0].validity_to)
            validityDate.setDate(validityDate.getDate() + 1)
            updatedValidityString = validityDate?.toISOString()
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
                updatedValidityString = highestValidityDate?.toISOString()
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

    const fetchUserPlans = useCallback(async () => {
        try {
            const response = await Fetch({
                url: 'http://localhost:4000/user-plan/get-user-plan-by-id',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { user_id: user?.user_id },
            })
            const data = response.data

            console.log({ planzzzzzzz: data })

            if (data?.userPlan.length !== 0) {
                const filteredPlans = data.userPlan.filter(
                    (plan) => plan.institute_id === null
                )
                setMyPlans(filteredPlans)
                for (var i = 0; i !== data?.userPlan.length; i++) {
                    if (data?.userPlan[i].validity_to < formattedDate) {
                        if (data?.userPlan[i].current_status !== 'EXPIRED') {
                            const updatedUserPlanData = {
                                ...data?.userPlan[i],
                                current_status: 'EXPIRED',
                            }
                            try {
                                const response = await Fetch({
                                    url: 'http://localhost:4000/user-plan/update-user-plan',
                                    method: 'PUT',
                                    data: updatedUserPlanData,
                                })

                                if (response.status !== 200) {
                                    const errorMessage = response.data
                                    throw new Error(errorMessage.error)
                                }
                            } catch (error) {
                                toast(
                                    error?.message || 'Error updating user plan'
                                )
                            }
                        }
                    }
                }

                // set current plan id if plan is active
                if (data['userPlan'].length > 1) {
                    for (var j = 0; j !== data['userPlan'].length; j++) {
                        if (
                            data['userPlan'][j].current_status === 'ACTIVE' &&
                            data['userPlan'][j].institute_id === null
                        ) {
                            setPlanId(data['userPlan'][j]['plan_id'])
                            break
                        }
                    }
                } else {
                    // set current plan id if plan is active
                    if (
                        data['userPlan'][0].current_status === 'ACTIVE' &&
                        data['userPlan'][0].institute_id === null
                    ) {
                        setPlanId(data['userPlan'][0]['plan_id'])
                    } else {
                        toast(
                            "You don't have a plan yet! Purchase one to continue"
                        )
                    }
                }
            } else {
                toast("You don't have a plan yet! Purchase one to continue")
            }
        } catch (error) {
            console.log(error)
        }
    }, [user, formattedDate])

    // get all student plans
    const fetchPlans = useCallback(async () => {
        try {
            const response = await Fetch({
                url: 'http://localhost:4000/plan/get-all-student-plans',
            })
            console.log(response.data?.plans)
            setAllPlans(response.data?.plans)
        } catch (error) {
            toast('Error fetching plans', { type: 'error' })
            console.log(error)
        }
    }, [])

    const fetchCurrencies = useCallback(async () => {
        try {
            const response = await Fetch({
                url: 'http://localhost:4000/currency/get-all',
            })

            setAllCurrencies(response?.data?.currencies)
            console.log('Fetching currencies')
        } catch (error) {
            toast('Error fetching plans', { type: 'error' })
            console.log(error)
        }
    }, [])

    const validateDiscountCoupon = async (discount_coupon) => {
        if (!discount_coupon) {
            return new Error('Invalid discount coupon')
        }

        // if (discountCoupon && discountCoupon.coupon_name === discount_coupon) {
        // 	toast("Coupon already applied", { type: "error" });
        // 	return null;
        // }
        // return new Error("Invalid discount coupon");
        try {
            const res = await Fetch({
                url: 'http://localhost:4000/discount-coupon/check-plan-mapping',
                method: 'POST',
                data: {
                    coupon_name: discount_coupon,
                    plan_id: cardData.plan_id,
                },
            })

            if (res.status === 200) {
                console.log(res.data)
                setDiscountCoupon(res.data.discount_coupon)
                setDiscountCouponApplied(true)
                return null
            }
            return new Error('Invalid discount coupon')
        } catch (err) {
            console.log(err)
            return new Error('Invalid discount coupon')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            toast('Please login to continue', { type: 'error' })
            return
        }

        if (!cardData) {
            toast('Please select a plan to continue', { type: 'error' })
            return
        }

        if (!selectedCurrency || !selectedCurrencyId) {
            toast('Please select a currency to continue', { type: 'error' })
            return
        }

        let userPlanData = {
            cancellation_date: null,
            auto_renewal_enabled: false,
            user_id: user?.user_id,
            plan_id: cardData?.plan_id,
            discount_coupon_id:
                discountCoupon && discountCouponApplied
                    ? discountCoupon.discount_coupon_id
                    : null,
            referral_code_id: null,
            amount: calculateTotalPrice(
                price,
                selectedCurrency,
                true,
                18,
                discountCoupon
            ),
            currency: selectedCurrency,
            user_type: 'STUDENT',
        }

        if (planId !== -1) {
            if (currentStatus !== USER_PLAN_ACTIVE) {
                toast(
                    'You have an active plan! If you purchase a new plan, it will be staged.'
                )
            }

            // validity will start from the end of the previous plan
            const validityTo = new Date(validityFromDate)
            validityTo.setDate(
                validityTo.getDate() + cardData.plan_validity_days
            )

            const validityToDate = validityTo?.toISOString()
            console.log(validityFromDate, validityToDate)

            userPlanData.purchase_date = formattedDate
            userPlanData.validity_from = validityFromDate
            userPlanData.validity_to = validityToDate
            userPlanData.current_status = currentStatus

            setToBeRegistered(userPlanData)
        } else {
            // TODO : referral code
            userPlanData.purchase_date = formattedDate
            userPlanData.validity_from = formattedDate
            userPlanData.validity_to = calculateEndDate(
                cardData.plan_validity_days
            )
            userPlanData.current_status = USER_PLAN_ACTIVE

            setToBeRegistered(userPlanData)
        }
        try {
            console.log('BUYING : ', userPlanData)
            const response = await Fetch({
                url: 'http://localhost:4000/payment/order',
                method: 'POST',
                data: userPlanData,
            })
            if (response.status === 200) {
                const razorpayOrder = response.data?.order

                if (razorpayOrder && razorpayOrder?.id) {
                    setOrderDetails({
                        orderId: razorpayOrder?.id,
                        currency: razorpayOrder?.currency,
                        amount: razorpayOrder?.amount,
                    })
                    setDisplayRazorpay(true)
                }
            } else {
                toast(response.data?.message)
            }
        } catch (error) {
            console.log(error)
            toast('Error setting up order, try again', { type: 'error' })
        }
    }

    const subscribePlan = async (data) => {
        setShowCard(true)
        setCardData(data)
        setDiscountCouponApplied(false)
        setDiscountCoupon(null)
        const pricing = data.pricing.find(
            (p) => p.currency.short_tag === selectedCurrency
        )
        setPrice(pricing.denomination)
    }

    const registerUserPlan = async (order_id) => {
        toBeRegistered.transaction_order_id = order_id
        toBeRegistered.user_type = 'STUDENT'
        setLoading(true)

        FetchRetry({
            url: 'http://localhost:4000/user-plan/register',
            method: 'POST',
            data: toBeRegistered,
            n: 5,
            retryDelayMs: 2000,
        })
            .then((response) => {
                if (response.status === 200) {
                    toast('Plan subscribed successfully', { type: 'success' })
                    //invoice download here!! order_id, toBeRegistered.user_id
                    FetchRetry({
                        url: 'http://localhost:4000/invoice/student/mail-invoice',
                        method: 'POST',
                        data: JSON.stringify({
                            user_id: toBeRegistered.user_id,
                            transaction_order_id: order_id,
                        }),
                        n: 2,
                        retryDelayMs: 2000,
                    })
                        .then((responseInvoice) => {
                            if (responseInvoice.status === 200) {
                                toast('Invoice mailed successfully', {
                                    type: 'success',
                                })
                            }
                            setShowCard(false)
                            setLoading(false)
                        })
                        .catch((error) => {
                            console.log(error)
                            setShowCard(false)
                            toast(
                                'Error mailing invoice; Download invoice in Transaction History',
                                { type: 'error' }
                            )
                            setLoading(false)
                        })

                    fetchUserPlans()
                } else {
                    toast(response?.data?.message)
                }
            })
            .catch((error) => {
                console.log(error)
                toast(
                    'Error subscribing plan; Incase money has been debited from your account, it will be refunded within 4 to 5 business days! Please try again!',
                    { type: 'error' }
                )
            })
    }

    useEffect(() => {
        if (user) {
            fetchUserPlans()
        }
    }, [user, fetchUserPlans])

    // Staging plan validity from date
    useEffect(() => {
        const fetchData = async () => {
            setValidityFromDate(getEndDate(myPlans))
        }
        if (myPlans) {
            fetchData()
        }
    }, [myPlans])

    // on mount get student plans & currencies
    useEffect(() => {
        fetchPlans()
        fetchCurrencies()
    }, [fetchPlans, fetchCurrencies])

    return (
        <StudentPageWrapper heading="Plans">
            <div className="mx-auto max-w-7xl">
                {planId === -1 ? (
                    <Note type="error" label="Note" filled>
                        Please purchase a subscription to unlock all features!.
                    </Note>
                ) : (
                    <Note
                        type="warning"
                        label="Note"
                        filled
                        className="mx-auto max-w-7xl"
                    >
                        You have an already active plan!
                    </Note>
                )}
            </div>

            <Spacer h={3} />

            <div className="mx-auto max-w-7xl">
                <Note label={false} type="success">
                    <h4>Plan History</h4>
                    <div className="flex flex-col gap-4">
                        {myPlans &&
                            myPlans.map((x) => (
                                <Note
                                    label={false}
                                    filled={
                                        x.current_status === USER_PLAN_ACTIVE
                                    }
                                    type={
                                        x.current_status === USER_PLAN_ACTIVE
                                            ? 'success'
                                            : 'secondary'
                                    }
                                    key={x.id}
                                >
                                    <div className="grid grid-cols-3">
                                        <span>
                                            {x.current_status} : {x.plan.name}
                                        </span>
                                        <span>
                                            VALID FROM :{' '}
                                            {new Date(
                                                x.validity_from
                                            ).toDateString()}
                                        </span>
                                        <span>
                                            VALID TO :{' '}
                                            {new Date(
                                                x.validity_to
                                            ).toDateString()}
                                        </span>
                                    </div>
                                </Note>
                            ))}
                    </div>
                </Note>
            </div>

            <div className="mx-auto mt-10 flex w-full max-w-7xl justify-end">
                <div>
                    <p className="text-right">
                        Select A Currency |{' '}
                        {currencies.length > 0
                            ? currencies[0].short_tag
                            : '???'}{' '}
                        | Selected : {selectedCurrency} | {selectedCurrencyId}
                    </p>
                    <Select
                        className=""
                        placeholder={
                            currencies.length > 0
                                ? currencies[0].short_tag
                                : 'INR'
                        }
                        initialValue={
                            currencies.length > 0
                                ? currencies[0].short_tag
                                : 'INR'
                        }
                        // value={}
                        onChange={(val) => {
                            setSelectedCurrency(val)
                            setSelectedCurrencyId(
                                currencies.find((x) => x.short_tag === val)
                                    ?.currency_id || null
                            )
                        }}
                    >
                        {currencies?.map((cur) => {
                            return (
                                <Select.Option
                                    key={cur.currency_id}
                                    value={cur.short_tag}
                                >
                                    {cur.short_tag}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            </div>

            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center pt-10">
                {/* <PlansTable
					allPlans={allPlans}
					subscribePlan={subscribePlan}
					selectedCurrency={selectedCurrency}
				/> */}

                <PlansCards
                    allPlans={allPlans}
                    subscribePlan={subscribePlan}
                    selectedCurrency={selectedCurrency}
                />

                <Divider />

                <Modal visible={showCard} onClose={() => setShowCard(false)}>
                    <Modal.Content>
                        {cardData ? (
                            <>
                                <h3>{cardData.name}</h3>
                                <Divider />
                                <Spacer />
                                <h5>Features:</h5>
                                <div className="my-2 flex flex-col gap-2">
                                    <h6>
                                        {cardData.has_basic_playlist ? (
                                            <FeatureTag>
                                                Use all yoga playlists curated
                                                by 6AM Yoga
                                            </FeatureTag>
                                        ) : (
                                            ''
                                        )}
                                    </h6>
                                    <h6>
                                        {cardData.has_playlist_creation &&
                                        cardData.playlist_creation_limit ? (
                                            cardData.playlist_creation_limit ===
                                            1000000 ? (
                                                <FeatureTag>
                                                    Create UNLIMITED yoga
                                                    playlists of your own, using
                                                    our asana videos
                                                </FeatureTag>
                                            ) : (
                                                <FeatureTag>
                                                    Create{' '}
                                                    {
                                                        cardData.playlist_creation_limit
                                                    }{' '}
                                                    yoga playlists of your own,
                                                    using our asana videos
                                                </FeatureTag>
                                            )
                                        ) : (
                                            ''
                                        )}
                                    </h6>
                                </div>
                                <Spacer />
                                <Divider />
                                <Spacer />
                                <p>
                                    <strong>Price</strong>
                                    <br />
                                    {cardData ? (
                                        <>
                                            <span>{selectedCurrency}</span>{' '}
                                            <span>{price}</span>{' '}
                                            {discountCouponApplied ? (
                                                <span className="text-green-600">
                                                    -{' '}
                                                    {(price *
                                                        discountCoupon.discount_percentage) /
                                                        100}
                                                </span>
                                            ) : (
                                                <></>
                                            )}{' '}
                                            {selectedCurrency === 'INR' ? (
                                                <span>+ 18% GST</span>
                                            ) : (
                                                <></>
                                            )}{' '}
                                            {selectedCurrency === 'INR' ||
                                            discountCouponApplied ? (
                                                <>
                                                    <span> = </span>{' '}
                                                    <span>
                                                        {calculateTotalPrice(
                                                            price,
                                                            selectedCurrency,
                                                            true,
                                                            18,
                                                            discountCoupon,
                                                            1
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                            <br />
                                            {discountCouponApplied ? (
                                                <span className="rounded-full bg-green-600 px-2 py-1 text-sm text-white">
                                                    Coupon Applied :{' '}
                                                    {discountCoupon.coupon_name}{' '}
                                                    |{' '}
                                                    {
                                                        discountCoupon?.discount_percentage
                                                    }
                                                    {'%'}
                                                    OFF
                                                    <button
                                                        className="mx-2 rounded-full border-0 bg-red-500 px-1"
                                                        onClick={() => {
                                                            setDiscountCouponApplied(
                                                                false
                                                            )
                                                            setDiscountCoupon(
                                                                null
                                                            )
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </span>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </p>
                                <Spacer />
                                <DiscountCouponForm
                                    handleDiscountCouponFormSubmit={
                                        handleDiscountCouponFormSubmit
                                    }
                                />
                                <Spacer />
                                <Divider />
                                <Spacer />
                                <h5>Validity</h5>
                                <Spacer />
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-2">
                                        <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                                            <strong>Plan Start Date</strong>
                                            <span className="text-center">
                                                {new Date(
                                                    validityFromDate
                                                ).toDateString()}
                                            </span>
                                        </p>

                                        <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                                            <strong>Plan End Date</strong>
                                            <span className="text-center">
                                                {new Date(
                                                    calculateEndDate(
                                                        cardData.plan_validity_days
                                                    )
                                                ).toDateString()}
                                            </span>
                                        </p>
                                    </div>

                                    <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                                        <strong>Watch Hours Limit</strong>
                                        <span className="text-center">
                                            {cardData?.watch_time_limit / 3600}{' '}
                                            Hours
                                        </span>
                                    </p>
                                </div>
                                <Spacer />
                                <Divider />
                                <Spacer />
                                <Button
                                    onClick={handleSubmit}
                                    width={'100%'}
                                    type="success"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Purchase
                                </Button>
                            </>
                        ) : (
                            <></>
                        )}
                    </Modal.Content>
                    <Modal.Action onClick={() => setShowCard(false)}>
                        Close
                    </Modal.Action>
                </Modal>
            </div>

            <RenderRazorpay
                userId={user?.user_id}
                keyId={process.env.REACT_APP_RAZORPAY_KEY_ID}
                keySecret={process.env.REACT_APP_RAZORPAY_KEY_SECRET}
                orderId={orderDetails.orderId}
                currency={orderDetails.currency}
                currencyId={selectedCurrencyId}
                amount={orderDetails.amount}
                payment_for={'user_plan'}
                redirectUrl={'/student'}
                onSuccessCallback={registerUserPlan}
                displayRazorpay={displayRazorpay}
                setDisplayRazorpay={setDisplayRazorpay}
            />
        </StudentPageWrapper>
    )
}

export default StudentPlan
