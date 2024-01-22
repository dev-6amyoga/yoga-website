import { Button, Grid, Modal, Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import "./AllPlaylists.css";
import { toast } from "react-toastify";
import Papa from "papaparse";

export default function AllAsanaCategories() {
  const [delState, setDelState] = useState(false);
  const [delId, setDelId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/asana/getAllAsanaCategories"
        );
        const data = await response.json();
        setCategories(data);
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
        `http://localhost:4000/content/asana/deleteAsanaCategory/${del_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        toast("Category deleted successfully!");
        setCategories((prev) =>
          prev.filter((cat) => cat.asana_category_id !== del_id)
        );
      } else {
        toast("Error deleting category:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
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
  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const asana_category_id = Number(rowData.asana_category_id);
        setDelId(asana_category_id);
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
        <Button
          onClick={() => {
            handleDownload(categories);
          }}
        >
          Download CSV
        </Button>
        <br />
        <Table width={100} data={categories} className="bg-white ">
          <Table.Column prop="asana_category_id" label="ID" />
          <Table.Column prop="asana_category" label="Asana Category" />
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
          <Modal.Title>Delete Asana Category</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this asana category?</p>
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
