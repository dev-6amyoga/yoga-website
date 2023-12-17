import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import InstitutePageWrapper from '../../components/Common/InstitutePageWrapper';
import useUserStore from '../../store/UserStore';

export default function InstituteHome() {
    const [user, institutes, currentInstituteId] = useUserStore(
        useShallow((state) => [
            state.user,
            state.institutes,
            state.currentInstituteId,
        ])
    );
    const [currentInstitute, setCurrentInstitute] = useState(null);

    useState(() => {
        if (currentInstituteId) {
            setCurrentInstitute(
                institutes?.find(
                    (institute) => institute.institute_id === currentInstituteId
                )
            );
        }
    }, [currentInstituteId, institutes]);

    return (
        <InstitutePageWrapper heading='Institute Dashboard'>
            <h2 className=''>Welcome to 6AM Yoga</h2>

            <div className='my-10 p-4 rounded-lg border'>
                <h3>Institute Info</h3>
                <hr />
                <p>
                    <strong>Owner Name: </strong> {user?.name}
                </p>
                <p>
                    <strong>Institute Name: </strong>
                    {currentInstitute?.name}
                </p>
                <p>
                    <strong>Institute Email: </strong> {currentInstitute?.email}
                </p>
                <p>
                    <strong>Institute Phone: </strong> {currentInstitute?.phone}
                </p>
                <p>
                    <strong>Institute Address: </strong>
                    {currentInstitute?.address1 +
                        ' ' +
                        currentInstitute?.address2}
                </p>
                <p>
                    <strong>Institute Billing Address: </strong>
                    {currentInstitute?.billing_address}
                </p>
            </div>
        </InstitutePageWrapper>
    );
}
