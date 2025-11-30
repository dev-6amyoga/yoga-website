import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Tabs,
  Tab,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";

const FRONTEND_DOMAIN = getFrontendDomain();

function ViewAllPlans() {
  const notify = (x) => toast(x);
  const [plans, setPlans] = useState([]);
  const [institutePlans, setInstitutePlans] = useState([]);
  const [delState, setDelState] = useState(false);
  const [delPlanId, setDelPlanId] = useState(0);
  const [modalState, setModalState] = useState(false);
  const [updated, setupdated] = useState(false);
  const [sortedPlans, setSortedPlans] = useState([]);
  const [sortedInstitutePlans, setSortedInstitutePlans] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [modalData, setModalData] = useState({
    plan_id: 0,
    name: "",
    has_basic_playlist: false,
    has_playlist_creation: false,
    playlist_creation_limit: 0,
    has_self_audio_upload: false,
    number_of_teachers: 0,
    plan_validity: 0,
    plan_user_type: "",
  });

  const closeDelHandler = () => {
    setDelState(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/plan/get-all",
        });
        const data = response.data;
        const sortedUsers = data.plans.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
        setPlans(sortedUsers);
      } catch (error) {
        notify("Error fetching plans");
      }
    };
    fetchData();
  }, [updated]);

  useEffect(() => {
    const fetchInstitutePlans = async () => {
      try {
        const response = await Fetch({
          url: "/plan/get-all-institute-plans",
        });
        const data = response.data;
        const sortedInstitute = data.plans.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
        setInstitutePlans(sortedInstitute);
      } catch (error) {
        notify("Error fetching institute plans");
      }
    };
    fetchInstitutePlans();
  }, [updated]);

  useEffect(() => {
    const sortedData = [...plans].sort((a, b) => a.plan_id - b.plan_id);
    setSortedPlans(sortedData);
  }, [plans, updated]);

  useEffect(() => {
    const sortedData = [...institutePlans].sort(
      (a, b) => a.plan_id - b.plan_id
    );
    console.log(sortedData);
    setSortedInstitutePlans(sortedData);
  }, [institutePlans, updated]);

  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "plans.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (planId) => {
    setDelPlanId(planId);
    setDelState(true);
  };

  const handleUpdate = (rowData) => {
    setModalData(rowData);
    setModalState(true);
  };

  const handleInputChange = (value, field) => {
    if (field === "has_basic_playlist") {
      setModalData({ ...modalData, [field]: value === "Yes" });
    } else if (field === "has_playlist_creation") {
      setModalData({ ...modalData, [field]: value === "Yes" });
    } else if (field === "has_self_audio_upload") {
      setModalData({ ...modalData, [field]: value === "Yes" });
    } else {
      setModalData({ ...modalData, [field]: value });
    }
  };

  const deletePlan = async () => {
    try {
      const response = await Fetch({
        url: `/plan/deletePlan/${delPlanId}`,
        method: "DELETE",
      });

      if (response?.status === 200) {
        setPlans((prev) => prev.filter((plan) => plan.plan_id !== delPlanId));
        notify("Plan deleted successfully");
      }

      setDelState(false);
    } catch (error) {
      notify("Error deleting plan");
    }
  };

  const updateData = async () => {
    try {
      const plan_id = Number(modalData.plan_id);
      const response = await Fetch({
        url: `/plan/update-plan/${plan_id}`,
        method: "PUT",
        data: modalData,
      });
      if (response?.status === 200) {
        notify("Plan updated successfully");
        setupdated(!updated);
        setModalState(false);
      }
    } catch (error) {
      notify("Error updating plan");
    }
  };

  const getPurchaseLink = (planId) => {
    return `${FRONTEND_DOMAIN}/student/purchase-a-plan/${planId}`;
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notify("Link copied to clipboard!");
  };

  const PricingDisplay = ({ pricing }) => {
    if (!pricing || pricing.length === 0) return <span>-</span>;
    return (
      <Stack spacing={0.5}>
        {pricing.map((price) => (
          <span key={price.plan_pricing_id}>
            {price.denomination} {price.currency.short_tag}
          </span>
        ))}
      </Stack>
    );
  };
  const StudentPlansTable = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Plan ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Plan Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Basic Playlist</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Playlist Creation</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Creation Limit</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Self Audio Upload</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Teachers</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Validity (Days)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPlans.map((plan) => (
            <TableRow key={plan.plan_id} hover>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
              <TableCell>
                <Chip
                  label={plan.has_basic_playlist ? "Yes" : "No"}
                  color={plan.has_basic_playlist ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={plan.has_playlist_creation ? "Yes" : "No"}
                  color={plan.has_playlist_creation ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>{plan.playlist_creation_limit}</TableCell>
              <TableCell>
                <Chip
                  label={plan.has_self_audio_upload ? "Yes" : "No"}
                  color={plan.has_self_audio_upload ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>{plan.number_of_teachers}</TableCell>
              <TableCell>{plan.plan_validity}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    size="small"
                    onClick={() => handleUpdate(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={() => handleDelete(plan.plan_id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const InstitutePlansTable = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Plan ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Plan Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Pricing</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Classes/Limit</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Validity (Days)</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Purchase Link</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedInstitutePlans.map((plan) => (
            <TableRow key={plan.plan_id} hover>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
              <TableCell>
                <PricingDisplay pricing={plan.pricing} />
              </TableCell>
              <TableCell>
                {plan.number_of_zoom_classes || plan.watch_time_limit || "-"}
              </TableCell>
              <TableCell>{plan.plan_validity_days}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    variant="text"
                    size="small"
                    href={getPurchaseLink(plan.plan_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() =>
                      copyToClipboard(getPurchaseLink(plan.plan_id))
                    }
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    size="small"
                    onClick={() => handleUpdate(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={() => handleDelete(plan.plan_id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <AdminPageWrapper heading="Plan Management">
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() =>
              handleDownload(
                tabValue === 0 ? sortedPlans : sortedInstitutePlans
              )
            }
          >
            Download CSV
          </Button>
        </Stack>

        <Paper>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Institute Plans" />
            <Tab label="Student Plans" />
          </Tabs>
        </Paper>

        {tabValue === 1 && <></>}
        {tabValue === 0 && <InstitutePlansTable />}
      </Box>

      {/* Update Modal */}
      <Dialog
        open={modalState}
        onClose={() => setModalState(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Plan</DialogTitle>
        <DialogContent
          sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            label="Plan Name"
            value={modalData.name}
            onChange={(e) => handleInputChange(e.target.value, "name")}
          />

          <FormControl fullWidth>
            <InputLabel>Has Basic Playlist</InputLabel>
            <Select
              value={modalData.has_basic_playlist ? "Yes" : "No"}
              onChange={(e) =>
                handleInputChange(e.target.value, "has_basic_playlist")
              }
              label="Has Basic Playlist"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Has Playlist Creation</InputLabel>
            <Select
              value={modalData.has_playlist_creation ? "Yes" : "No"}
              onChange={(e) =>
                handleInputChange(e.target.value, "has_playlist_creation")
              }
              label="Has Playlist Creation"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Playlist Creation Limit"
            value={modalData.playlist_creation_limit}
            onChange={(e) =>
              handleInputChange(e.target.value, "playlist_creation_limit")
            }
          />

          <FormControl fullWidth>
            <InputLabel>Has Self Audio Upload</InputLabel>
            <Select
              value={modalData.has_self_audio_upload ? "Yes" : "No"}
              onChange={(e) =>
                handleInputChange(e.target.value, "has_self_audio_upload")
              }
              label="Has Self Audio Upload"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Number of Teachers"
            value={modalData.number_of_teachers}
            onChange={(e) =>
              handleInputChange(e.target.value, "number_of_teachers")
            }
          />

          <TextField
            fullWidth
            type="number"
            label="Plan Validity (Days)"
            value={modalData.plan_validity}
            onChange={(e) => handleInputChange(e.target.value, "plan_validity")}
          />

          <FormControl fullWidth>
            <InputLabel>Plan User Type</InputLabel>
            <Select
              value={modalData.plan_user_type || "Student"}
              onChange={(e) =>
                handleInputChange(e.target.value, "plan_user_type")
              }
              label="Plan User Type"
            >
              <MenuItem value="Institute">Institute</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalState(false)}>Cancel</Button>
          <Button onClick={updateData} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={delState} onClose={closeDelHandler}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Do you really wish to delete this Plan?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelState(false)}>No</Button>
          <Button onClick={deletePlan} variant="contained" color="error">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  );
}

export default withAuth(ViewAllPlans, ROLE_ROOT);
