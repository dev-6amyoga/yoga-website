import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import { Table, Grid, Button } from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import Papa from "papaparse";

export default function StudentTransactionHistory() {
  let user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/transaction/get-transaction-by-user-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.user_id }),
          }
        );
        const data = await response.json();
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
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const renderAction = (value, rowData, index) => {
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 3}
            font="12px"
            //   onClick={subscribePlan}
          >
            Download Invoice
          </Button>
        </Grid>
      </Grid.Container>
    );
  };
  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="elements">
          <Button
            onClick={() => {
              handleDownload(transactions);
            }}
          >
            Download CSV
          </Button>
          <br />
          <Table width={100} data={transactions} className="bg-white ">
            <Table.Column
              prop="payment_date"
              label="Payment Date"
              render={(data) => {
                return Date(data);
              }}
            />
            <Table.Column
              prop="amount"
              label="Amount Paid"
              render={(data) => {
                return "Rs." + String(data / 100);
              }}
            />
            <Table.Column prop="payment_method" label="Payment Method" />
            <Table.Column prop="payment_status" label="Payment Status" />
            <Table.Column
              prop="transaction_order_id"
              label="Transaction Order ID"
            />
            <Table.Column
              prop="transaction_payment_id"
              label="Transaction Payment ID"
            />
            <Table.Column
              prop="operation"
              label="Download Invoice"
              width={150}
              render={renderAction}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}
