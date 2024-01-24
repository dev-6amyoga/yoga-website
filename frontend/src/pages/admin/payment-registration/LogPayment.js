import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Fetch } from "../../../utils/Fetch";
import { Table, Button, Grid, Modal, Select, Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
import getFormData from "../../../utils/getFormData";
import CustomInput from "../../../components/Common/CustomInput";
import { UserCheck, UserPlus, ArrowRight } from "@geist-ui/icons";
import Students from "../member-management/Students";
export default function LogPayment() {
  const [userStatus, setUserStatus] = useState("EXISTING");
  const [students, setStudents] = useState([]);
  const [planAddition, setPlanAddition] = useState(true);
  const [studentModalState, setStudentModalState] = useState(false);
  const [modalData, setModalData] = useState({});
  const [paymentFor, setPaymentFor] = useState("");
  const handleSetPaymentFor = (val) => {
    setPaymentFor(val);
  };
  const [studentData, setStudentData] = useState([]);
  const appendToUsers = (newUserData) => {
    setStudentData((prevUsers) => [...prevUsers, newUserData]);
  };
  const [userType, setUserType] = useState("");
  const [nextClicked, setNextClicked] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {
    setStudentData([]);
    if (students.length > 0) {
      for (var i = 0; i != students.length; i++) {
        console.log(students[i].user_id);
        Fetch({
          url: "http://localhost:4000/user/get-by-id",
          method: "POST",
          data: {
            user_id: students[i].user_id,
          },
        }).then((res) => {
          if (res && res.status === 200) {
            console.log(res.data);
            appendToUsers(res.data.user);
          } else {
            toast("Error updating profile; retry", {
              type: "error",
            });
          }
        });
      }
    }
  }, [students]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        setStudents(data.users);
        setStudentData([]);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  const next = () => {
    console.log("Next clicked!");
  };

  const renderAction = (value, rowData, index) => {
    const handleLog = async () => {
      try {
        const user_id = rowData.user_id;
        console.log(user_id);
        setStudentModalState(true);
        setModalData(rowData);
        console.log(rowData);
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 3}
            font="12px"
            onClick={handleLog}
          >
            Add
          </Button>
        </Grid>
      </Grid.Container>
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    formData.amount = formData.amount * 100;
    const additionalData = {
      payment_status: "succeeded",
      transaction_order_id: "MANUAL",
      transaction_payment_id: "MANUAL",
      transaction_signature: "MANUAL",
    };
    const combinedData = {
      ...formData,
      ...additionalData,
      payment_for: paymentFor,
      user_id: modalData.user_id,
    };
    console.log(combinedData);
    try {
      const response = await fetch(
        "http://localhost:4000/transaction/add-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(combinedData),
        }
      );
      if (response.ok) {
        toast("Succesfully logged!");
        if (paymentFor === "New Plan") {
          setPlanAddition(true);
        }
        setStudentModalState(false);
      } else {
        console.error("Failed to make the POST request");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="bg-[#f0efed] min-h-screen">
      <div className="h-20 bg-zinc-800 text-white">
        <AdminNavbar />
      </div>
      <div className="">
        <div className="p-8 lg:p-20">
          <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
            <h3 className="text-center text-2xl">Log a Payment</h3>
            <br />
            <hr />
            <br />
            <div className="flex flex-col gap-1 items-center w-full mt-4">
              <div className="flex flex-row gap-1 items-center w-full mt-4">
                <div
                  className={`flex-1 flex items-center gap-2 flex-col px-4 py-2 border rounded-lg ${
                    userStatus === "EXISTING" ? "border-blue-500" : ""
                  }`}
                  onClick={() => {
                    setUserStatus("EXISTING");
                    setUserType("");
                    setNextClicked(false);
                    setShowUserSelection(true);
                  }}
                >
                  <UserCheck className="w-6 h-6" />
                  Existing User
                </div>
                <div
                  className={`flex-1 flex items-center gap-2 flex-col px-4 py-2 border rounded-lg ${
                    userStatus === "NEW" ? "border-blue-500" : ""
                  }`}
                  onClick={() => {
                    setUserStatus("NEW");
                    setUserType("");
                    setNextClicked(false);
                    setShowUserSelection(true);
                  }}
                >
                  {" "}
                  <UserPlus className="w-6 h-6" />
                  New User
                </div>
              </div>
              <br />
              {showUserSelection && (
                <div className="flex-1 flex items-center gap-2 flex-col px-4 py-2 border rounded-lg">
                  <h5>Choose User Type</h5>
                  <Button
                    onClick={() => {
                      setUserType("STUDENT");
                      setNextClicked(false);
                    }}
                  >
                    Student
                  </Button>
                  <Button
                    onClick={() => {
                      setUserType("INSTITUTE_OWNER");
                      setNextClicked(false);
                    }}
                  >
                    Institute
                  </Button>
                  <Button
                    type="warning"
                    width={"100%"}
                    onClick={() => {
                      if (userType === "") {
                        toast("Choose a user type!");
                      } else {
                        setNextClicked(true);
                        next();
                      }
                    }}
                    iconRight={<ArrowRight />}
                  >
                    Next
                  </Button>
                </div>
              )}
              <br />
              {userStatus === "EXISTING" && userType !== "" && nextClicked && (
                <div>
                  {userType === "STUDENT" && (
                    <div className="flex-1 flex items-center gap-2 flex-col px-4 py-2">
                      <h5>Existing Students</h5>
                      <Table width={35} data={studentData} className="bg-white">
                        <Table.Column
                          label="Student Name"
                          width={150}
                          prop="name"
                        />
                        <Table.Column
                          label="Email ID"
                          width={150}
                          prop="email"
                        />
                        <Table.Column label="Phone" width={150} prop="phone" />
                        <Table.Column
                          prop="operation"
                          label="SELECT"
                          width={150}
                          render={renderAction}
                        />
                      </Table>
                    </div>
                  )}
                  {userType === "INSTITUTE_OWNER" && (
                    <div>
                      <h5>Existing Institutes</h5>
                    </div>
                  )}
                </div>
              )}
              {userStatus === "NEW" && userType !== "" && nextClicked && (
                <h5>New User</h5>
              )}
            </div>
            <Modal
              visible={studentModalState}
              onClose={() => setStudentModalState(false)}
            >
              <Modal.Title>Log Payment</Modal.Title>
              <Modal.Content>
                <form
                  className="flex-1 flex items-center gap-2 flex-col px-4 py-2"
                  onSubmit={handleSubmit}
                >
                  <h5>Payment made by : {modalData.name}</h5>
                  <br />
                  <h6>Payment Method</h6>
                  <Input width="100%" name="payment_method"></Input>
                  <h6>Payment For</h6>
                  <Select
                    placeholder="Choose Payment Reason"
                    onChange={handleSetPaymentFor}
                  >
                    <Select.Option key="New Plan" value="New Plan">
                      New Plan
                    </Select.Option>
                    <Select.Option key="Miscellanous" value="Miscellanous">
                      Miscellanous
                    </Select.Option>
                  </Select>
                  <h6>Amount Paid (in INR)</h6>
                  <Input width="100%" name="amount"></Input>
                  <h6>Payment Date</h6>
                  <CustomInput
                    name="payment_date"
                    type="datetime-local"
                  ></CustomInput>
                  <br />
                  <Button htmlType="submit">Register</Button>
                </form>
              </Modal.Content>
              <Modal.Action passive onClick={() => setStudentModalState(false)}>
                Cancel
              </Modal.Action>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
