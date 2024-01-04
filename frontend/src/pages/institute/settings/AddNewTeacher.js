import { Button, Input } from '@geist-ui/core';
import { toast } from 'react-toastify';
import InstitutePageWrapper from '../../../components/Common/InstitutePageWrapper';
import useUserStore from '../../../store/UserStore';
import { Fetch } from '../../../utils/Fetch';
import { validateEmail, validatePhone } from '../../../utils/formValidation';
import getFormData from '../../../utils/getFormData';

export default function AddNewTeacher() {
    const user = useUserStore((state) => state.user);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = getFormData(e);

        if (!formData) return;

        if (!formData.name) {
            toast('Teacher name is required', { type: 'error' });
            return;
        }

        const [validEmail, emailError] = validateEmail(formData.email);

        if (!validEmail) {
            toast(emailError.message, { type: 'error' });
            return;
        }

        const [validPhone, phoneError] = validatePhone(formData.phone);

        if (!validPhone) {
            toast(phoneError.message, { type: 'error' });
            return;
        }

        formData.invite_type = 'TEACHER';
        formData.user_id = user.user_id;

        // console.log(formData);

        Fetch({
            url: 'http://localhost:4000/invite/create',
            method: 'POST',
            data: formData,
        })
            .then((res) => {
                toast('Teacher added successfully', { type: 'success' });
                e.target.reset();
            })
            .catch((err) => {
                toast(`Error : ${err?.response?.data?.message}`, {
                    type: 'error',
                });
            });
    };

    return (
        <InstitutePageWrapper heading='Teacher Invite Management'>
            <div className='card-base'>
                <h3>Add a teacher</h3>
                <form
                    className='flex flex-col gap-2 my-8'
                    onSubmit={handleSubmit}>
                    <Input
                        width='100%'
                        placeholder='John Doe'
                        name='name'
                        required>
                        Teacher Name
                    </Input>
                    <Input
                        width='100%'
                        placeholder='teacher@gmail.com'
                        name='email'
                        required>
                        Teacher Email ID
                    </Input>
                    <Input
                        width='100%'
                        placeholder='9876543210'
                        name='phone'
                        required>
                        Teacher Phone Number
                    </Input>
                    <div className='flex flex-row gap-2 w-full'>
                        <Button
                            className='flex-1'
                            type='secondary'
                            htmlType='submit'>
                            Add
                        </Button>
                    </div>
                </form>
            </div>
        </InstitutePageWrapper>
    );
}
