import { Button, Grid } from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";

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
			// downloadATag.current.style.visibility = "hidden";
			downloadATag.current.click();
		}
	};

	const subscribePlan = async (rowData, setLoading) => {
		console.log(
			rowData.original.user_id,
			rowData.original.transaction_order_id
		);
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
			// console.log(typeof response.data);
			const dataBuffer = new Blob([response.data], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(dataBuffer);
			console.log(downloadATag.current);

			downloadATag.current.setAttribute("href", url);
			downloadATag.current.setAttribute(
				"download",
				`6AMYOGA_plan_purchase_${rowData.transaction_order_id}.pdf`
			);
			downloadATag.current.click();
			// console.log("DONE!", dataBuffer);
			setLoading(false);
		} catch (err) {
			console.log(err);
			toast(err);
			setLoading(false);
		}
		// setLoading(false)
	};

	const RenderAction = (value, rowData, index) => {
		const [loading, setLoading] = useState(false);
		console.log("RENDER ACTIONS : ", rowData);
		return (
			<Grid.Container gap={0.1}>
				<Grid>
					<Button
						type="error"
						auto
						scale={1 / 3}
						font="12px"
						disabled={
							loading ||
							rowData?.original?.payment_status !== "succeeded"
						}
						loading={loading}
						onClick={() => {
							subscribePlan(rowData, setLoading);
						}}>
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
					<SortableColumn column={column}>
						Payment Date
					</SortableColumn>
				),
			},
			{
				accessorKey: "transaction_order_id",
				header: ({ column }) => (
					<SortableColumn column={column}>
						Transaction Order ID
					</SortableColumn>
				),
			},
			{
				accessorKey: "transaction_payment_id",
				header: ({ column }) => (
					<SortableColumn column={column}>
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
					<SortableColumn column={column}>
						Payment Method
					</SortableColumn>
				),
			},
			{
				accessorKey: "payment_status",
				header: ({ column }) => (
					<SortableColumn column={column}>
						Payment Status
					</SortableColumn>
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

	return (
		<StudentPageWrapper heading="Transaction History">
			<div className="flex flex-col items-center justify-center py-20">
				<a
					className="hidden"
					href="#"
					ref={downloadATag}
					target="_blank"
					rel="noreferer"></a>
				<div className="elements">
					<Button
						onClick={() => {
							handleDownload(transactions);
						}}>
						Download CSV
					</Button>
					<br />
					<div className="max-w-7xl">
						<DataTable
							columns={columnsDataTable}
							data={transactions || []}></DataTable>
					</div>
				</div>
			</div>
		</StudentPageWrapper>
	);
}

{
	/* 
          <Table width={100} data={transactions} className="bg-white ">
            <Table.Column
              prop="payment_date"
              label="Payment Date"
              // render={(data) => {
              //   return Intl.DateTimeFormat("en-US", {
              //     timeZone: "Asia/Kolkata",
              //   }).format(Date(data));
              // }}
              render={(data) => {
                Date(data);
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
              render={RenderAction}
            />
          </Table>
           */
}
