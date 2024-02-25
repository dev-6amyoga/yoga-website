import { Card } from '@geist-ui/core'
import { useState } from 'react'
import { toast } from 'react-toastify'
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper'
import CreateInstituteForm from '../../../components/Institute/CreateInstitute/CreateInstituteForm'
import { ROLE_INSTITUTE_OWNER } from '../../../enums/roles'
import { Fetch } from '../../../utils/Fetch'
import { withAuth } from '../../../utils/withAuth'

function CreateInstitute() {
    const [billingAddressSame, setBillingAddressSame] = useState(true)
    const [instituteInfo, setInstituteInfo] = useState({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = (info) => {
        try {
            if (info?.pincode) info.pincode = parseInt(info?.pincode)
        } catch (err) {
            toast('Pincode must be a number')
            return
        }
        const addressCombination = `${info?.address1}, ${info?.address2}, ${info?.city} - ${instituteInfo?.pincode}, ${instituteInfo?.state}, ${instituteInfo?.country}`

        const institute = {
            name: info?.institute_name,
            address1: info?.address1,
            address2: info?.address2,
            pincode: info?.pincode,
            billing_address: billingAddressSame
                ? addressCombination
                : info?.billing_address,
            email: info?.contact_email,
            phone: info?.phone,
            gstin: info?.gstin,
        }
        console.log(institute)
        setLoading(true)
        Fetch({
            url: 'http://localhost:4000/institute/register',
            method: 'POST',
            data: institute,
            token: true,
        })
            .then((res) => {
                if (res && res.status === 200) {
                    toast('Institute added successfully', {
                        type: 'success',
                    })
                }
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                toast('Error adding institute', {
                    type: 'error',
                })
                setLoading(false)
            })
    }

    return (
        <InstitutePageWrapper heading="Create Institute">
            <Card>
                <CreateInstituteForm
                    billingAddressSame={billingAddressSame}
                    setBillingAddressSame={setBillingAddressSame}
                    setInstituteInfo={setInstituteInfo}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    setLoading={setLoading}
                />
            </Card>
        </InstitutePageWrapper>
    )
}

export default withAuth(CreateInstitute, ROLE_INSTITUTE_OWNER)
