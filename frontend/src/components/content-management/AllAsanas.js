import {
  Dot,
  Input,
  Modal,
  Select,
  Table,
  Text,
  Tooltip,
  Grid,
  Card,
} from "@geist-ui/core";
import { Button, Box, Switch, FormControlLabel } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Search } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Edit, Delete, PenTool } from "@geist-ui/icons";

import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import "./AllAsanas.css";

function AllAsanas() {
  const [asanas, setAsanas] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [delAsanaId, setDelAsanaId] = useState(0);
  const [showTeacherModeAsanas, setShowTeacherModeAsanas] = useState(false);
  const [showNonDrmAsanas, setShowNonDrmAsanas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalState, setModalState] = useState(false);
  const [tableLanguages, setTableLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransitions, setFilteredTransitions] = useState([]);

  const [modalData, setModalData] = useState({
    asana_name: "",
    asana_desc: "",
    asana_videoID: "",
    language: "",
    asana_category: "",
    asana_type: "",
    asana_difficulty: "",
    asana_dash_url: "",
    asana_hls_url: "",
  });

  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log(searchTerm);
      setFilteredTransitions(
        asanas.filter((transition) =>
          transition.asana_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransitions(asanas);
    }
  }, [searchTerm]);

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
        const response = await Fetch({
          url: "/content/playlists/getAllPlaylists",
        });
        const data = response.data;
        setAllPlaylists(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

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
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response.data;
        const sortedUsers = data.sort((a, b) => {
          return b.id - a.id;
        });

        setAllAsanas(sortedUsers);
        let finalAsanas = [];
        for (var entry in data) {
          if (data[entry].drm_video === true) {
            if (data[entry].teacher_mode === false) {
              finalAsanas.push(data[entry]);
            }
          }
        }
        setAsanas(finalAsanas);
        setFilteredTransitions(finalAsanas);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast("Error fetching asanas");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showTeacherModeAsanas === true) {
      if (showNonDrmAsanas === true) {
        let finalAsanas = [];
        for (var entry in allAsanas) {
          if (allAsanas[entry].drm_video === false) {
            if (allAsanas[entry].teacher_mode === true) {
              finalAsanas.push(allAsanas[entry]);
            }
          }
        }
        setAsanas(finalAsanas);
        setFilteredTransitions(finalAsanas);
      }
      if (showNonDrmAsanas === false) {
        let finalAsanas = [];
        for (var entry in allAsanas) {
          if (allAsanas[entry].drm_video === true) {
            if (allAsanas[entry].teacher_mode === true) {
              finalAsanas.push(allAsanas[entry]);
            }
          }
        }
        setAsanas(finalAsanas);
        setFilteredTransitions(finalAsanas);
      }
    }
    if (showTeacherModeAsanas === false) {
      if (showNonDrmAsanas === true) {
        let finalAsanas = [];
        for (var entry in allAsanas) {
          if (allAsanas[entry].drm_video === false) {
            if (allAsanas[entry].teacher_mode === false) {
              finalAsanas.push(allAsanas[entry]);
            }
          }
        }
        setAsanas(finalAsanas);
        setFilteredTransitions(finalAsanas);
      }
      if (showNonDrmAsanas === false) {
        let finalAsanas = [];
        for (var entry in allAsanas) {
          if (allAsanas[entry].drm_video === true) {
            if (allAsanas[entry].teacher_mode === false) {
              finalAsanas.push(allAsanas[entry]);
            }
          }
        }
        setAsanas(finalAsanas);
        setFilteredTransitions(finalAsanas);
      }
    }
  }, [showTeacherModeAsanas, showNonDrmAsanas]);

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
        const response = await Fetch({
          url: "/content/language/getAllLanguages",
        });
        const data = response.data;
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
        const response = await Fetch({
          url: "/content/asana/getAllAsanaCategories",
        });
        const data = response.data;
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const updateData = async () => {
    try {
      setModalState(false);
      toast("Updating changes");
      if (modalData.teacher_mode == "false") {
        modalData.teacher_mode = false;
      } else {
        modalData.teacher_mode = true;
      }
      const asanaId = Number(modalData.id);
      const response = await Fetch({
        url: `/content/video/updateAsana/${asanaId}`,
        method: "PUT",
        data: modalData,
      });
      if (response?.status === 200) {
        toast("Updated!");
        setAsanas((prevAsanas) =>
          prevAsanas.map((asana) => (asana.id === asanaId ? modalData : asana))
        );
        setFilteredTransitions((prevAsanas) =>
          prevAsanas.map((asana) => (asana.id === asanaId ? modalData : asana))
        );
      } else {
        toast("Error updating asana:", response.status);
      }
    } catch (error) {
      console.log(error);
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
          const response = await Fetch({
            url: `/content/playlists/updatePlaylist/${allPlaylists[i].playlist_id}`,
            method: "PUT",
            data: allPlaylists[i],
          });
          if (response?.status === 200) {
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
      const response = await Fetch({
        url: `/content/video/deleteAsana/${asanaId}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4">
          <Tooltip text={"Remove"}>
            <div
              onClick={() => {
                handleDelete();
              }}
            >
              <Delete className="w-6 h-6" />
            </div>
          </Tooltip>
          <Tooltip text={"Update"}>
            <div
              onClick={() => {
                handleUpdate(Number(rowData.id));
              }}
            >
              <Edit className="w-6 h-6" />
            </div>
          </Tooltip>
          <Tooltip text={"Edit"}>
            <div
              onClick={() => {
                navigate(`/admin/video/edit/${rowData?.id}`);
              }}
            >
              <PenTool className="w-6 h-6" />
            </div>
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderBool = (value) => {
    if (String(value).toLowerCase() === "true") {
      return <Dot type="success" />;
    } else {
      return <Dot type="secondary" />;
    }
  };

  return (
    <AdminPageWrapper heading="Content Management - View All Videos">
      <div className="">
        <Tooltip text="Register New Asana">
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              navigate("/admin/video/create");
            }}
            sx={{
              textTransform: "none", // Optional: keeps the label text in normal case
              borderRadius: 2, // Optional: adds a subtle border radius
            }}
          >
            Back
          </Button>
        </Tooltip>
        <br />
        <Button
          onClick={() => {
            handleDownload(asanas);
          }}
        >
          Download CSV
        </Button>
        <br />
        <Input
          icon={<Search />}
          scale={5 / 3}
          clearable
          type="warning"
          placeholder="Search"
          className="bg-white "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showTeacherModeAsanas}
                onChange={() =>
                  setShowTeacherModeAsanas(!showTeacherModeAsanas)
                }
                color="primary"
              />
            }
            label={showTeacherModeAsanas ? "Teacher Mode" : "Normal Mode"}
          />

          <FormControlLabel
            control={
              <Switch
                checked={showNonDrmAsanas}
                onChange={() => setShowNonDrmAsanas(!showNonDrmAsanas)}
                color="primary"
              />
            }
            label={showNonDrmAsanas ? "Non-DRM Asanas" : "DRM Asanas"}
          />
        </Box>
        {loading ? (
          <Text>Loading</Text>
        ) : (
          <Table data={filteredTransitions} className="bg-white ">
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column
              prop="teacher_mode"
              label="Teacher Mode"
              render={(teacherMode) => (teacherMode ? "Yes" : "No")}
            />{" "}
            <Table.Column prop="asana_category" label="Category" />
            <Table.Column prop="language" label="Language" />
            <Table.Column
              prop="drm_video"
              label="DRM Video"
              render={(drm_video) => (drm_video ? "Yes" : "No")}
            />
            <Table.Column
              prop="nobreak_asana"
              label="No Break Asana"
              render={renderBool}
            />
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
              <Input
                width="100%"
                id="asana_dash_url"
                placeholder={modalData.asana_dash_url}
                onChange={handleInputChange}
              >
                DASH URL
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
              <Input
                width="100%"
                id="teacher_mode"
                placeholder={modalData.teacher_mode}
                onChange={handleInputChange}
              >
                Teacher Mode
              </Input>

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
    </AdminPageWrapper>
  );
}

export default withAuth(AllAsanas, ROLE_ROOT);
