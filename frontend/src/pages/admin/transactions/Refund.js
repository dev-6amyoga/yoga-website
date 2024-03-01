import { Button, Tag } from "@geist-ui/core";
import { MoreHorizontal } from "@geist-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
	TRANSACTION_CANCELLED,
	TRANSACTION_FAILED,
	TRANSACTION_SUCCESS,
	TRANSACTION_TIMEOUT,
} from "../../../enums/transaction_status";
import { Fetch } from "../../../utils/Fetch";

import RefundModal from "../../../components/admin/refund-management/RefundModal";
import TransactionModal from "../../../components/admin/refund-management/TransactionModal";
import UserModal from "../../../components/admin/refund-management/UserModal";
import UserPlanModal from "../../../components/admin/refund-management/UserPlanModal";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";

function Accordion({ title, children }) {
	const [view, setView] = useState(false);

	return (
		<div className="py-1 flex flex-col gap-2">
			<div className="flex items-center gap-4 justify-between">
				{/* <strong>{title}</strong> */}
				<Button scale={0.3} auto onClick={() => setView((p) => !p)}>
					{view ? "Close" : "View"}
				</Button>
			</div>
			{view ? <>{children}</> : <></>}
		</div>
	);
}

function RefundManagement() {
	const {
		isLoading,
		data: transactions,
		error,
		refetch: getTransactions,
	} = useQuery({
		queryKey: ["transactions"],
		queryFn: async () => {
			const res = await Fetch({
				url: "/transaction/get-all",
				method: "GET",
				token: true,
			});

			console.log({ ts: res?.data?.transactions });

			return res?.data?.transactions;
		},
	});

	const [transactionModal, setTransactionModal] = useState({
		open: false,
		data: null,
	});

	const [userModal, setUserModal] = useState({
		open: false,
		data: null,
	});

	const [userPlanModal, setUserPlanModal] = useState({
		open: false,
		data: null,
	});

	const [refundModal, setRefundModal] = useState({
		open: false,
		data: null,
	});

	const toggleTransactionModal = (data = null) => {
		setTransactionModal((prev) => ({
			open: !prev.open,
			data,
		}));
	};

	const toggleUserModal = (data = null) => {
		setUserModal((prev) => ({
			open: !prev.open,
			data,
		}));
	};

	const toggleUserPlanModal = (data = null) => {
		setUserPlanModal((prev) => ({
			open: !prev.open,
			data,
		}));
	};

	const toggleRefundModal = (data = null) => {
		setRefundModal((prev) => ({
			open: !prev.open,
			data,
		}));
	};

	const columnsDataTable = useMemo(
		() => [
			{
				accessorKey: "transaction_id",
				header: ({ column }) => (
					<SortableColumn column={column}>
						Transaction ID
					</SortableColumn>
				),
			},
			{
				accessorKey: "payment_for",
				header: "Payment For",
			},
			{
				accessorKey: "payment_method",
				header: "Payment Method",
			},
			{
				accessorKey: "payment_status",
				header: ({ column }) => (
					<SortableColumn column={column}>
						Payment Status
					</SortableColumn>
				),
				cell: ({ getValue }) => {
					const value = getValue();
					switch (value) {
						case TRANSACTION_SUCCESS:
							return <Tag type="success">Success</Tag>;
						case TRANSACTION_FAILED:
							return <Tag type="error">Failed</Tag>;
						case TRANSACTION_CANCELLED:
							return <Tag type="warning">Cancelled</Tag>;
						case TRANSACTION_TIMEOUT:
							return <Tag type="warning">Timeout</Tag>;
						default:
							return <Tag>---</Tag>;
					}
				},
			},
			{
				accessorKey: "amount",
				header: ({ column }) => (
					<SortableColumn column={column}>Amount</SortableColumn>
				),
				cell: ({ row }) => {
					const formatted = new Intl.NumberFormat("en-IN", {
						currency: row?.original?.currency?.short_tag || "INR",
						style: "currency",
					}).format(row?.original?.amount / 100);

					return formatted;
				},
			},
			{
				accessorKey: "payment_date",
				header: ({ column }) => (
					<SortableColumn column={column}>Date</SortableColumn>
				),
				cell: ({ row }) => {
					return new Date(
						row?.original?.payment_date
					).toLocaleString();
				},
			},
			{
				accessorKey: "discount_coupon",
				header: "Discount Coupon",
				cell: ({ row }) => {
					return (
						<>
							{row?.original?.discount_coupon ? (
								<Accordion title="Discount Coupon">
									<pre>{row.original.discount_coupon}</pre>
								</Accordion>
							) : (
								<p>---</p>
							)}
						</>
					);
				},
			},
			{
				accessorKey: "referral_code",
				header: "Referral Code",
				cell: ({ row }) => {
					return (
						<>
							{row?.original?.referral_code ? (
								<Accordion title="">
									<pre>{row.referral_code}</pre>
								</Accordion>
							) : (
								<p>---</p>
							)}
						</>
					);
				},
			},
			{
				accessorKey: "user_plan",
				header: "User Plan",
				cell: ({ row }) => {
					return (
						<>
							{row?.original?.user_plan &&
							row?.original?.user_plan?.plan ? (
								<Tag type="success">Mapped</Tag>
							) : row?.original?.payment_status ===
							  TRANSACTION_SUCCESS ? (
								<Tag type="warning">Unmapped</Tag>
							) : (
								<p>---</p>
							)}
						</>
					);
				},
			},
			{
				accessorKey: "actions",
				header: "Actions",
				cell: ({ row }) => {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0"
									auto
									scale={0.3}
									icon={
										<MoreHorizontal className="h-4 w-4" />
									}>
									{/* <span className="sr-only">Open menu</span> */}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(
											row?.original.transaction_payment_id
										);
										toast("Copied to clipboard!");
									}}>
									Copy payment ID
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() =>
										toggleTransactionModal(row?.original)
									}>
									View Transaction Info
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										toggleUserModal(row?.original)
									}>
									View User
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										toggleUserPlanModal(row?.original)
									}>
									View User Plan
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() =>
										toggleRefundModal(row?.original)
									}>
									Refund Payment
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[]
	);

	return (
		<AdminPageWrapper heading="Refund Management">
			<div>
				<TransactionModal
					open={transactionModal.open || false}
					data={transactionModal.data || null}
					handleClose={toggleTransactionModal}
				/>
				<UserModal
					open={userModal.open || false}
					data={userModal.data || null}
					handleClose={toggleUserModal}
				/>
				<UserPlanModal
					open={userPlanModal.open || false}
					data={userPlanModal.data || null}
					handleClose={toggleUserPlanModal}
				/>
				<RefundModal
					open={refundModal.open || false}
					data={refundModal.data || null}
					handleClose={toggleRefundModal}
				/>
				<div className="max-w-7xl">
					<DataTable
						columns={columnsDataTable}
						data={transactions || []}
						refetch={getTransactions}></DataTable>
				</div>
			</div>
		</AdminPageWrapper>
	);
}

export default withAuth(RefundManagement, ROLE_ROOT);
