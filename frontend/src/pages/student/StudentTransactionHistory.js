import { Grid } from "@geist-ui/core";
import { Box, Button, Container, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import Hero from "./components/Hero";

function StudentTransactionHistory() {
  let user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const downloadATag = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/transaction/get-transaction-by-user-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const data = response.data;
        console.log("data of transac :", data);
        data.all_transaction_for_user.sort(
          (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
        );
        setTransactions(data.all_transaction_for_user);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      downloadATag.current.setAttribute("href", url);
      downloadATag.current.setAttribute("download", "data.csv");
      downloadATag.current.click();
    }
  };

  const subscribePlan = async (rowData, setLoading) => {
    try {
      setLoading(true);
      const response = await Fetch({
        url: "/invoice/student/plan",
        method: "POST",
        responseType: "arraybuffer",
        data: JSON.stringify({
          user_id: rowData.original.user_id,
          transaction_order_id: rowData.original.transaction_order_id,
        }),
      });
      const dataBuffer = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(dataBuffer);
      downloadATag.current.setAttribute("href", url);
      downloadATag.current.setAttribute(
        "download",
        `6AMYOGA_plan_purchase_${rowData.transaction_order_id}.pdf`
      );
      downloadATag.current.click();
      setLoading(false);
    } catch (err) {
      toast(err);
      setLoading(false);
    }
  };

  const RenderAction = (value, rowData, index) => {
    const [loading, setLoading] = useState(false);
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            disabled={
              loading || rowData?.original?.payment_status !== "successful"
            }
            loading={loading}
            onClick={() => {
              subscribePlan(rowData, setLoading);
            }}
          >
            Download Invoice
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "payment_date",
        header: ({ column }) => (
          <SortableColumn column={column}>Payment Date</SortableColumn>
        ),
      },

      {
        accessorKey: "transaction_order_id",
        header: ({ column }) => (
          <SortableColumn column={column}>Transaction Order ID</SortableColumn>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableColumn column={column}>Amount</SortableColumn>
        ),
        cell: ({ row }) => {
          const amount = row.original.amount;
          const formattedAmount = `Rs. ${(amount / 100).toFixed(2)}`;
          return <div>{formattedAmount}</div>;
        },
      },
      {
        accessorKey: "payment_status",
        header: ({ column }) => (
          <SortableColumn column={column}>Payment Status</SortableColumn>
        ),
      },
      {
        accessorKey: "operation",
        header: "Actions",
        cell: ({ row }) => {
          return RenderAction(null, row, null);
        },
      },
    ],
    []
  );

  const [mode, setMode] = useState("light");

  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="Transaction History" />
      <Container maxWidth="lg">
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
          <Box my={1}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                handleDownload(transactions);
              }}
            >
              Download CSV
            </Button>
          </Box>
          <a
            className="hidden"
            href="#"
            ref={downloadATag}
            target="_blank"
            rel="noreferer"
          ></a>
          <Box width="100%" my={4}>
            <DataTable columns={columnsDataTable} data={transactions || []} />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default withAuth(StudentTransactionHistory, ROLE_STUDENT);
