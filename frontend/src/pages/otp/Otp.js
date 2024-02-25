import { memo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import LoginPhone from '../../components/auth/LoginPhone'

export default memo(function Otp({ setLoading, onSuccessCallback }) {
    return (
        <ErrorBoundary onError={(err) => console.log(err)}>
            <div className="w-full">
                <LoginPhone
                    onSuccessCallback={onSuccessCallback}
                    setLoading={setLoading}
                />
            </div>
        </ErrorBoundary>
    )
})
