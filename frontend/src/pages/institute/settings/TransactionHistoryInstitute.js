import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import { toast } from "react-toastify";
import { Table, Grid, Button } from "@geist-ui/core";
import InstituteNavbar from "../../../components/Common/InstituteNavbar/InstituteNavbar";
export default function TransactionHistoryInstitute() {
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
            body: JSON.stringify({ user_id: user.user_id }),
          }
        );
        const data = await response.json();
        console.log(data);
        setTransactions(data["all_transaction_for_user"]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [user.user_id]);

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
        <InstituteNavbar />
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="elements">
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
