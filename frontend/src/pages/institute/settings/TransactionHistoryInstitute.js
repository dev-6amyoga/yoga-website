import { Button, Grid, Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
import InstituteNavbar from "../../../components/Common/InstituteNavbar/InstituteNavbar";
import { ROLE_INSTITUTE_OWNER } from "../../../enums/roles";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import Papa from "papaparse";

function TransactionHistoryInstitute() {
  let user = useUserStore((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/transaction/get-transaction-by-user-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const data = response.data;
        console.log(data);
        setTransactions(data["all_transaction_for_user"]);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

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

export default withAuth(TransactionHistoryInstitute, ROLE_INSTITUTE_OWNER);
