import { useEffect, useState } from "react";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import {
  Input,
  Button,
  Text,
  Select,
  Spacer,
  Card,
  Divider,
} from "@geist-ui/core";
import getFormData from "../../utils/getFormData";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";

export default function RegisterNewClass() {
  const [days, setDays] = useState(null);
  const [duration, setDuration] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handler = (val) => {
    setDays(val);
  };
  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  useEffect(() => {
    const startDate = new Date("1970-01-01 " + startTime);
    const endDate = new Date("1970-01-01 " + endTime);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    formData["days"] = days;
    console.log(formData);
    try {
      const response = await Fetch({
        url: "/classMode/create",
        method: "POST",
        data: formData,
      });
      if (response?.status === 200) {
        toast("New class created successfully");
      } else {
        console.log("Failed to create new class");
      }
    } catch (error) {
      toast("Error while making the request:", error);
    }
  };

  return (
    <AdminPageWrapper heading="Register New Class">
      <div className="elements">
        <form
          className="flex-col items-center justify-center space-y-10 my-10"
          onSubmit={handleSubmit}
        >
          <Card hoverable>
            <Input width="100%" name="class_name">
              Class Name
            </Input>
            <Input width="100%" name="class_desc">
              Class Description
            </Input>
          </Card>
          <Card hoverable>
            <div class="mb-4">
              {" "}
              <Text>Start Time</Text>
              <input
                type="time"
                id="start_time"
                name="start_time"
                onChange={handleStartTimeChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div class="mb-4">
              <Text>End Time</Text>
              <input
                type="time"
                id="end_time"
                name="end_time"
                onChange={handleEndTimeChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Divider />
            {duration && <Text>Duration : {duration}</Text>}
          </Card>

          <Spacer />
          <Card hoverable>
            <Text>Applicable Days</Text>
            <Select
              multiple
              width="100%"
              onChange={handler}
              name="days"
              placeholder="Select Day(s)"
            >
              <Select.Option key="Monday" value="Monday">
                Monday
              </Select.Option>
              <Select.Option key="Tuesday" value="Tuesday">
                Tuesday
              </Select.Option>
              <Select.Option key="Wednesday" value="Wednesday">
                Wednesday
              </Select.Option>
              <Select.Option key="Thursday" value="Thursday">
                Thursday
              </Select.Option>
              <Select.Option key="Friday" value="Friday">
                Friday
              </Select.Option>
              <Select.Option key="Saturday" value="Saturday">
                Saturday
              </Select.Option>
              <Select.Option key="Sunday" value="Sunday">
                Sunday
              </Select.Option>
            </Select>
          </Card>
          <Button htmlType="submit">Submit</Button>
        </form>
      </div>
    </AdminPageWrapper>
  );
}
