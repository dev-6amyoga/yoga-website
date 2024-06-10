import { Button, Grid, Spacer } from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import { Typography, CssBaseline } from "@mui/material";
import Hero from "./components/Hero";
export default function StudentTransactionHistory() {
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
        setTransactions(data["all_transaction_for_user"]);
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
            type="error"
            auto
            scale={1 / 3}
            font="12px"
            disabled={
              loading || rowData?.original?.payment_status !== "succeeded"
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
      // {
      //   accessorKey: "payment_date",
      //   header: ({ column }) => (
      //     <SortableColumn column={column} sx={{ width: "80px" }}>
      //       Payment Date
      //     </SortableColumn>
      //   ),
      // },
      {
        accessorKey: "payment_date",
        header: ({ column }) => (
          <SortableColumn column={column} sx={{ width: "70px" }}>
            Payment Date
          </SortableColumn>
        ),
        cell: ({ row }) => (
          <div
            style={{
              width: "80px",
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.original.payment_date}
          </div>
        ),
      },
      {
        accessorKey: "transaction_order_id",
        header: ({ column }) => (
          <SortableColumn column={column}>Transaction Order ID</SortableColumn>
        ),
      },
      {
        accessorKey: "transaction_payment_id",
        header: ({ column }) => (
          <SortableColumn column={column} sx={{ width: "20px" }}>
            Transaction Payment ID
          </SortableColumn>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <SortableColumn column={column}>Amount</SortableColumn>
        ),
      },
      {
        accessorKey: "payment_method",
        header: ({ column }) => (
          <SortableColumn column={column}>Payment Method</SortableColumn>
        ),
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
      <div className="flex flex-col items-center justify-center py-0">
        <Spacer h={1} />
        <a
          className="hidden"
          href="#"
          ref={downloadATag}
          target="_blank"
          rel="noreferer"
        ></a>
        <div className="elements">
          <Button
            onClick={() => {
              handleDownload(transactions);
            }}
          >
            Download CSV
          </Button>
          <br />
          <div className="max-w-7xl">
            <DataTable
              columns={columnsDataTable}
              data={transactions || []}
            ></DataTable>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
