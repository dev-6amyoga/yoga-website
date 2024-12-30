import { Input, Modal, Table, Tooltip } from "@geist-ui/core";
import { Search, Delete } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
function AllLanguages() {
  const [delState, setDelState] = useState(false);
  const [delLanguageId, setDelLanguageId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransitions, setFilteredTransitions] = useState([]);
  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log(searchTerm);
      setFilteredTransitions(
        languages.filter((transition) =>
          transition.language.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransitions(languages);
    }
  }, [searchTerm]);
  const closeDelHandler = (event) => {
    setDelState(false);
  };
  const [languages, setLanguages] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/language/getAllLanguages",
        });
        const data = response.data;
        setLanguages(data);
        setFilteredTransitions(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
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
  const deleteLanguage = async () => {
    try {
      const languageId = delLanguageId;
      const response = await Fetch({
        url: `/content/video/deleteLanguage/${languageId}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
        setLanguages((prev) =>
          prev.filter((lang) => lang.language_id !== languageId)
        );
      } else {
        console.log("Error deleting Language:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = useNavigate();
  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const language_id = Number(rowData.language_id);
        setDelLanguageId(language_id);
        setDelState(true);
      } catch (error) {
        console.error(error);
      }
    };

    return (
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
      </div>
    );
  };

  return (
    <AdminPageWrapper heading="Content Management - View All Languages">
      <div className="elements">
        <Tooltip text="Register New Language">
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              navigate("/admin/language/create");
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
            handleDownload(languages);
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
        <Table data={filteredTransitions} className="bg-white ">
          <Table.Column prop="language_id" label="Language ID" />
          <Table.Column prop="language" label="Language" />
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={renderAction}
          />
        </Table>
      </div>
      <div>
        <Modal visible={delState} onClose={closeDelHandler}>
          <Modal.Title>Delete Language</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this language?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deleteLanguage}>Yes</Modal.Action>
        </Modal>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(AllLanguages, ROLE_ROOT);
