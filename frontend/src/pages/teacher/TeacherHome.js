import { Button } from '@geist-ui/core';
import React from 'react';

export default function TeacherHome() {
    function sayHello() {
        console.log('Hello to you!');
    }
    return (
        <div>
            <h1>THIS IS THE TEACHER LOGIN</h1>
            <Button onClick={sayHello}>Click me to say hello</Button>
        </div>
    );
}
