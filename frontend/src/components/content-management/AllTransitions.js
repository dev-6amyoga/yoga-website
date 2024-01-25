import { Button, Grid, Modal, Table, Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { Search } from "@geist-ui/icons";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import { toast } from "react-toastify";
import Papa from "papaparse";

export default function AllTransitions() {
  const [delState, setDelState] = useState(false);
  const [delId, setDelId] = useState("");
  const closeDelHandler = (event) => {
    setDelState(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransitions, setFilteredTransitions] = useState([]);
  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log(searchTerm);
      setFilteredTransitions(
        transitions.filter((transition) =>
          transition.transition_video_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransitions(transitions);
    }
  }, [searchTerm]);
  const [transitions, setTransitions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllTransitions"
        );
        const data = await response.json();
        setTransitions(data);
        setFilteredTransitions(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);
  const deleteCategory = async () => {
    try {
      const del_id = delId;
      const response = await fetch(
        `http://localhost:4000/content/video/deleteTransition/${del_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        toast("Transition deleted successfully!");
        setTransitions((prev) =>
          prev.filter((cat) => cat.transition_id !== del_id)
        );
      } else {
        toast("Error deleting transition:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };
  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const transition_id = rowData.transition_id;
        setDelId(transition_id);
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
  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        <Button
          onClick={() => {
            handleDownload(transitions);
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

        <Table width={100} data={filteredTransitions} className="bg-white ">
          <Table.Column prop="transition_id" label="ID" />
          <Table.Column prop="transition_video_name" label="Transition Name" />
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
          <Modal.Title>Delete Transition</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this transition?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deleteCategory}>Yes</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}
