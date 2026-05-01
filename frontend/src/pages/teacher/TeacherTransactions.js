import { Grid } from "@geist-ui/core";
import { Box, Button, Container, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import html2pdf from "html2pdf.js";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import { ROLE_TEACHER } from "../../enums/roles";
import useUserStore from "../../store/UserStore";

import Hero from "../student/components/Hero";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { getTransactions, exportTransactions } from "../../api/teacherApi";
import { withAuth } from "../../utils/withAuth";
import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";

function TeacherTransactions() {
  let user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const downloadATag = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTransactions(1, 50, "all", "all", "");
        setTransactions(response?.transactions || []);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDownload = async () => {
    try {
      const blob = await exportTransactions("all");
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" }),
      );
      downloadATag.current.setAttribute("href", url);
      downloadATag.current.setAttribute(
        "download",
        `teacher-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      downloadATag.current.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting teacher transactions:", error);
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
        type: "text/html;charset=utf-8;",
      });
      const htmlString = await dataBuffer.text();

      var opt = {
        margin: 0.25,
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 0.85 },
        jsPDF: {
          unit: "in",
          format: "A4",
          orientation: "portrait",
        },
      };

      const doc = html2pdf()
        .set(opt)
        .from(htmlString)
        .toPdf()
        .save("6AMYOGA_plan_purchase.pdf");

      setLoading(false);
    } catch (err) {
      toast(err);
      console.error(err);
      setLoading(false);
    }
  };

  const RenderAction = (value, rowData, index) => {
    const [loading, setLoading] = useState(false);
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            disabled={
              loading ||
              (rowData?.original?.payment_status !== "successful" &&
                rowData?.original?.payment_status !== "succeeded")
            }
            loading={loading}
            onClick={() => {
              subscribePlan(rowData, setLoading);
            }}
          >
            <CloudDownloadIcon />
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
    [],
  );

  const [mode, setMode] = useState("light");

  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <TeacherNavbar />
      <Hero heading="Transaction History" />
      <Container maxWidth="lg">
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
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
          <Box my={1}>
            <Button
              variant="contained"
              // color="secondary"
              onClick={() => {
                handleDownload(transactions);
              }}
            >
              Download CSV
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default withAuth(TeacherTransactions, ROLE_TEACHER);
