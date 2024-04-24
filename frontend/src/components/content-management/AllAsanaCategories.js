import { Button, Grid, Input, Modal, Table, Tooltip } from "@geist-ui/core";
import { Search, Delete } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";

function AllAsanaCategories() {
  const [delState, setDelState] = useState(false);
  const [delId, setDelId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransitions, setFilteredTransitions] = useState([]);
  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log(searchTerm);
      setFilteredTransitions(
        categories.filter((transition) =>
          transition.asana_category
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransitions(categories);
    }
  }, [searchTerm]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/asana/getAllAsanaCategories",
        });
        const data = response.data;
        setCategories(data);
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
      const response = await Fetch({
        url: `/content/asana/deleteAsanaCategory/${del_id}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
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
          <Tooltip text={"Remove"}>
            <div
              onClick={() => {
                handleDelete();
              }}
            >
              <Delete className="w-6 h-6" />
            </div>
          </Tooltip>
        </Grid>
      </Grid.Container>
    );
  };

  return (
    <AdminPageWrapper heading="Content Management - View All Asana Categories">
      <div className="elements">
        <Button
          onClick={() => {
            handleDownload(categories);
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
        <br />
        <Table data={filteredTransitions} className="bg-white ">
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
    </AdminPageWrapper>
  );
}

export default withAuth(AllAsanaCategories, ROLE_ROOT);
