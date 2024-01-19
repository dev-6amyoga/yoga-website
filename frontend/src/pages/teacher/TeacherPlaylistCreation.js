import React from "react";
import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { ToastContainer, toast } from "react-toastify";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import {
  Card,
  Table,
  Input,
  Button,
  Divider,
  Grid,
  Modal,
} from "@geist-ui/core";
export default function TeacherPlaylistCreation() {
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const [teachers, setTeachers] = useState([]);
  const [currentInstitute, setCurrentInstitute] = useState(null);
  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);
  const user_id = user?.user_id;
  const [playlist_temp, setPlaylistTemp] = useState([]);
  const [asanas, setAsanas] = useState([]);
  const [maxCount, setMaxCount] = useState(100000);
  const [currentCount, setCurrentCount] = useState(0);
  const [userPlaylist, setUserPlaylist] = useState({});
  const [incremented, setIncremented] = useState(false);
  const [modalState, setModalState] = useState(false);
  useEffect(() => {
    console.log(user);
    console.log(user.roles);
    console.log(currentInstituteId);
    console.log(currentInstitute);
  }, [user]);
  const incrementPlaylistField = (field) => {
    setUserPlaylist((prevPlaylist) => ({
      ...prevPlaylist,
      [field]: prevPlaylist[field] + 1,
    }));
    setIncremented(true);
  };

  const updateData = () => {
    const x = document.getElementById("asana_count_playlist").value;
    const entryToUpdate = playlist_temp[modalData.index];
    if (entryToUpdate) {
      entryToUpdate.count = x;
    }
    setModalState(false);
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };

  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
    index: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
        console.log(data);
        setAsanas(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);
  const renderAction2 = (value, rowData, index) => {
    const inputId = `asana_count_${rowData.id}`;
    return (
      <div>
        <Input
          width="50%"
          id={inputId}
          placeholder="1"
          // type="number"
          min="1"
          pattern="\d+"
        />
        <Button
          type="warning"
          auto
          scale={1 / 3}
          font="12px"
          onClick={() => addToPlaylist(rowData, inputId, index)}
        >
          Add
        </Button>
      </div>
    );
  };
  const addToPlaylist = (rowData, inputId, index) => {
    const countInput = document.getElementById(inputId);
    const countValue = countInput ? countInput.value : "";
    const count = countValue === "" ? 1 : parseInt(countValue, 10);
    if (!isNaN(count)) {
      setPlaylistTemp((prevPlaylist) => [
        ...prevPlaylist,
        {
          rowData: rowData,
          count: count,
        },
      ]);
    } else {
      toast("Invalid count entered. Please enter a valid number.");
    }
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = () => {
      setPlaylistTemp((prevPlaylist) =>
        prevPlaylist.filter((entry) => entry !== rowData)
      );
    };
    const handleUpdate = async () => {
      const updatedRowData = { ...rowData, index: index };
      setModalData(updatedRowData);
      setModalState(true);
    };

    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 5}
            font="12px"
            onClick={handleDelete}
          >
            Remove
          </Button>
        </Grid>
        <Grid>
          <Button
            type="warning"
            auto
            scale={1 / 5}
            font="12px"
            onClick={() => handleUpdate(Number(rowData.id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playlist_name = document.querySelector("#playlist_name").value;
    const student_name = document.querySelector("#student_name").value;
    const playlist_sequence = {};
    playlist_sequence["playlist_name"] = playlist_name;
    playlist_sequence["student_name"] = student_name;
    playlist_sequence["asana_ids"] = [];
    playlist_temp.map((item) => {
      const asana_id_playlist = item["rowData"]["id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        playlist_sequence["asana_ids"].push(Number(asana_id_playlist));
      }
    });
    // const newId = "S_" + String(user_id) + "_" + String(maxStudId + 1);
    const newRecord = {
      user_id: user_id,
      institute_id: currentInstituteId,
      playlist_name: playlist_sequence["playlist_name"],
      asana_ids: playlist_sequence["asana_ids"],
      student_name: playlist_sequence["student_name"],
    };
    if (currentCount === maxCount) {
      toast("LIMIT REACHED!!");
    } else {
      incrementPlaylistField("current_count");
      console.log(newRecord);
      try {
        const response = await fetch(
          "http://localhost:4000/teacher-playlist/add-playlist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRecord),
          }
        );
        if (response.ok) {
          // setMaxStudId((prevMaxStudId) => prevMaxStudId + 1);
          toast("Playlist added successfully");
        } else {
          console.error("Failed to add playlist");
        }
      } catch (error) {
        console.error("Error during playlist addition:", error);
      }
    }
  };

  return (
    <TeacherPageWrapper heading="Make Playlist">
      <div>
        <Card>
          <Table width={60} data={asanas} className="bg-white ">
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column prop="asana_category" label="Category" />
            <Table.Column
              prop="in_playlist"
              label="Add To Playlist"
              width={150}
              render={(value, rowData, index) =>
                renderAction2(value, rowData, index)
              }
            />
          </Table>
        </Card>
      </div>
      {playlist_temp.length > 0 && (
        <Card>
          <Table width={40} data={playlist_temp} className="bg-dark ">
            <Table.Column
              prop="rowData.asana_name"
              label="Asana Name"
              render={(_, rowData) => {
                return <p>{rowData.rowData.asana_name}</p>;
              }}
            />
            <Table.Column
              prop="rowData.asana_category"
              label="Category"
              render={(_, rowData) => {
                return <p>{rowData.rowData.asana_category}</p>;
              }}
            />
            <Table.Column
              prop="rowData.language"
              label="Language"
              render={(_, rowData) => {
                return <p>{rowData.rowData.language}</p>;
              }}
            />
            <Table.Column prop="count" label="Count" />
            <Table.Column
              prop="operation"
              label="ACTIONS"
              width={150}
              render={renderAction}
            />
          </Table>
          <Divider />
          <form
            className="flex-col items-center justify-center space-y-10 my-10"
            onSubmit={handleSubmit}
          >
            <Input width="100%" id="playlist_name">
              Playlist Name
            </Input>
            <Input width="100%" id="student_name">
              Student Name
            </Input>
            <Button htmlType="submit">Submit</Button>
          </form>
        </Card>
      )}

      <div>
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update</Modal.Title>
          <Modal.Subtitle>{modalData.rowData.asana_name}</Modal.Subtitle>
          <Modal.Subtitle>{modalData.index}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="asana_count_playlist"
                placeholder={modalData.count}
                onChange={handleInputChange}
              >
                Count
              </Input>
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>
      </div>
    </TeacherPageWrapper>
  );
}
