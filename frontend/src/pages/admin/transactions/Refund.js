import { Button, Spacer, Tag } from "@geist-ui/core";
import { MoreHorizontal } from "@geist-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from "date-fns";

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

// function RefundManagement() {
//   const {
//     isLoading,
//     data: transactions,
//     error,
//     refetch: getTransactions,
//   } = useQuery({
//     queryKey: ["transactions"],
//     queryFn: async () => {
//       const res = await Fetch({
//         url: "/transaction/get-all",
//         method: "GET",
//         token: true,
//       });

//       return res?.data?.transactions;
//     },
//   });

//   const [customUserPlans, setCustomUserPlans] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await Fetch({
//         url: "/customUserPlan/getAllCustomUserPlans",
//         method: "GET",
//         token: true,
//       });
//       setCustomUserPlans(res.data.plans);
//     };
//     fetchData();
//   }, []);

//   const [transactionModal, setTransactionModal] = useState({
//     open: false,
//     data: null,
//   });

//   const [userModal, setUserModal] = useState({
//     open: false,
//     data: null,
//   });

//   const [userPlanModal, setUserPlanModal] = useState({
//     open: false,
//     data: null,
//   });

//   const [refundModal, setRefundModal] = useState({
//     open: false,
//     data: null,
//   });

//   const toggleTransactionModal = (data = null) => {
//     setTransactionModal((prev) => ({
//       open: !prev.open,
//       data,
//     }));
//   };

//   const toggleUserModal = (data = null) => {
//     setUserModal((prev) => ({
//       open: !prev.open,
//       data,
//     }));
//   };

//   const toggleUserPlanModal = (data = null) => {
//     setUserPlanModal((prev) => ({
//       open: !prev.open,
//       data,
//     }));
//   };

//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);

//   const handleDownload = (data1) => {
//     const filteredData = data1.filter((row) => {
//       const paymentDate = parseISO(row.payment_date);
//       return paymentDate >= startDate && paymentDate <= endDate;
//     });

//     const updatedData = filteredData.map((row) => {
//       const amount =
//         parseFloat(row.amount) / 100 || 0 - 2 * (amount * 0.09).toFixed(2);
//       const cgst = (amount * 0.09).toFixed(2);
//       const sgst = (amount * 0.09).toFixed(2);
//       const name = row.user?.name || "Unknown";
//       return { ...row, name, amount: amount.toFixed(2), cgst, sgst };
//     });

//     const csv = Papa.unparse(updatedData);
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", "filtered_data.csv");
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   // Filter transactions by selected date range
//   const filteredTransactions = useMemo(() => {
//     if (!startDate || !endDate) return transactions;
//     return transactions?.filter((row) => {
//       const paymentDate = parseISO(row?.payment_date);
//       return paymentDate >= startDate && paymentDate <= endDate;
//     });
//   }, [transactions, startDate, endDate]);

//   const toggleRefundModal = (data = null) => {
//     setRefundModal((prev) => ({
//       open: !prev.open,
//       data,
//     }));
//   };

//   const columnsDataTable = useMemo(
//     () => [
//       // {
//       //   accessorKey: "transaction_id",
//       //   header: ({ column }) => (
//       //     <SortableColumn column={column}>Transaction ID</SortableColumn>
//       //   ),
//       // },
//       {
//         accessorKey: "name",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Name</SortableColumn>
//         ),
//         cell: ({ row }) => {
//           return row?.original?.user?.name;
//         },
//       },
//       {
//         accessorKey: "payment_for",
//         header: "Payment For",
//       },
//       {
//         accessorKey: "payment_method",
//         header: "Payment Method",
//       },
//       {
//         accessorKey: "payment_status",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Payment Status</SortableColumn>
//         ),
//         cell: ({ getValue }) => {
//           const value = getValue();
//           switch (value) {
//             case TRANSACTION_SUCCESS:
//               return <Tag type="success">Success</Tag>;
//             case TRANSACTION_FAILED:
//               return <Tag type="error">Failed</Tag>;
//             case TRANSACTION_CANCELLED:
//               return <Tag type="warning">Cancelled</Tag>;
//             case TRANSACTION_TIMEOUT:
//               return <Tag type="warning">Timeout</Tag>;
//             default:
//               return <Tag>---</Tag>;
//           }
//         },
//       },
//       {
//         accessorKey: "amount",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Amount</SortableColumn>
//         ),
//         cell: ({ row }) => {
//           const formatted = new Intl.NumberFormat("en-IN", {
//             currency: row?.original?.currency?.short_tag || "INR",
//             style: "currency",
//           }).format(row?.original?.amount / 100);

//           return formatted;
//         },
//       },
//       {
//         accessorKey: "payment_date",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Date</SortableColumn>
//         ),
//         cell: ({ row }) => {
//           return new Date(row?.original?.payment_date).toLocaleString();
//         },
//       },
//       {
//         accessorKey: "discount_coupon",
//         header: "Discount Coupon",
//         cell: ({ row }) => {
//           return (
//             <>
//               {row?.original?.discount_coupon ? (
//                 <Accordion title="Discount Coupon">
//                   <pre>{row.original.discount_coupon}</pre>
//                 </Accordion>
//               ) : (
//                 <p>---</p>
//               )}
//             </>
//           );
//         },
//       },
//       {
//         accessorKey: "user_plan",
//         header: "User Plan",
//         cell: ({ row }) => {
//           return (
//             <>
//               {row?.original?.user_plan && row?.original?.user_plan?.plan ? (
//                 <Tag type="success">Mapped</Tag>
//               ) : row?.original?.payment_status === TRANSACTION_SUCCESS ? (
//                 <Tag type="warning">Unmapped</Tag>
//               ) : (
//                 <p>---</p>
//               )}
//             </>
//           );
//         },
//       },
//       {
//         accessorKey: "actions",
//         header: "Actions",
//         cell: ({ row }) => {
//           return (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="h-8 w-8 p-0"
//                   auto
//                   scale={0.3}
//                   icon={<MoreHorizontal className="h-4 w-4" />}
//                 >
//                   {/* <span className="sr-only">Open menu</span> */}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                 <DropdownMenuItem
//                   onClick={() => {
//                     navigator.clipboard.writeText(
//                       row?.original.transaction_payment_id
//                     );
//                     toast("Copied to clipboard!");
//                   }}
//                 >
//                   Copy payment ID
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={() => toggleTransactionModal(row?.original)}
//                 >
//                   View Transaction Info
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => toggleUserModal(row?.original)}
//                 >
//                   View User
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   onClick={() => toggleUserPlanModal(row?.original)}
//                 >
//                   View User Plan
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={() => toggleRefundModal(row?.original)}
//                 >
//                   Refund Payment
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           );
//         },
//       },
//     ],
//     []
//   );

//   return (
//     <AdminPageWrapper heading="All Transactions">
//       {/* Date Range Pickers */}
//       <div style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
//         <DatePicker
//           selected={startDate}
//           onChange={(date) => setStartDate(date)}
//           selectsStart
//           startDate={startDate}
//           endDate={endDate}
//           placeholderText="Start Date"
//         />
//         <DatePicker
//           selected={endDate}
//           onChange={(date) => setEndDate(date)}
//           selectsEnd
//           startDate={startDate}
//           endDate={endDate}
//           minDate={startDate}
//           placeholderText="End Date"
//         />
//       </div>

//       <br />
//       {/* Button to download filtered CSV */}
//       <Button onClick={() => handleDownload(filteredTransactions)}>
//         Download CSV
//       </Button>

//       <div>
//         <TransactionModal
//           open={transactionModal.open || false}
//           data={transactionModal.data || null}
//           handleClose={toggleTransactionModal}
//         />
//         <UserModal
//           open={userModal.open || false}
//           data={userModal.data || null}
//           handleClose={toggleUserModal}
//         />
//         <UserPlanModal
//           open={userPlanModal.open || false}
//           data={userPlanModal.data || customUserPlans || null}
//           handleClose={toggleUserPlanModal}
//         />
//         <RefundModal
//           open={refundModal.open || false}
//           data={refundModal.data || null}
//           handleClose={toggleRefundModal}
//         />
//         <div className="max-w-7xl">
//           <DataTable
//             columns={columnsDataTable}
//             data={filteredTransactions || []}
//             refetch={getTransactions}
//           ></DataTable>
//         </div>
//       </div>
//     </AdminPageWrapper>
//   );
// }

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

      return res?.data?.transactions;
    },
  });

  const [customUserPlans, setCustomUserPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const columnsDataTable = useMemo(
    () => [
      // {
      //   accessorKey: "transaction_id",
      //   header: ({ column }) => (
      //     <SortableColumn column={column}>Transaction ID</SortableColumn>
      //   ),
      // },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableColumn column={column}>Name</SortableColumn>
        ),
        cell: ({ row }) => {
          return row?.original?.user?.name;
        },
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
          <SortableColumn column={column}>Payment Status</SortableColumn>
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
          return new Date(row?.original?.payment_date).toLocaleString();
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
        accessorKey: "user_plan",
        header: "User Plan",
        cell: ({ row }) => {
          return (
            <>
              {row?.original?.user_plan && row?.original?.user_plan?.plan ? (
                <Tag type="success">Mapped</Tag>
              ) : row?.original?.payment_status === TRANSACTION_SUCCESS ? (
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
                  icon={<MoreHorizontal className="h-4 w-4" />}
                >
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
                  }}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toggleTransactionModal(row?.original)}
                >
                  View Transaction Info
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleUserModal(row?.original)}
                >
                  View User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleUserPlanModal(row?.original)}
                >
                  View User Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toggleRefundModal(row?.original)}
                >
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await Fetch({
        url: "/customUserPlan/getAllCustomUserPlans",
        method: "GET",
        token: true,
      });
      setCustomUserPlans(res.data.plans);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredTransactions(transactions); // Initialize with all transactions
  }, [transactions]);

  const handleFilter = () => {
    const filteredData = transactions.filter((transaction) => {
      const matchesDate =
        (!startDate || parseISO(transaction.payment_date) >= startDate) &&
        (!endDate || parseISO(transaction.payment_date) <= endDate);
      const matchesSearchTerm = searchTerm
        ? transaction?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      return matchesDate && matchesSearchTerm;
    });

    setFilteredTransactions(filteredData);
  };

  const handleDownload = () => {
    const csv = Papa.unparse(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "filtered_transactions.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AdminPageWrapper heading="All Transactions">
      {/* Search and Date Range Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "20px",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#f9f9f9",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          type="text"
          placeholder="Search by user name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "200px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
        <div
          style={{ display: "flex", gap: "10px", flex: "1", minWidth: "300px" }}
        >
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            popperPlacement="top-start"
            style={{
              flex: "1",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />

          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            style={{
              flex: "1",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>
        <Button
          onClick={handleFilter}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Filter
        </Button>
      </div>

      <Button onClick={handleDownload}>Download CSV</Button>
      <Spacer h={10} />
      <div>
        <div className="max-w-7xl">
          <DataTable
            columns={columnsDataTable}
            data={filteredTransactions || []}
            refetch={getTransactions}
          ></DataTable>
        </div>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(RefundManagement, ROLE_ROOT);
