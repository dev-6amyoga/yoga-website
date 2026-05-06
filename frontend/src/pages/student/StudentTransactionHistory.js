import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import html2pdf from "html2pdf.js";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0) / 100);

const formatDate = (value) => {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const isSuccessful = (status) =>
  ["successful", "succeeded", "captured", "paid"].includes(
    String(status || "").toLowerCase(),
  );

function StudentTransactionHistory() {
  const user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const downloadATag = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await Fetch({
          url: "/transaction/get-transaction-by-user-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });

        const nextTransactions =
          response.data?.all_transaction_for_user || [];
        nextTransactions.sort(
          (a, b) => new Date(b.payment_date) - new Date(a.payment_date),
        );
        setTransactions(nextTransactions);
      } catch (error) {
        toast.error("Could not load transaction history");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((transaction) =>
      [
        transaction.transaction_order_id,
        transaction.payment_status,
        transaction.payment_date,
        transaction.amount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, transactions]);

  const successfulTransactions = transactions.filter((transaction) =>
    isSuccessful(transaction.payment_status),
  );

  const totalPaid = successfulTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  const handleDownload = (data) => {
    if (!data.length) {
      toast.info("No transactions to download");
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    downloadATag.current.setAttribute("href", url);
    downloadATag.current.setAttribute("download", "6amyoga-transactions.csv");
    downloadATag.current.click();
    URL.revokeObjectURL(url);
  };

  const downloadInvoice = async (transaction) => {
    setInvoiceLoadingId(transaction.transaction_order_id);
    try {
      const response = await Fetch({
        url: "/invoice/student/plan",
        method: "POST",
        responseType: "arraybuffer",
        data: JSON.stringify({
          user_id: transaction.user_id,
          transaction_order_id: transaction.transaction_order_id,
        }),
      });

      const dataBuffer = new Blob([response.data], {
        type: "text/html;charset=utf-8;",
      });
      const htmlString = await dataBuffer.text();

      await html2pdf()
        .set({
          margin: 0.25,
          image: { type: "png", quality: 1 },
          html2canvas: { scale: 0.85 },
          jsPDF: {
            unit: "in",
            format: "A4",
            orientation: "portrait",
          },
        })
        .from(htmlString)
        .toPdf()
        .save(`6AMYOGA_invoice_${transaction.transaction_order_id}.pdf`);
    } catch (error) {
      toast.error("Could not download invoice");
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  return (
    <StudentPageWrapper>
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Transaction History
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review payments, download invoices, and export your records.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total paid
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {formatCurrency(totalPaid)}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Successful payments
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {successfulTransactions.length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  All transactions
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {transactions.length}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
              >
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transaction ID, status, or date"
                  size="small"
                  sx={{ maxWidth: { md: 420 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  onClick={() => handleDownload(filteredTransactions)}
                >
                  Download CSV
                </Button>
              </Stack>

              <Box
                component="a"
                className="hidden"
                href="#"
                ref={downloadATag}
                target="_blank"
                rel="noreferrer"
              />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : filteredTransactions.length === 0 ? (
                <Alert severity="info" sx={{ mt: 3 }}>
                  No transactions found.
                </Alert>
              ) : (
                <TableContainer sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment Date</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Invoice</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow
                          key={transaction.transaction_order_id}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell>{formatDate(transaction.payment_date)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {transaction.transaction_order_id}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={transaction.payment_status || "unknown"}
                              color={
                                isSuccessful(transaction.payment_status)
                                  ? "success"
                                  : "default"
                              }
                              variant={
                                isSuccessful(transaction.payment_status)
                                  ? "filled"
                                  : "outlined"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip
                              title={
                                isSuccessful(transaction.payment_status)
                                  ? "Download invoice"
                                  : "Invoice is available after successful payment"
                              }
                            >
                              <span>
                                <IconButton
                                  color="primary"
                                  disabled={
                                    invoiceLoadingId ===
                                      transaction.transaction_order_id ||
                                    !isSuccessful(transaction.payment_status)
                                  }
                                  onClick={() => downloadInvoice(transaction)}
                                >
                                  {invoiceLoadingId ===
                                  transaction.transaction_order_id ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <ReceiptLongIcon />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </StudentPageWrapper>
  );
}

export default withAuth(StudentTransactionHistory, ROLE_STUDENT);
