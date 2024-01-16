import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Table,
  Text,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import "./AllAsanas.css";

export default function AllAsanas() {
  const [asanas, setAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    asana_name: "",
    asana_desc: "",
    asana_videoID: "",
    language: "",
    asana_category: "",
    asana_type: "",
    asana_difficulty: "",
  });

  const [category_modal, setCategoryModal] = useState("");
  const [language_modal, setLanguageModal] = useState("");
  const [type_modal, setTypeModal] = useState("");
  const handler1 = (val) => {
    setModalData({ ...modalData, asana_category: val });
  };
  const handler2 = (val) => {
    setModalData({ ...modalData, language: val });
  };
  const handler3 = (val) => {
    setModalData({ ...modalData, asana_type: val });
  };
  const handler4 = (val) => {
    setModalData({ ...modalData, asana_difficulty: val });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
        setAsanas(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sortedData = [...asanas].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.asana_name.localeCompare(b.asana_category);
      } else {
        return b.asana_name.localeCompare(a.asana_category);
      }
    });
    setSortedAsanas(sortedData);
  }, [asanas, sortOrder]);

  const updateData = async () => {
    try {
      const asanaId = Number(modalData.id);
      const response = await fetch(
        `http://localhost:4000/content/video/updateAsana/${asanaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modalData),
        }
      );
      if (response.ok) {
        setAsanas((prevAsanas) =>
          prevAsanas.map((asana) => (asana.id === asanaId ? modalData : asana))
        );
        setModalState(false);
      } else {
        console.log("Error updating asana:", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const asanaId = Number(rowData.id);
        const response = await fetch(
          `http://localhost:4000/content/video/deleteAsana/${asanaId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setAsanas((prevAsanas) =>
            prevAsanas.filter((asana) => asana.id !== asanaId)
          );
        } else {
          console.log("Error deleting asana:", response.status);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const handleUpdate = async () => {
      setModalData(rowData);
      setModalState(true);
    };

    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 3}
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
            scale={1 / 3}
            font="12px"
            onClick={() => handleUpdate(Number(rowData.id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        {loading ? (
          <Text>Loading</Text>
        ) : (
          <Table width={100} data={sortedAsanas} className="bg-white ">
            <Table.Column prop="id" label="Asana ID" />
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column prop="asana_desc" label="Description" />
            <Table.Column prop="asana_category" label="Category" />
            <Table.Column prop="language" label="Language" />
            <Table.Column prop="asana_type" label="Type" />
            <Table.Column prop="asana_difficulty" label="Difficulty" />
            <Table.Column prop="asana_videoID" label="Video URL" />
            <Table.Column prop="asana_withAudio" label="With Audio?" />
            <Table.Column prop="muted" label="  Muted?" />
            <Table.Column prop="counter" label="Counter?" />
            <Table.Column
              prop="operation"
              label="ACTIONS"
              width={150}
              render={renderAction}
            />
          </Table>
        )}
      </div>
      <div>
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update Asana</Modal.Title>
          <Modal.Subtitle>{modalData.asana_name}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="asana_name"
                placeholder={modalData.asana_name}
                onChange={handleInputChange}
              >
                Asana Name
              </Input>
              <Input
                width="100%"
                id="asana_desc"
                placeholder={modalData.asana_desc}
                onChange={handleInputChange}
              >
                Description
              </Input>
              <Input
                width="100%"
                id="asana_videoID"
                placeholder={modalData.asana_videoID}
                onChange={handleInputChange}
              >
                Video ID
              </Input>
              <Text h6>Language</Text>
              <Select
                onChange={handler2}
                id="language"
                value={modalData.language}
              >
                <Select.Option value="English">English</Select.Option>
                <Select.Option value="Hindi">Hindi</Select.Option>
                <Select.Option value="Malayalam">Malayalam</Select.Option>
              </Select>

              <Text h6>Video Type</Text>
              <Select
                onChange={handler3}
                id="asana_type"
                value={modalData.asana_type}
              >
                <Select.Option value="Single">Single</Select.Option>
                <Select.Option value="Combination">Combination</Select.Option>
              </Select>

              <Text h6>Asana Difficulty</Text>
              <Select
                onChange={handler4}
                id="asana_difficulty"
                value={modalData.asana_difficulty}
              >
                <Select.Option value="Beginner">Beginner</Select.Option>
                <Select.Option value="Intermediate">Intermediate</Select.Option>
                <Select.Option value="Advanced">Advanced</Select.Option>
              </Select>

              <Text h6>Category</Text>
              <Select
                onChange={handler1}
                id="asana_category"
                value={modalData.asana_category}
              >
                <Select.Option value="Standing">Standing</Select.Option>
                <Select.Option value="Sitting">Sitting</Select.Option>
                <Select.Option value="Supine">Supine</Select.Option>
                <Select.Option value="Inversion">Inversion</Select.Option>
                <Select.Option value="Prone">Prone</Select.Option>
                <Select.Option value="Special">Special</Select.Option>
              </Select>
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}
