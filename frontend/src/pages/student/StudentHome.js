import React from 'react';

import PageWrapper from '../../components/Common/PageWrapper';
import Playlist from '../../components/Sidebar/Playlist';
import VideoPlayerWrapper from '../../components/Video/VideoPlayerWrapper';
import VideoQueue from '../../components/Video/VideoQueue';

function StudentHome() {
    return (
        <PageWrapper>
            <div className='max-w-7xl mx-auto'>
                <div className='grid grid-cols-7 gap-4 my-10'>
                    <VideoPlayerWrapper />
                    <VideoQueue />
                </div>
                <hr />
                <div className='my-10'>
                    <Playlist />
                </div>
            </div>
        </PageWrapper>
    );
}

export default StudentHome;
