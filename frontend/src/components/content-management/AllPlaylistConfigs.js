import { Button, Grid, Input, Modal, Table, Text, Card } from "@geist-ui/core";
import { Search } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import getFormData from "../../utils/getFormData";
import { toast } from "react-toastify";

function AllPlaylistConfigs() {
  const [delState, setDelState] = useState(false);
  const [playlistConfigId, setPlaylistConfigId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConfigs, setFilteredConfigs] = useState([]);
  const [playlistConfigs, setPlaylistConfigs] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setFilteredConfigs(
        playlistConfigs.filter((x) =>
          x.playlist_config_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredConfigs(playlistConfigs);
    }
  }, [searchTerm]);

  const closeDelHandler = (event) => {
    setDelState(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/playlist-configs/getAllConfigs",
        });
        const data = response.data;
        setPlaylistConfigs(data);
        setFilteredConfigs(data);
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

  const deletePlaylistConfid = async () => {
    try {
      const configId = playlistConfigId;
      const response = await Fetch({
        url: `/playlist-configs/deleteConfig/${configId}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
        toast("Deleted Successfully!");
        setPlaylistConfigs((prev) =>
          prev.filter((x) => x.playlist_config_id !== playlistConfigId)
        );
        setFilteredConfigs((prev) =>
          prev.filter((x) => x.playlist_config_id !== playlistConfigId)
        );
      } else {
        console.log("Error deleting Playlist Config:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const playlist_configId = Number(rowData.playlist_config_id);
        setPlaylistConfigId(playlist_configId);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    console.log(formData);
    if (
      formData.playlist_config_name === "" ||
      formData.playlist_config_value === ""
    ) {
      toast("Missing required fields!");
    } else {
      const configExists = playlistConfigs.some(
        (x) => formData.playlist_config_name === x.playlist_config_name
      );
      if (configExists) {
        toast("The configuration already exists!");
      } else {
        try {
          const response = await Fetch({
            url: "/playlist-configs/addConfig",
            method: "POST",
            data: formData,
          });
          if (response?.status === 200) {
            toast("New Config added successfully! Kindly refresh.");
          } else {
            toast("Failed to add new config");
          }
        } catch (error) {
          console.error("Error while making the request:", error);
        }
      }
    }
  };

  return (
    <AdminPageWrapper heading="Content Management - Playlist Configurations">
      <div className="flex flex-col items-center">
        <Button
          onClick={() => {
            handleDownload(filteredConfigs);
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
        <Table data={filteredConfigs} className="bg-white ">
          <Table.Column prop="playlist_config_name" label="Config Name" />
          <Table.Column prop="playlist_config_value" label="Config Value" />
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={renderAction}
          />
        </Table>
        <br />
        <br />
        <h2>Register New Configuration</h2>
        <Card>
          <form className="flex flex-col gap-1" onSubmit={handleSubmit}>
            <br />
            <Text h5>Playlist Config Name</Text>
            <Input width="100%" name="playlist_config_name"></Input>
            <br />
            <Text h5>Playlist Config Value</Text>
            <Input width="100%" name="playlist_config_value"></Input>
            <br />
            <Button htmlType="submit">Submit</Button>
          </form>
        </Card>
      </div>
      <div>
        <Modal visible={delState} onClose={closeDelHandler}>
          <Modal.Title>Delete Playlist Config</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this configuration?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deletePlaylistConfid}>Yes</Modal.Action>
        </Modal>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(AllPlaylistConfigs, ROLE_ROOT);
