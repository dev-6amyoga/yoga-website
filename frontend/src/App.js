import { Button } from '@geist-ui/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>This is temporary</h1>
            <Button
                onClick={() => {
                    navigate('/admin');
                }}>
                Redirect to Admin Page
            </Button>
            <Button
                onClick={() => {
                    navigate('/student');
                }}>
                Redirect to Student Page
            </Button>
            <Button
                onClick={() => {
                    navigate('/teacher');
                }}>
                Redirect to Teacher Page
            </Button>
        </div>
    );
}

export default App;
