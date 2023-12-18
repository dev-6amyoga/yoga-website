import { AutoComplete, Button, Input, Spacer } from '@geist-ui/core';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Fetch } from '../../utils/Fetch';

export default function InstituteRegisterForm({
    handleSubmit,
    billingAddressSame,
    setBillingAddressSame,
}) {
    // TODO : Error with clearing the state and city when country/state is changed
    const [countries, setCountries] = useState([]);
    const [countriesSearch, setCountriesSearch] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(''); // {label: 'India', value: 'India'}

    const [states, setStates] = useState([]);
    const [statesSearch, setStatesSearch] = useState([]);
    const [selectedState, setSelectedState] = useState(''); // {label: 'Karnataka', value: 'Karnataka'}

    const [cities, setCities] = useState([]);
    const [citiesSearch, setCitiesSearch] = useState([]); // {label: 'Bengaluru', value: 'Bengaluru'}
    const [selectedCity, setSelectedCity] = useState('');

    const handleCountrySearch = useCallback(
        (value) => {
            if (value !== '') {
                setCountriesSearch(() =>
                    countries
                        .filter((country) =>
                            country?.name
                                ?.toLowerCase()
                                .includes(value?.toLowerCase())
                        )
                        ?.map((c) => ({ label: c.name, value: c.name }))
                );
            } else {
                console.log('countries search init');
                setCountriesSearch(() =>
                    countries?.map((country) => ({
                        label: country.name,
                        value: country.name,
                    }))
                );
            }
        },
        [countries]
    );

    const handleStateSearch = useCallback(
        (value) => {
            if (value !== '') {
                setStatesSearch(() =>
                    states
                        .filter((s) =>
                            s?.name
                                ?.toLowerCase()
                                .includes(value?.toLowerCase())
                        )
                        ?.map((s) => ({ label: s.name, value: s.name }))
                );
            } else {
                console.log('states search init');
                setStatesSearch(() =>
                    states?.map((s) => ({
                        label: s.name,
                        value: s.name,
                    }))
                );
            }
        },
        [states]
    );

    const handleCitySearch = useCallback(
        (value) => {
            if (value !== '') {
                setCitiesSearch(() =>
                    cities
                        .filter((c) =>
                            c?.name
                                ?.toLowerCase()
                                .includes(value?.toLowerCase())
                        )
                        ?.map((c) => ({ label: c.name, value: c.name }))
                );
            } else {
                setCitiesSearch(() =>
                    cities?.map((c) => ({
                        label: c.name,
                        value: c.name,
                    }))
                );
            }
        },
        [cities]
    );

    const getCountries = useCallback(() => {
        Fetch({
            url: 'http://localhost:3000/countries.json',
            method: 'GET',
        })
            .then((res) => {
                setCountries(res.data);
            })
            .catch((err) => {
                toast('Error fetching countries: ', {
                    type: 'error',
                });
            });
    }, []);

    const getStates = useCallback((country) => {
        Fetch({
            url: `http://localhost:3000/countries/${country}.json`,
            method: 'GET',
        })
            .then((res) => {
                console.log('got states');
                setStates(res.data.states || []);
            })
            .catch((err) => {});
    }, []);

    const getCities = useCallback(
        (state) => {
            if (state) {
                const st = states.filter((s) => s.name === state)[0];
                const cs = st ? st.cities : [];

                setCities(() => {
                    return cs;
                });

                setCitiesSearch(() => {
                    return cs?.map((c) => ({ label: c.name, value: c.name }));
                });
            }
        },
        [states]
    );

    const validateAndSubmit = useCallback(
        (e) => {
            e.preventDefault();

            console.log(selectedCountry, selectedState, selectedCity);

            if (
                selectedState &&
                !states.find((s) => s.name === selectedState)
            ) {
                toast('Please select a valid state', {
                    type: 'error',
                });
                return;
            }

            if (selectedCity && !cities.find((c) => c.name === selectedCity)) {
                toast('Please select a valid city', {
                    type: 'error',
                });
                return;
            }

            if (selectedState && !selectedCountry) {
                toast('Please select a country', {
                    type: 'error',
                });
                return;
            }

            if (selectedCity && !selectedState) {
                toast('Please select a state', {
                    type: 'error',
                });
                return;
            }

            handleSubmit(e);
        },
        [
            handleSubmit,
            cities,
            selectedCity,
            selectedState,
            states,
            selectedCountry,
        ]
    );

    useEffect(() => {
        getCountries();
    }, [getCountries]);

    useEffect(() => {
        if (
            selectedCountry &&
            countries.find((c) => c.name === selectedCountry)
        ) {
            setSelectedState('');
            setSelectedCity('');
            console.log('cleared state and city');
            getStates(selectedCountry);
        }
    }, [selectedCountry, getStates]);

    useEffect(() => {
        if (selectedState) {
            setSelectedCity('');
            console.log('cleared city');
            getCities(selectedState);
        }
    }, [selectedState, getCities]);

    useEffect(() => {
        handleCountrySearch('');
    }, [countries, handleCountrySearch]);

    useEffect(() => {
        handleStateSearch('');
    }, [states, handleStateSearch]);

    return (
        <form
            className='flex flex-col gap-4 w-full'
            onSubmit={validateAndSubmit}>
            <Spacer y={4} />
            <p>Institute Owner Details</p>
            <div className='flex flex-col gap-4 w-full'>
                <Input width='100%' name='name' placeholder='John Doe' required>
                    Name
                </Input>
                <Input
                    width='100%'
                    name='user_email'
                    placeholder='abc@email.com'
                    required>
                    Email ID
                </Input>
                <Input
                    width='100%'
                    name='phone'
                    placeholder='9999999999'
                    required>
                    Phone Number
                </Input>
                <Input
                    width='100%'
                    name='username'
                    placeholder='johnDoe123'
                    required>
                    Username
                </Input>
                <Input.Password width='100%' name='password' required>
                    Password
                </Input.Password>
                <Input.Password width='100%' name='confirm_password' required>
                    Confirm Password
                </Input.Password>
            </div>

            <Spacer y={4} />

            <p>Institute Details</p>
            <div className='flex flex-col gap-4 w-full'>
                <Input width='100%' name='institute_name' required>
                    Institute Name
                </Input>
                <Input
                    width='100%'
                    name='address1'
                    placeholder='No.XXX, XZY Road, XX Cross'
                    required>
                    Address 1
                </Input>
                <Input
                    width='100%'
                    name='address2'
                    placeholder='XX Block, XXX Layout'>
                    Address 2
                </Input>
                <div className='with-label'>
                    <label className='text-sm'>Country</label>
                    <AutoComplete
                        width='100%'
                        name='country'
                        disableFreeSolo
                        options={countriesSearch}
                        onSearch={handleCountrySearch}
                        value={selectedCountry}
                        onChange={(val) => setSelectedCountry(val)}
                        clearable
                        required></AutoComplete>
                </div>
                <div className='with-label'>
                    <label className='text-sm'>State</label>
                    <AutoComplete
                        width='100%'
                        name='state'
                        disableFreeSolo
                        options={statesSearch}
                        value={states.length > 0 ? selectedState : '---'}
                        disabled={states.length === 0}
                        onSearch={handleStateSearch}
                        onChange={(val) => setSelectedState(val)}
                        clearable
                        required></AutoComplete>
                </div>
                <div className='with-label'>
                    <label className='text-sm'>City</label>
                    <AutoComplete
                        width='100%'
                        name='city'
                        disableFreeSolo
                        options={citiesSearch}
                        value={selectedCity}
                        disabled={states.length === 0 || cities.length === 0}
                        onSearch={handleCitySearch}
                        clearable
                        required></AutoComplete>
                </div>
                <Input width='100%' name='pincode' required>
                    Pincode
                </Input>
                <div className='flex gap-1 items-end'>
                    <Input
                        width={'100%'}
                        name='billing_address'
                        required
                        placeholder={
                            !billingAddressSame
                                ? 'Enter billing address'
                                : 'Same as above'
                        }
                        disabled={billingAddressSame}>
                        Billing Address
                    </Input>
                    <Button
                        scale={0.8}
                        className='flex-1'
                        type={
                            billingAddressSame ? 'secondary-light' : 'success'
                        }
                        onClick={() => setBillingAddressSame((p) => !p)}>
                        {billingAddressSame ? 'Change' : 'Same as above'}
                    </Button>
                </div>
                <Input width='100%' name='contact_email' required>
                    Contact Email
                </Input>
                <Input
                    width='100%'
                    name='contact_phone'
                    placeholder='9999999999'
                    required>
                    Contact Phone Number
                </Input>
            </div>
            <Button htmlType='submit'>Register</Button>
        </form>
    );
}
