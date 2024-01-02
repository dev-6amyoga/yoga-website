import { Button } from '@geist-ui/core';
import { Link } from 'react-router-dom';
import StudentPageWrapper from '../../components/Common/StudentPageWrapper';
import useUserStore from '../../store/UserStore';

export default function StudentProfile() {
    const user = useUserStore((state) => state.user);
    return (
        <StudentPageWrapper heading='Profile'>
            <div className='border rounded-lg p-4 max-w-5xl mx-auto'>
                <p>{user?.name}</p>
                <Link to='/student/settings'>
                    <Button>Settings</Button>
                </Link>
            </div>
        </StudentPageWrapper>
    );
}
