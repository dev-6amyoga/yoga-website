import StudentNavbar from './StudentNavbar/StudentNavbar';

export default function StudentPageWrapper({ heading, children }) {
    return (
        <>
            <StudentNavbar />
            <div className='max-w-7xl mx-auto'>
                {heading ? (
                    <h1 className='pt-4 font-bold text-center'>{heading}</h1>
                ) : (
                    <></>
                )}
                <div className='mt-6'>{children}</div>
            </div>
        </>
    );
}
