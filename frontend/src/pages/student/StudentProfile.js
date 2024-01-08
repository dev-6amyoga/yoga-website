import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { Card, Divider, Input, Text, Button, Modal } from "@geist-ui/core";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import getFormData from "../../utils/getFormData";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";

export default function StudentProfile() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [update, setUpdate] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [updateData, setUpdateData] = useState({});
  const closeUpdateHandler = (event) => {
    setUpdate(false);
  };
  // const handleInputChange = (e) => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    setUpdate(true);
    setUpdateData(formData);
    console.log("handle submit");
  };

  const updateProfile = async () => {
    console.log(updateData);
    setUpdate(false);
  };

  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div>
          <Card type="secondary" shadow hoverable>
            <Text h2>Hello {user.name}</Text>
            <br />
            <Text h6>This is your profile page.</Text>
          </Card>
          <Divider />
          <Card>
            <form className="flex flex-col gap-2 my-8" onSubmit={handleSubmit}>
              <Input
                width="100%"
                name="name_profile"
                placeholder={user.name}
                disabled={!isEditing}
                // onChange={handleInputChange}
              >
                Name
              </Input>
              <Input
                width="100%"
                name="username_profile"
                placeholder={user.username}
                disabled={!isEditing}
                // onChange={handleInputChange}
              >
                Username
              </Input>
              <Input
                width="100%"
                name="email_profile"
                placeholder={user.email}
                disabled={!isEditing}
                // onChange={handleInputChange}
              >
                Email ID
              </Input>
              <Input
                width="100%"
                name="phone_profile"
                placeholder={user.phone}
                disabled={!isEditing}
                // onChange={handleInputChange}
              >
                Phone Number
              </Input>

              <Button type="warning" htmlType="submit">
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </form>
            <br />
          </Card>
        </div>
      </div>
      <div>
        <ToastContainer />
      </div>
      <div>
        <Modal visible={update} onClose={closeUpdateHandler}>
          <Modal.Title>Update Profile</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to update your profile?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setUpdate(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={updateProfile}>Yes</Modal.Action>
        </Modal>
      </div>
      <ChangePassword />
    </div>
  );
}
