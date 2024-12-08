import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [instituteData, setInstituteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const appendToUsers = (newUserData) => {
    setInstituteData((prevUsers) => [...prevUsers, newUserData]);
  };

  const appendToTeacherData = (new1) => {
    setTeacherData((prev) => [...prev, new1]);
  };

  useEffect(() => {
    if (institutes && institutes.length > 0) {
      setInstituteData([]);
      for (var i = 0; i < institutes.length; i++) {
        Fetch({
          url: "/institute/get-by-instituteid",
          method: "POST",
          data: { institute_id: institutes[i].institute_id },
        }).then((res) => {
          if (res && res.status === 200) {
            appendToUsers(res.data);
          } else {
            toast("Error fetching institute details. Please retry.", {
              type: "error",
            });
          }
        });
      }
    }
  }, [institutes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-institutes",
          method: "GET",
        });
        console.log(response.data.userInstituteData);
        const sortedUsers = response.data.userInstituteData.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });

        setInstitutes(sortedUsers);
        setCompleted(true);
      } catch (err) {
        toast("Error fetching institutes. Please try again.", {
          type: "error",
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(
      instituteData.filter((institute) =>
        institute.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, instituteData]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const downloadCSV = () => {
    const csvHeaders = "Institute Name,Email,Phone,Address\n";
    const csvRows = instituteData.map(
      (institute) =>
        `${institute.name || "N/A"},${institute.email || "N/A"},${institute.phone || "N/A"},${
          institute.address1 || ""
        } ${institute.address2 || ""}`
    );
    const csvContent = csvHeaders + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "institutes.csv");
  };

  const getTeacherNames = (instituteId) => {
    const teachersData = teacherData.find((data) => data[instituteId]);
    if (teachersData) {
      const teachers = teachersData[instituteId];
      return teachers.map((teacher) => teacher.user.name).join(", ");
    }
    return "No teachers available";
  };

  return (
    <AdminPageWrapper heading="Member Management - Institutes">
      <Box sx={{ padding: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <TextField
            label="Search Institutes"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flex: 1, marginRight: 2 }}
          />
          <Button variant="contained" color="primary" onClick={downloadCSV}>
            Download CSV
          </Button>
        </Box>
        {completed ? (
          filteredData.length > 0 ? (
            <Card sx={{ padding: 2 }}>
              {filteredData.map((institute) => (
                <Accordion key={institute.institute_id}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${institute.institute_id}-content`}
                    id={`panel-${institute.institute_id}-header`}
                  >
                    <Typography variant="h6">
                      {institute.name || "Unknown Institute"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ marginLeft: 2 }}
                    >
                      {`${institute.address1 || ""} ${institute.address2 || ""}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <strong>Email ID:</strong>{" "}
                      {institute.email || "Not Available"}
                      <br />
                      <strong>Phone:</strong>{" "}
                      {institute.phone || "Not Available"}
                      <br />
                      <strong>Teachers:</strong>{" "}
                      {getTeacherNames(institute.institute_id)}
                      <br />
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Card>
          ) : (
            <Typography>No institutes match the search criteria</Typography>
          )
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(Institutes, ROLE_ROOT);
