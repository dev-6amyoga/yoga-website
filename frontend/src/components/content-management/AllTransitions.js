import {
  Button,
  Grid,
  Input,
  Modal,
  Table,
  Text,
  Tooltip,
} from "@geist-ui/core";
import { Search, Edit, Delete, PenTool } from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import { useMemo } from "react";
import SortableColumn from "../Common/DataTable/SortableColumn";
import { DataTable } from "../Common/DataTable/DataTable";

function AllTransitions() {
  const [delState, setDelState] = useState(false);
  const navigate = useNavigate();
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    transition_video_ID: "",
    transition_video_name: "",
    transition_dash_url: "",
    transition_hls_url: "",
  });
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllTransitions",
        });
        const data = response.data;
        setTransitions(data);
        setFilteredTransitions(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const deleteCategory = async () => {
    try {
      const del_id = delId;
      const response = await Fetch({
        url: `/content/video/deleteTransition/${del_id}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
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

    const handleUpdate = async () => {
      console.log("update!!");
      setModalState(true);
      setModalData(rowData);
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
        <Tooltip text={"Update"}>
          <div
            onClick={() => {
              handleUpdate();
            }}
          >
            <Edit className="w-6 h-6" />
          </div>
        </Tooltip>
        <Tooltip text={"Edit"}>
          <div
            onClick={() => {
              navigate(`/admin/transition/edit/${rowData?.transition_id}`);
            }}
          >
            <PenTool className="w-6 h-6" />
          </div>
        </Tooltip>
      </div>
    );
  };

  const updateData = async () => {
    console.log(modalData);
    setModalState(false);
    if (modalData.teacher_mode == "false") {
      modalData.teacher_mode = false;
    } else {
      modalData.teacher_mode = true;
    }
    toast("Updating changes");
    const response = await Fetch({
      url: `/content/video/updateTransition/${modalData.transition_id}`,
      method: "PUT",
      data: modalData,
    });
    if (response.status === 200) {
      toast("Success!");
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

  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "transition_id",
        header: ({ column }) => (
          <SortableColumn column={column}>Transition ID</SortableColumn>
        ),
      },
      {
        accessorKey: "transition_video_name",
        header: ({ column }) => (
          <SortableColumn column={column}>Transition Name</SortableColumn>
        ),
      },
      {
        accessorKey: "teacher_mode",
        header: ({ column }) => (
          <SortableColumn column={column}>Teacher Mode</SortableColumn>
        ),
      },
      {
        accessorKey: "transition_dash_url",
        header: ({ column }) => (
          <SortableColumn column={column}>DASH URL</SortableColumn>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return renderAction;
        },
      },
    ],
    []
  );

  return (
    <AdminPageWrapper heading="Content Management - View All Transitions">
      <div>
        <Button
          onClick={() => {
            handleDownload(transitions);
          }}
        >
          Download CSV
        </Button>
        <br />
        {/* <Button
					onClick={() => {
						navigate('admin/video/transition/create');
					}}>
					Register Transition Video
				</Button> */}

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
          <Table.Column prop="transition_id" label="ID" />
          <Table.Column prop="transition_video_name" label="Transition Name" />
          <Table.Column
            prop="teacher_mode"
            label="Teacher Mode"
            render={(teacherMode) => (teacherMode ? "Yes" : "No")}
          />{" "}
          <Table.Column prop="transition_video_ID" label="Cloudflare ID" />
          <Table.Column prop="transition_dash_url" label="DASH URL" />
          {/* <Table.Column prop="duration" label="Transition Duration" /> */}
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={renderAction}
          />
        </Table>

        {/* <DataTable
          columns={columnsDataTable}
          data={filteredTransitions || []}
          // refetch={getTransactions}
        ></DataTable> */}
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
      <div>
        <Modal
          visible={modalState}
          onClose={() => setModalState(false)}
          width="50rem"
        >
          <Modal.Title>Update Transition</Modal.Title>
          <Modal.Subtitle>{modalData.playlist_name}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Text>{modalData.transition_video_name}</Text>
              <br />
              <Input
                width="100%"
                id="transition_video_ID"
                placeholder={modalData.transition_video_ID}
                onChange={handleInputChange}
              >
                Transition Cloudflare ID
              </Input>
              <br />
              <Input
                width="100%"
                id="transition_hls_url"
                placeholder={modalData.transition_hls_url}
                onChange={handleInputChange}
              >
                Transition HLS URL
              </Input>
              <br />
              <Input
                width="100%"
                id="transition_dash_url"
                placeholder={modalData.transition_dash_url}
                onChange={handleInputChange}
              >
                Transition DASH URL
              </Input>
              <Input
                width="100%"
                id="teacher_mode"
                placeholder={modalData.teacher_mode}
                onChange={handleInputChange}
              >
                Teacher Mode
              </Input>

              <br />
              <br />
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(AllTransitions, ROLE_ROOT);
