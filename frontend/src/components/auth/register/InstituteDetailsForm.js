import { AutoComplete, Button, Input } from "@geist-ui/core";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";

export default function InstituteDetailsForm({
  setInstituteInfo,
  billingAddressSame,
  setBillingAddressSame,
  setBlockStep,
  setLoading,
}) {
  // TODO : Error with clearing the state and city when country/state is changed
  const [countries, setCountries] = useState([]);
  const [countriesSearch, setCountriesSearch] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(""); // {label: 'India', value: 'India'}

  const [states, setStates] = useState([]);
  const [statesSearch, setStatesSearch] = useState([]);
  const [selectedState, setSelectedState] = useState(""); // {label: 'Karnataka', value: 'Karnataka'}

  const [cities, setCities] = useState([]);
  const [citiesSearch, setCitiesSearch] = useState([]); // {label: 'Bengaluru', value: 'Bengaluru'}
  const [selectedCity, setSelectedCity] = useState("");

  const [infoSaved, setInfoSaved] = useState(false);

  useEffect(() => {
    setBlockStep(!infoSaved);
  }, [infoSaved, setBlockStep]);

  useEffect(() => {
    setInfoSaved(false);
  }, []);

  const handleCountrySearch = useCallback(
    (value) => {
      if (value !== "") {
        setCountriesSearch(() =>
          countries
            .filter((country) =>
              country?.name?.toLowerCase().includes(value?.toLowerCase())
            )
            ?.map((c) => ({ label: c.name, value: c.name }))
        );
      } else {
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
      if (value !== "") {
        setStatesSearch(() =>
          states
            .filter((s) =>
              s?.name?.toLowerCase().includes(value?.toLowerCase())
            )
            ?.map((s) => ({ label: s.name, value: s.name }))
        );
      } else {
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
      if (value !== "") {
        setCitiesSearch(() =>
          cities
            .filter((c) =>
              c?.name?.toLowerCase().includes(value?.toLowerCase())
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
      url: `${getFrontendDomain()}/countries.json`,
      method: "GET",
    })
      .then((res) => {
        setCountries(res.data);
      })
      .catch((err) => {
        toast("Error fetching countries: ", {
          type: "error",
        });
      });
  }, []);

  const getStates = useCallback((country) => {
    Fetch({
      url: `${getFrontendDomain()}/countries/${country}.json`,
      method: "GET",
    })
      .then((res) => {
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
      if (selectedState && !states.find((s) => s.name === selectedState)) {
        toast("Please select a valid state", {
          type: "error",
        });
        return;
      }

      if (selectedCity && !cities.find((c) => c.name === selectedCity)) {
        toast("Please select a valid city", {
          type: "error",
        });
        return;
      }

      if (selectedState && !selectedCountry) {
        toast("Please select a country", {
          type: "error",
        });
        return;
      }

      if (selectedCity && !selectedState) {
        toast("Please select a state", {
          type: "error",
        });
        return;
      }

      const formData = getFormData(e);

      const [is_email_valid, email_error] = validateEmail(
        formData?.contact_email
      );

      if (!is_email_valid) {
        toast(email_error.message, { type: "warning" });
        return;
      }

      const inst = {
        ...formData,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
      };

      setInstituteInfo(inst);

      setInfoSaved(true);

      toast("Progress saved!", { type: "success" });
      // console.log(inst);
    },
    [
      setInstituteInfo,
      cities,
      selectedCity,
      selectedState,
      states,
      selectedCountry,
      setInfoSaved,
    ]
  );

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  useEffect(() => {
    if (selectedCountry && countries.find((c) => c.name === selectedCountry)) {
      setSelectedState("");
      setSelectedCity("");
      getStates(selectedCountry);
    }
  }, [selectedCountry, getStates, countries]);

  useEffect(() => {
    if (selectedState) {
      setSelectedCity("");
      getCities(selectedState);
    }
  }, [selectedState, getCities]);

  useEffect(() => {
    handleCountrySearch("");
  }, [countries, handleCountrySearch]);

  useEffect(() => {
    handleStateSearch("");
  }, [states, handleStateSearch]);

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={validateAndSubmit}>
      <h4 className="text-center">Institute Details</h4>
      <div className="flex flex-col gap-4 w-full">
        <Input width="100%" name="institute_name" required>
          Institute Name
        </Input>
        <Input
          width="100%"
          name="address1"
          placeholder="No.XXX, XZY Road, XX Cross"
          required
        >
          Address 1
        </Input>
        <Input width="100%" name="address2" placeholder="XX Block, XXX Layout">
          Address 2
        </Input>
        <div className="with-label">
          <label className="text-sm">Country</label>
          <AutoComplete
            width="100%"
            name="country"
            disableFreeSolo
            options={countriesSearch}
            onSearch={handleCountrySearch}
            value={selectedCountry}
            onChange={(val) => setSelectedCountry(val)}
            clearable
            required
          ></AutoComplete>
        </div>
        <div className="with-label">
          <label className="text-sm">State</label>
          <AutoComplete
            width="100%"
            name="state"
            disableFreeSolo
            options={statesSearch}
            value={states.length > 0 ? selectedState : "---"}
            disabled={states.length === 0}
            onSearch={handleStateSearch}
            onChange={(val) => setSelectedState(val)}
            clearable
            required
          ></AutoComplete>
        </div>
        <div className="with-label">
          <label className="text-sm">City</label>
          <AutoComplete
            width="100%"
            name="city"
            disableFreeSolo
            options={citiesSearch}
            value={selectedCity}
            disabled={states.length === 0 || cities.length === 0}
            onSearch={handleCitySearch}
            onChange={(val) => setSelectedCity(val)}
            clearable
            required
          ></AutoComplete>
        </div>
        <Input width="100%" name="pincode" required>
          Pincode
        </Input>
        <div className="flex gap-1 items-end">
          <Input
            width={"100%"}
            name="billing_address"
            required
            placeholder={
              !billingAddressSame ? "Enter billing address" : "Same as above"
            }
            disabled={billingAddressSame}
          >
            Billing Address
          </Input>
          <Button
            scale={0.8}
            className="flex-1"
            type={billingAddressSame ? "secondary-light" : "success"}
            onClick={() => setBillingAddressSame((p) => !p)}
          >
            {billingAddressSame ? "Change" : "Same as above"}
          </Button>
        </div>
        <Input width="100%" name="contact_email" required>
          Contact Email
        </Input>
        <Input width="100%" name="gstin" placeholder="" required>
          GST Number
        </Input>
      </div>
      <Button htmlType="submit" type="success">
        Save Changes
      </Button>
    </form>
  );
}
