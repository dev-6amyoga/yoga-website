import { Button, Grid, Modal, Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import "./AllPlaylists.css";

export default function AllLanguages() {
  const [delState, setDelState] = useState(false);
  const [delLanguageId, setDelLanguageId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };
  const [languages, setLanguages] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/language/getAllLanguages"
        );
        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const deleteLanguage = async () => {
    try {
      const languageId = delLanguageId;
      console.log(languageId, "TO BE DELETED");

      const response = await fetch(
        `http://localhost:4000/content/video/deleteLanguage/${languageId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Response from server:", response);
        setLanguages((prev) =>
          prev.filter((lang) => lang.language_id !== languageId)
        );
        console.log("Language deleted successfully");
      } else {
        console.log("Error deleting Language:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };

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
      </Grid.Container>
    );
  };

  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        <Table width={100} data={languages} className="bg-white ">
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
    </div>
  );
}
