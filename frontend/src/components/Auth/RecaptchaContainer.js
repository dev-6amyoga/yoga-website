import { memo, useState } from 'react'

export default memo(function RecaptchaContainer({ containerRef }) {
    const [nonce, setNonce] = useState(crypto.randomUUID())
    return <div id={`recaptcha-container-${nonce}`} ref={containerRef}></div>
})
