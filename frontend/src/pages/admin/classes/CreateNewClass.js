"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Fetch } from "../../../utils/Fetch";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateNewClass() {
  const [formData, setFormData] = useState({
    zoom_class_name: "",
    plan_id: [],
    institute_id: "",
    teacher_id: [],
    class_type: "one_time",
    start_time: dayjs(),
    end_time: dayjs(),
    recurring_days: [],
    recurring_start_time: dayjs(),
    recurring_end_time: dayjs(),
  });
  const [plans, setPlans] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const DAYS_OF_WEEK = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  const fetchPlans = () => {
    Fetch({
      url: "/plan/get-all",
      method: "GET",
    })
      .then((res) => {
        console.log(res.data);
        setPlans(res.data.plans);
      })
      .catch((err) => {
        console.log("Something went wrong", { type: "error" });
      });
  };
  const fetchInstitutes = () => {
    Fetch({
      url: "/institute/get-all-institutes",
      method: "GET",
    })
      .then((res) => {
        console.log(res.data);
        setInstitutes(res.data);
      })
      .catch((err) => {
        console.log("Something went wrong", { type: "error" });
      });
  };

  useEffect(() => {
    fetchPlans();
    fetchInstitutes();
  }, []);

  const getTeachersFromInstitute = (institute_id) => {
    Fetch({
      url: "/uipr/get-teachers-in-institute",
      method: "POST",
      data: { institute_id },
    })
      .then((res) => {
        console.log(res.data);
        setTeachers(res.data.users);
      })
      .catch((err) => {
        console.log("Something went wrong", { type: "error" });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "institute_id") {
      getTeachersFromInstitute(value);
      setFormData((prev) => ({ ...prev, institute_id: value }));
    } else if (["plan_id", "teacher_id"].includes(name)) {
      let newValue = value;
      if (Array.isArray(newValue)) {
        newValue = newValue.filter((v) => v !== "__all__");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else if (name === "class_type") {
      setFormData((prev) => ({
        ...prev,
        class_type: value,
        recurring_days: [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRecurringDayChange = (dayValue) => {
    setFormData((prev) => {
      const days = prev.recurring_days.includes(dayValue)
        ? prev.recurring_days.filter((d) => d !== dayValue)
        : [...prev.recurring_days, dayValue];
      return { ...prev, recurring_days: days };
    });
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload =
        formData.class_type === "one_time"
          ? {
              ...formData,
              start_time: formData.start_time.toISOString(),
              end_time: formData.end_time.toISOString(),
            }
          : {
              ...formData,
              recurring_days: formData.recurring_days,
              recurring_start_time:
                formData.recurring_start_time.format("HH:mm"),
              recurring_end_time: formData.recurring_end_time.format("HH:mm"),
            };

      console.log("Payload to submit:", payload);

      Fetch({
        url: "/zoom/api/classes",
        method: "POST",
        data: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.status === 200) {
            console.log("Class created successfully");
            setFormData({
              zoom_class_name: "",
              plan_id: [],
              institute_id: "",
              teacher_id: [],
              start_time: dayjs(),
              end_time: dayjs().add(1, "hour"),
              class_type: "one_time",
              recurring_days: [],
              recurring_time: dayjs(),
            });
            toast.success("Class created successfully");
            navigate("/admin/view-classes");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
      alert("Error creating class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPageWrapper heading={"Create New Class"}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 500,
          mx: "auto",
          mt: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <TextField
          label="Class Name"
          name="zoom_class_name"
          value={formData.zoom_class_name}
          onChange={handleChange}
          required
        />

        <TextField
          select
          label="Institute"
          name="institute_id"
          value={formData.institute_id}
          onChange={handleChange}
          required
        >
          {institutes.map((inst) => (
            <MenuItem key={inst.institute_id} value={inst.institute_id}>
              {inst.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          SelectProps={{
            multiple: true,
            renderValue: (selected) => {
              if (selected.length === teachers.length)
                return "All Teachers Selected";
              if (selected.length === 0) return "None Selected";
              return teachers
                .filter((t) => selected.includes(t.user.user_id))
                .map((t) => t.user.name)
                .join(", ");
            },
          }}
          label="Teacher"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          required
        >
          <MenuItem
            value="__all__"
            onMouseDown={(e) => {
              e.preventDefault();
              if (
                Array.isArray(formData.teacher_id) &&
                formData.teacher_id.length === teachers.length
              ) {
                setFormData((prev) => ({ ...prev, teacher_id: [] }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  teacher_id: teachers.map((t) => t.user.user_id),
                }));
              }
            }}
          >
            <em>
              {Array.isArray(formData.teacher_id) &&
              formData.teacher_id.length === teachers.length
                ? "Deselect All"
                : "Select All"}
            </em>
          </MenuItem>
          {teachers.map((t) => (
            <MenuItem key={t.user.user_id} value={t.user.user_id}>
              {t.user.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          SelectProps={{
            multiple: true,
            renderValue: (selected) => {
              if (selected.length === plans.length) return "All Plans Selected";
              if (selected.length === 0) return "None Selected";
              return plans
                .filter((plan) => selected.includes(plan.plan_id))
                .map((plan) => plan.name)
                .join(", ");
            },
          }}
          label="Plan"
          name="plan_id"
          value={formData.plan_id}
          onChange={handleChange}
          required
        >
          <MenuItem
            value="__all__"
            onMouseDown={(e) => {
              e.preventDefault();
              if (formData.plan_id.length === plans.length) {
                setFormData((prev) => ({ ...prev, plan_id: [] }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  plan_id: plans.map((plan) => plan.plan_id),
                }));
              }
            }}
          >
            <em>
              {formData.plan_id.length === plans.length
                ? "Deselect All"
                : "Select All"}
            </em>
          </MenuItem>
          {plans.map((plan) => (
            <MenuItem key={plan.plan_id} value={plan.plan_id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Class Type Selection */}
        <FormControl>
          <FormLabel>Class Type</FormLabel>
          <RadioGroup
            row
            name="class_type"
            value={formData.class_type}
            onChange={handleChange}
          >
            <FormControlLabel
              value="one_time"
              control={<Radio />}
              label="One Time"
            />
            <FormControlLabel
              value="recurring"
              control={<Radio />}
              label="Recurring"
            />
          </RadioGroup>
        </FormControl>

        {/* Show date/time pickers based on class type */}
        {formData.class_type === "one_time" ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={formData.start_time}
              onChange={(newValue) => handleDateChange("start_time", newValue)}
              renderInput={(params) => <TextField {...params} required />}
            />
            <DateTimePicker
              label="End Time"
              value={formData.end_time}
              onChange={(newValue) => handleDateChange("end_time", newValue)}
              renderInput={(params) => <TextField {...params} required />}
            />
          </LocalizationProvider>
        ) : (
          <>
            <FormControl component="fieldset">
              <FormLabel component="legend">Days of the Week</FormLabel>
              <FormGroup row>
                {DAYS_OF_WEEK.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    control={
                      <Checkbox
                        checked={formData.recurring_days.includes(day.value)}
                        onChange={() => handleRecurringDayChange(day.value)}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Class Start Time"
                value={formData.recurring_start_time}
                onChange={(newValue) =>
                  handleDateChange("recurring_start_time", newValue)
                }
                renderInput={(params) => <TextField {...params} required />}
                ampm={false}
                views={["hours", "minutes"]}
              />
              <DateTimePicker
                label="Class End Time"
                value={formData.recurring_end_time}
                onChange={(newValue) =>
                  handleDateChange("recurring_end_time", newValue)
                }
                renderInput={(params) => <TextField {...params} required />}
                ampm={false}
                views={["hours", "minutes"]}
              />
            </LocalizationProvider>
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
        </Button>
      </Box>
    </AdminPageWrapper>
  );
}
