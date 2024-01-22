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
import { toast } from "react-toastify";
import Papa from "papaparse";

export default function AllAsanas() {
  const [asanas, setAsanas] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [delAsanaId, setDelAsanaId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalState, setModalState] = useState(false);
  const [tableLanguages, setTableLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [modalData, setModalData] = useState({
    asana_name: "",
    asana_desc: "",
    asana_videoID: "",
    language: "",
    asana_category: "",
    asana_type: "",
    asana_difficulty: "",
  });

  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        setAllPlaylists(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);
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
        toast("Error fetching asanas");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/language/getAllLanguages"
        );
        const data = await response.json();
        setTableLanguages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/asana/getAllAsanaCategories"
        );
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
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
        toast("Error updating asana:", response.status);
      }
    } catch (error) {
      toast(error);
    }
  };

  const closeDelHandler = (event) => {
    setDeleteModal(false);
  };

  const deleteAsana = async () => {
    const asanaId = delAsanaId;
    for (var i = 0; i < allPlaylists.length; i++) {
      if (allPlaylists[i].asana_ids.includes(asanaId)) {
        console.log("Update this playlist!");
        allPlaylists[i].asana_ids = allPlaylists[i].asana_ids.filter(
          (id) => id !== asanaId
        );
        try {
          const response = await fetch(
            `http://localhost:4000/content/playlists/updatePlaylist/${allPlaylists[i].playlist_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(allPlaylists[i]),
            }
          );
          if (response.ok) {
            console.log(response);
          } else {
            console.log("Error updating asana:", response.status);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    try {
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
        toast("Deleted Successfully!");
        setDeleteModal(false);
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

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      setDeleteModal(true);
      setDelAsanaId(Number(rowData.id));
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
        <Button
          onClick={() => {
            handleDownload(asanas);
          }}
        >
          Download CSV
        </Button>
        <br />
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
            {/* <Table.Column prop="asana_difficulty" label="Difficulty" /> */}
            <Table.Column
              prop="asana_difficulty"
              label="Difficulty"
              render={(data) => {
                if (data.includes("Beginner")) {
                  if (data.includes("Intermediate")) {
                    if (data.includes("Advanced")) {
                      return "Beg, Int, Adv";
                    } else {
                      return "Beg, Int";
                    }
                  } else if (data.includes("Advanced")) {
                    return "Beg, Adv";
                  } else {
                    return "Beg";
                  }
                } else if (data.includes("Intermediate")) {
                  if (data.includes("Advanced")) {
                    return "Int, Adv";
                  } else {
                    return "Int";
                  }
                } else {
                  if (data.includes("Adnvanced")) {
                    return "Adv";
                  } else {
                    return "";
                  }
                }
              }}
            />

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
                {tableLanguages &&
                  tableLanguages.map((language) => (
                    <Select.Option
                      key={language.language_id}
                      value={language.language}
                    >
                      {language.language}
                    </Select.Option>
                  ))}
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
                {categories &&
                  categories.map((x) => (
                    <Select.Option
                      key={x.asana_category_id}
                      value={x.asana_category}
                    >
                      {x.asana_category}
                    </Select.Option>
                  ))}
              </Select>
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>

        <Modal visible={deleteModal} onClose={closeDelHandler}>
          <Modal.Title>Delete Asana</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this asana?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDeleteModal(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deleteAsana}>Yes</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}
