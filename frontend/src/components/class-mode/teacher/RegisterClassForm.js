import { Divider, Modal, Text } from "@geist-ui/core";

import {
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { Button } from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClassAPI } from "../../../api/class.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";

import {
  CLASS_RECURRANCE_TYPE_DAILY,
  CLASS_RECURRANCE_TYPE_FORTNIGHTLY,
  CLASS_RECURRANCE_TYPE_MONTHLY,
  CLASS_RECURRANCE_TYPE_WEEKLY,
  CLASS_TYPE_ONETIME,
  CLASS_TYPE_RECURRING,
} from "../../../enums/class_types";

export default function RegisterNewClass({ visible = false, setVisible }) {
  const [days, setDays] = useState(null);
  const navigate = useNavigate();
  const [duration, setDuration] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [classType, setClassType] = useState(CLASS_TYPE_ONETIME);
  const [recurranceType, setRecurranceType] = useState(
    CLASS_RECURRANCE_TYPE_DAILY
  );
  const [weeklyRecurranceDays, setWeeklyRecurranceDays] = useState([]);
  const [allowedStudents, setAllowedStudents] = useState([]);

  const [openAllowedStudentsList, setOpenAllowedStudentsList] = useState(false);

  const user = useUserStore((state) => state.user);

  const handler = (val) => {
    setDays(val);
  };
  const handleEndTimeChange = (e) => {
    console.log(e.target.value);
    setEndTime(e.target.value);
  };
  const handleStartTimeChange = (e) => {
    console.log(e.target.value);
    setStartTime(e.target.value);
  };

  useEffect(() => {
    if (!startTime || !endTime) {
      setDuration(0 + " hour, " + 0 + " minutes, " + 0 + " seconds");
    }

    if (startTime?.length === 5 && endTime?.length === 5) {
      // HH:MM
      const [hour1, minute1] = startTime.split(":");
      const [hour2, minute2] = endTime.split(":");

      // Convert hours and minutes to numbers
      const timeInMinutes1 = parseInt(hour1, 10) * 100 + parseInt(minute1, 10);
      const timeInMinutes2 = parseInt(hour2, 10) * 100 + parseInt(minute2, 10);

      // Calculate the difference in minutes
      let difference = 2400 - (timeInMinutes1 - timeInMinutes2);

      console.log("before: ", difference);
      // Handle negative difference (time2 after time1 next day)
      if (difference > 2400) {
        difference -= 2400;
      }
      console.log("after : ", difference);

      // Convert difference back to hours and minutes
      const hours = Math.floor(difference / 100);
      const minutes = difference % 100;

      // Format the result with leading zeros
      setDuration(`${hours} hours, ${minutes} minutes`);
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const difference = endDate.getTime() - startDate.getTime();
    let milliseconds = difference;
    let seconds = Math.floor(milliseconds / 1000);
    milliseconds %= 1000;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    const duration =
      String(hours) +
      " hour, " +
      String(minutes) +
      " minutes, " +
      String(seconds) +
      " seconds";
    setDuration(duration);
  }, [startTime, endTime]);

  const {
    data: allStudents,
    error: allStudentsError,
    isLoading: isAllStudentsListLoading,
  } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        console.log("Getting students");
        const res = await Fetch({
          url: "/user/get-all-students",
          //   token: true,
          method: "GET",
        });

        console.log(res.data);

        return res?.data?.users;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  });

  const [timeSpan, setTimeSpan] = useState("");
  const [timeSpanError, setTimeSpanError] = useState("");

  const validateTimeSpan = (timeSpan) => {
    // Check if the time span is in the format of 1w, 2m etc
    // max 24 weeks or 6 months
    const regex = /^[0-9]{1,2}[wm]$/;

    if (regex.test(timeSpan)) {
      let numeric = 0,
        unit = "w";

      if (timeSpan.length === 3) {
        numeric = parseInt(timeSpan.slice(0, 2), 10);
        unit = timeSpan[2];
      } else {
        numeric = parseInt(timeSpan[0], 10);
        unit = timeSpan[1];
      }

      if (unit === "w") {
        if (numeric === 0) {
          return [false, "Min 1 week"];
        } else if (numeric > 24) {
          return [false, "Max 24 weeks"];
        } else if (
          recurranceType === CLASS_RECURRANCE_TYPE_FORTNIGHTLY &&
          numeric < 2
        ) {
          return [false, "Min 2 weeks for fortnightly"];
        } else {
          return [true, "Valid time span"];
        }
      } else if (unit === "m") {
        if (numeric === 0) {
          return [false, "Min 1 month"];
        } else if (numeric > 6) {
          return [false, "Max 6 months"];
        } else {
          return [true, "Valid time span"];
        }
      }
    } else {
      return [false, "Invalid time span format"];
    }
  };

  useEffect(() => {
    if (timeSpan) {
      const [valid, message] = validateTimeSpan(timeSpan);

      if (!valid) {
        setTimeSpanError(message);
      } else {
        setTimeSpanError("");
      }
    }
  }, [timeSpan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);

    // formData["days"] = days;

    // console.log(formData, new Date(formData.start_time).toISOString());

    if (classType === CLASS_TYPE_ONETIME) {
      console.log({
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        class_type: classType,
        allowed_students: allowedStudents.map((s) => s.email),
      });
    }

    if (classType === CLASS_TYPE_RECURRING) {
      console.log({
        ...formData,
        start_time: formData.start_time,
        end_time: formData.end_time,
        class_type: classType,
        recurrance_type: recurranceType,
        recurrance_days: weeklyRecurranceDays,
        allowed_students: allowedStudents.map((s) => s.email),
      });
    }

    const onetime_class_start_time =
      classType === CLASS_TYPE_ONETIME
        ? new Date(formData.start_time).toISOString()
        : null;
    const onetime_class_end_time =
      classType === CLASS_TYPE_ONETIME
        ? new Date(formData.end_time).toISOString()
        : null;
    const recurring_class_end_time =
      classType === CLASS_TYPE_RECURRING ? formData.end_time : null;
    const recurring_class_start_time =
      classType === CLASS_TYPE_RECURRING ? formData.start_time : null;

    const [res, err] = await ClassAPI.postCreateClass(
      formData.class_name,
      formData.class_desc,
      classType,
      classType === CLASS_TYPE_ONETIME ? null : recurranceType,
      weeklyRecurranceDays,
      onetime_class_start_time,
      onetime_class_end_time,
      recurring_class_start_time,
      recurring_class_end_time,
      4,
      allowedStudents.map((s) => s.email)
    );

    if (err) {
      toast.error("Error updating class");
      return;
    } else {
      toast.success("Class updated successfully");
    }

    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      onClose={() => {
        setVisible(false);
      }}
      w={"80%"}
    >
      <Modal.Title>Create New Class</Modal.Title>

      <Modal.Content>
        <form
          className="flex-col items-center justify-center space-y-10 my-10 bg-white"
          onSubmit={handleSubmit}
        >
          <Divider align="left">Basic Info</Divider>

          <div className="flex flex-row gap-2">
            <TextField
              className="w-full"
              name="class_name"
              label="Class Name"
              required
            />

            <TextField
              className="w-full"
              name="class_desc"
              label="Class Description"
            />
          </div>

          <Divider align="left">Recurrance</Divider>

          <p className="text-sm pt-4">
            One time Classes start and end at a particular time on the selected
            date.
            <br />
            Recurring Classes can repeat regularly at some frequency.
          </p>
          <FormControl fullWidth>
            <InputLabel id="class-type-select-label">Class Type</InputLabel>
            <Select
              labelId="class-type-select-label"
              value={classType}
              onChange={(e) => {
                setClassType(e.target.value);
              }}
            >
              <MenuItem value="CLASS_TYPE_ONETIME">One time class</MenuItem>
              <MenuItem value="CLASS_TYPE_RECURRING">Recurring Class</MenuItem>
            </Select>
          </FormControl>

          {/* {classType} */}

          {classType === CLASS_TYPE_RECURRING && (
            <FormControl fullWidth>
              <InputLabel id="recurrance-type-select-label">
                Recurrance Type
              </InputLabel>
              <Select
                labelId="recurrance-type-select-label"
                value={recurranceType}
                onChange={(e) => {
                  setRecurranceType(e.target.value);
                }}
              >
                <MenuItem value={CLASS_RECURRANCE_TYPE_DAILY}>
                  Every Day
                </MenuItem>
                <MenuItem value={CLASS_RECURRANCE_TYPE_WEEKLY}>
                  Every Week
                </MenuItem>
                <MenuItem value={CLASS_RECURRANCE_TYPE_FORTNIGHTLY}>
                  Every Fortnight
                </MenuItem>
                {/* <MenuItem value={CLASS_RECURRANCE_TYPE_MONTHLY}>
									Every Month
								</MenuItem> */}
              </Select>
            </FormControl>
          )}

          {classType === CLASS_TYPE_RECURRING &&
            recurranceType === CLASS_RECURRANCE_TYPE_DAILY && (
              <p className="text-sm mt-2">
                Classes will be scheduled every day at the same time
              </p>
            )}

          {classType === CLASS_TYPE_RECURRING &&
            recurranceType === CLASS_RECURRANCE_TYPE_WEEKLY && (
              <p className="text-sm mt-2">
                Classes will be scheduled every week on the selected days at the
                same time
              </p>
            )}

          {classType === CLASS_TYPE_RECURRING &&
            recurranceType === CLASS_RECURRANCE_TYPE_FORTNIGHTLY && (
              <p className="text-sm mt-2">
                Classes will be scheduled every fortnight (15 days) at the same
                time
              </p>
            )}

          {classType === CLASS_TYPE_RECURRING &&
            recurranceType === CLASS_RECURRANCE_TYPE_MONTHLY && (
              <p className="text-sm mt-2">
                Classes will be scheduled every month at the same time on
                selected dates
              </p>
            )}

          {classType === CLASS_TYPE_RECURRING &&
            recurranceType === CLASS_RECURRANCE_TYPE_WEEKLY && (
              <FormControl fullWidth>
                <InputLabel id="days-select-label">
                  Weekly (Recurrance)
                </InputLabel>
                <Select
                  labelId="days-select-label"
                  multiple
                  value={weeklyRecurranceDays}
                  onChange={(e) => {
                    const { value } = e.target;
                    setWeeklyRecurranceDays(
                      typeof value === "string" ? value.split(",") : value
                    );
                  }}
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                  <MenuItem value="Sunday">Sunday</MenuItem>
                </Select>
              </FormControl>
            )}

          {classType === CLASS_TYPE_RECURRING && (
            <div className="flex flex-row gap-2">
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-600">Start Time</p>
                <input
                  type="time"
                  name="start_time"
                  onChange={handleStartTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-600">End Time</p>
                <input
                  type="time"
                  name="end_time"
                  onChange={handleEndTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {classType === CLASS_TYPE_ONETIME && (
            <div className="flex flex-row gap-2">
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-600">Start Time</p>
                <input
                  type="datetime-local"
                  name="start_time"
                  onChange={handleStartTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-600">End Time</p>
                <input
                  type="datetime-local"
                  name="end_time"
                  onChange={handleEndTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {duration && <Text>Duration : {duration}</Text>}

          <Divider align="start">Allowed Students</Divider>

          <Autocomplete
            id="students"
            multiple
            fullWidth
            onChange={(e, value) => {
              setAllowedStudents(value);
            }}
            open={openAllowedStudentsList}
            onOpen={() => {
              setOpenAllowedStudentsList(true);
            }}
            onClose={() => {
              setOpenAllowedStudentsList(false);
            }}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            getOptionLabel={(option) => option.name}
            options={allStudents ?? []}
            loading={isAllStudentsListLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Allowed Student List"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isAllStudentsListLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* {classType === CLASS_TYPE_RECURRING && (
						<>
							<Divider align="start">Generate For</Divider>
							<p className="text-sm pt-4">
								Generate recurring classes for the selected time
								range. Classes can be managed and regenerated at
								a later stage.
								<br />
								<span className="font-semibold">
									Examples :{" "}
								</span>
								<span>
									1w, 1m, 2m for 1 week, 1 month, 2 months etc
								</span>
							</p>

							<TextField
								className="w-full"
								name="generate_for"
								label="Time Span (w, m)"
								onChange={(e) => {
									setTimeSpan(e.target.value);
								}}
								error={timeSpanError ? true : false}
								helperText={timeSpanError}
								required
							/>
						</>
					)} */}

          <Button type="submit" className="w-full" variant="contained">
            Submit
          </Button>
        </form>
      </Modal.Content>
    </Modal>
  );
}
