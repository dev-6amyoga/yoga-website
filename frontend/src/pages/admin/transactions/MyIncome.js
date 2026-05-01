import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";
import Papa from "papaparse";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val || 0);

export default function MyIncome({ adminRole = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const downloadCSV = async () => {
    try {
      const res = await Fetch({
        url: "/transaction/gst-transactions",
        method: "GET",
        params: { from, to },
      });

      const rows = res.data.data || [];

      const formatted = rows.map((r) => ({
        Name: r.name,
        Email: r.email,
        Phone: r.phone,
        "Amount (Without GST)": r.amount_without_gst,
        "CGST (2.5%)": r.cgst_2_5,
        "SGST (2.5%)": r.sgst_2_5,
        "Amount (With GST)": r.amount_with_gst,
        "Payment Date": r.payment_date,
        Month: r.month,
        Year: r.year,
      }));

      const csv = Papa.unparse(formatted);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "gst-transactions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download CSV");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await Fetch({
        url: "/transaction/gst-summary",
        method: "GET",
        params: { from, to },
      });
      setData(res.data.data || []);
    } catch (e) {
      setError("Failed to load GST summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const Wrapper = adminRole ? AdminPageWrapper : TeacherPageWrapper;

  return (
    <Wrapper heading="GST Revenue Summary">
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="end">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" fullWidth onClick={fetchData}>
                  Apply
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* CONTENT */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly GST Breakdown
            </Typography>
            <Button variant="outlined" onClick={downloadCSV}>
              Download Detailed CSV
            </Button>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : data.length === 0 ? (
              <Typography>No data available</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Gross Revenue</TableCell>
                      <TableCell align="right">CGST (2.5%)</TableCell>
                      <TableCell align="right">SGST (2.5%)</TableCell>
                      <TableCell align="right">Total GST</TableCell>
                      <TableCell align="right">Net Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.gross_revenue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.cgst_2_5)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.sgst_2_5)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.total_gst)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.net_revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Wrapper>
  );
}
