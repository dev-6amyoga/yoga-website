import { Button, Input, Radio, Select, Text } from '@geist-ui/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../Common/AdminNavbar/AdminNavbar';
import PopUpDialog from '../../Common/PopUp/PopUp';
import './RegisterVideoForm.css';

export default function RegisterVideoForm() {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const navigate = useNavigate();
    const [asana_category, setAsanaCategory] = useState('');
    const handler4 = (val) => {
        setAsanaCategory(val);
    };
    const [message1] = useState(
        'Do you want to proceed with the following updates?'
    );
    const [message2, setMessage2] = useState('');
    const handleMessage2Change = (x) => {
        setMessage2(x);
    };
    const [message3, setMessage3] = useState('');
    const handleMessage3Change = (x) => {
        setMessage3(x);
    };
    const [message4, setMessage4] = useState('');
    const handleMessage4Change = (x) => {
        setMessage4(x);
    };
    const [message5, setMessage5] = useState('');
    const handleMessage5Change = (x) => {
        setMessage5(x);
    };
    const [message6, setMessage6] = useState('');
    const handleMessage6Change = (x) => {
        setMessage6(x);
    };
    const [message7, setMessage7] = useState('');
    const handleMessage7Change = (x) => {
        setMessage7(x);
    };

    const [message_lang, setMessage_lang] = useState('');
    const handleMessage_langChange = (x) => {
        setMessage_lang(x);
    };
    let updateNeeded = false;
    let updateNeededLanguage = false;
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const handleOpenPopUp = () => {
        setIsPopUpOpen(true);
    };
    const handleClosePopUp = () => {
        setIsPopUpOpen(false);
    };

    const [isPopUp1Open, setIsPopUp1Open] = useState(false);
    const handleOpenPopUp1 = () => {
        setIsPopUp1Open(true);
    };
    const handleClosePopUp1 = () => {
        setIsPopUp1Open(false);
    };

    const handleYes = () => {
        updateNeeded = true;
        console.log('FROM POP UP ', updateNeeded);
        handleClosePopUp();
    };
    const handleNo = () => {
        updateNeeded = false;
        console.log('FROM POP UP ', updateNeeded);
        handleClosePopUp();
    };

    const handleYesLanguage = async () => {
        updateNeededLanguage = true;
        console.log('FROM POP UP ', updateNeededLanguage);
        handleClosePopUp1();
        const asanaName = document.querySelector('#asana_name').value;
        const description = document.querySelector('#asana_description').value;
        const category = document.querySelector('#asana_category').value;
        const language = selectedLanguage;
        const videoURL = document.querySelector('#asana_url').value;
        const newAsana = {
            asana_name: asanaName,
            asana_desc: description,
            asana_category: category,
            language: language,
            asana_videoID: videoURL,
            asana_withAudio: withAudio,
            asana_audioLag: 0,
            asana_imageID: '',
        };
        console.log(newAsana);
        try {
            const response = await fetch(
                'http://localhost:4000/content/video/addAsana',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newAsana),
                }
            );

            if (response.ok) {
                console.log('New Asana added successfully');
            } else {
                console.error('Failed to add new Asana');
            }
        } catch (error) {
            console.error('Error while making the request:', error);
        }
    };
    const handleNoLanguage = () => {
        updateNeededLanguage = false;
        console.log('FROM POP UP ', updateNeededLanguage);
        handleClosePopUp1();
        handleOpenPopUp();
    };
    const [withAudio, setWithAudio] = useState(true);
    const withAudioHandler = (val) => {
        setWithAudio(val);
    };

    const [data, setData] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/content/video/getAllAsanas')
            .then((response) => response.json())
            .then((asanas) => {
                setData(asanas);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const presentAlready = async (
        asanaName,
        description,
        category,
        language,
        videoURL
    ) => {
        let { uniqueCount, totalCount } = { uniqueCount: 0, totalCount: 0 };
        let { updateDesc, updateCat, updateLink, updateAudio, updateLanguage } =
            {
                updateDesc: false,
                updateCat: false,
                updateLink: false,
                updateAudio: false,
                updateLanguage: false,
            };

        for (var sub_asana in data) {
            totalCount = totalCount + 1;
            if (data[sub_asana]['asana_name'] === asanaName) {
                console.log('found');
                if (
                    data[sub_asana]['asana_desc'] === description &&
                    data[sub_asana]['asana_category'] === category &&
                    data[sub_asana]['language'] === language &&
                    data[sub_asana]['asana_videoID'] === videoURL &&
                    data[sub_asana]['asana_withAudio'] === withAudio
                ) {
                    console.log(
                        'all details are the same! no changes to be made.'
                    );
                } else {
                    if (data[sub_asana]['asana_desc'] !== description) {
                        updateDesc = true;
                    }
                    if (data[sub_asana]['asana_category'] !== category) {
                        updateCat = true;
                    }
                    if (data[sub_asana]['asana_videoID'] !== videoURL) {
                        updateLink = true;
                    }
                    if (data[sub_asana]['asana_withAudio'] !== withAudio) {
                        updateAudio = true;
                    }
                    if (data[sub_asana]['language'] !== language) {
                        updateLanguage = true;
                    }
                }
            } else {
                uniqueCount = uniqueCount + 1;
            }
        }

        if (uniqueCount === totalCount) {
            console.log('totally new asana to be inserted into db');
            const newAsana = {
                id:
                    data.reduce(
                        (max, user) => (user.id > max ? user.id : max),
                        0
                    ) + 1,
                asana_name: asanaName,
                asana_desc: description,
                asana_category: category,
                language: language,
                asana_videoID: videoURL,
                asana_withAudio: withAudio,
                asana_audioLag: 0,
                asana_imageID: '',
            };

            console.log(newAsana);

            try {
                const response = await fetch(
                    'http://localhost:4000/content/video/addAsana',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newAsana),
                    }
                );

                if (response.ok) {
                    console.log('New Asana added successfully');
                } else {
                    console.error('Failed to add new Asana');
                }
            } catch (error) {
                console.error('Error while making the request:', error);
            }
        } else {
            handleMessage2Change(asanaName);
            if (updateDesc === true) {
                handleMessage3Change(
                    'Description from :' +
                        data[sub_asana]['asana_desc'] +
                        ' to : ' +
                        description
                );
            }
            if (updateCat === true) {
                handleMessage4Change(
                    'Asana Category from : ' +
                        data[sub_asana]['asana_category'] +
                        ' to : ' +
                        category
                );
            }
            if (updateLink === true) {
                handleMessage5Change(
                    'Asana URL from : ' +
                        data[sub_asana]['asana_videoID'] +
                        ' to : ' +
                        videoURL
                );
            }
            if (updateAudio === true) {
                handleMessage6Change(
                    'Change Audio Presence from : ' +
                        data[sub_asana]['asana_withAudio'] +
                        ' to : ' +
                        withAudio
                );
            }
            if (updateLanguage === true) {
                handleMessage7Change(
                    'Change Language from : ' +
                        data[sub_asana]['language'] +
                        ' to : ' +
                        language
                );
            }
            if (updateLanguage) {
                handleMessage_langChange(
                    'Do you wish to insert a new entry in the table for the same asana with a different language?'
                );
                handleOpenPopUp1();
            } else {
                handleOpenPopUp();
            }
        }
        navigate('/admin');
    };

    const markerNavigate = () => {
        const asanaName = document.query4Selector('#asana_name').value;
        const description = document.querySelector('#asana_description').value;
        const category = document.querySelector('#asana_category').value;
        const language = document.querySelector('#asana_language').value;
        const videoURL = document.querySelector('#asana_url').value;
        if (
            asanaName === '' ||
            description === '' ||
            category === '' ||
            videoURL === '' ||
            withAudio === '' ||
            language === ''
        ) {
            alert('something is empty');
        } else {
            console.log('marker');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const asanaName = document.querySelector('#asana_name').value;
        const description = document.querySelector('#asana_description').value;
        const category = asana_category;
        const language = selectedLanguage;
        const videoURL = document.querySelector('#asana_url').value;
        presentAlready(asanaName, description, category, language, videoURL);
    };
    const handler = (val) => {
        setSelectedLanguage(val);
    };

    return (
        <div className='video_form min-h-screen'>
            <AdminNavbar />
            <div className='flex items-center justify-center min-h-screen max-w-4xl mx-auto'>
                <form
                    className='flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white'
                    onSubmit={handleSubmit}>
                    <Text h3>Register New Video</Text>
                    <Input width='100%' id='asana_name'>
                        Asana Name
                    </Input>
                    <Input width='100%' id='asana_description'>
                        Description
                    </Input>
                    <Text h6>Category</Text>
                    <Select
                        placeholder='Category'
                        onChange={handler4}
                        id='asana_category'>
                        <Select.Option value='Standing'>Standing</Select.Option>
                        <Select.Option value='Sitting'>Sitting</Select.Option>
                        <Select.Option value='Supine'>Supine</Select.Option>
                        <Select.Option value='Inversion'>
                            Inversion
                        </Select.Option>
                        <Select.Option value='Prone'>Prone</Select.Option>
                        <Select.Option value='Special'>Special</Select.Option>
                    </Select>
                    <Input width='100%' id='asana_url'>
                        Video URL
                    </Input>

                    <Text h6>Language</Text>

                    <Select
                        placeholder='Choose Language'
                        onChange={handler}
                        id='asana_language'>
                        <Select.Option value='English'>English</Select.Option>
                        <Select.Option value='Hindi'>Hindi</Select.Option>
                        <Select.Option value='Malayalam'>
                            Malayalam
                        </Select.Option>
                    </Select>

                    <Text>With Audio?</Text>
                    <Radio.Group
                        id='withAudio'
                        value={withAudio}
                        onChange={withAudioHandler}>
                        <Radio value='true'>Yes</Radio>
                        <Radio value='false'>No</Radio>
                    </Radio.Group>
                    <Button onClick={markerNavigate}>Add Markers</Button>
                    <Button htmlType='submit'>Submit</Button>
                    <PopUpDialog
                        isOpen={isPopUpOpen}
                        onClose={handleClosePopUp}
                        onYes={handleYes}
                        onNo={handleNo}
                        message1={message1}
                        message2={message2}
                        message3={message3}
                        message4={message4}
                        message5={message5}
                        message6={message6}
                        message7={message7}
                    />
                    <PopUpDialog
                        isOpen={isPopUp1Open}
                        onClose={handleClosePopUp1}
                        onYes={handleYesLanguage}
                        onNo={handleNoLanguage}
                        message1={message_lang}
                    />
                </form>
            </div>
        </div>
    );
}
