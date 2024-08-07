import { Button, Table, Tag, useToasts } from "@geist-ui/core";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import AddCouponForm from "../../../components/admin/discount-management/AddCouponForm";
import ApplicablePlansForm from "../../../components/admin/discount-management/ApplicablePlansForm";
import EditCouponForm from "../../../components/admin/discount-management/EditCouponForm";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import Papa from "papaparse";

function DiscountManagement() {
  const [coupons, setCoupons] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [addCouponModal, setAddCouponModal] = useState(false);
  const [editCouponModal, setEditCouponModal] = useState(false);
  const [applicablePlansModal, setApplicablePlansModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState({});
  const { setToast } = useToasts();

  const displayDate = (val) => {
    return new Date(val).toLocaleString();
  };

  const displayValidity = (val, row, idx) => {
    return (
      <div key={"validity-" + idx} className="m-2">
        <Tag>{displayDate(row.validity_from)}</Tag> {"To"}
        <Tag>{displayDate(row.validity_to)}</Tag>
      </div>
    );
  };

  const fetchCoupons = () => {
    Fetch({
      url: "/discount-coupon/get-all",
      method: "POST",
    })
      .then((res) => {
        setCoupons(res.data.discount_coupons);
      })
      .catch((err) => {
        toast("Something went wrong", { type: "error" });
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      Fetch({
        url: "/transaction/get-all-discounted",
        method: "GET",
      })
        .then((res) => {
          for (var i = 0; i !== res.data.transactions.length; i++) {
            let entry = res.data.transactions[i];
            let usage_data = {
              payment_date: entry.payment_date,
              transaction_order_id: entry.transaction_order_id,
              amount: entry.amount,
              currency: entry.currency.short_tag,
              coupon_name: entry.discount_coupon.coupon_name,
              discount_percentage: entry.discount_coupon.discount_percentage,
              name: entry.user.name,
            };
            setUsageHistory((prevUsageHistory) => [
              ...prevUsageHistory,
              usage_data,
            ]);
          }
        })
        .catch((err) => {
          toast("Something went wrong", { type: "error" });
        });
    };
    fetchData();
  }, []);

  const fetchCoupon = (discount_coupon_id) => {
    Fetch({
      url: "/discount-coupon/get-by-id",
      method: "POST",
      data: { discount_coupon_id },
    })
      .then((res) => {
        setEditCoupon(res.data.discount_coupon);
        setCoupons((p) => {
          const idx = p.findIndex(
            (coupon) => coupon.discount_coupon_id === discount_coupon_id
          );
          if (idx === -1) return p;
          p[idx] = res.data.discount_coupon;
          return p;
        });
        toast("Coupon updated", { type: "success" });
      })
      .catch((err) => {
        toast("Error fetching coupon", { type: "error" });
      });
  };

  const handleCouponDelete = (id) => {
    Fetch({
      url: "/discount-coupon/delete",
      method: "DELETE",
      data: { discount_coupon_id: id },
    })
      .then((res) => {
        toast(res.data.message, { type: "success" });
        fetchCoupons();
      })
      .catch((err) => {
        toast(err.response?.data?.message, { type: "error" });
      });
  };

  useEffect(() => {
    if (!addCouponModal || !editCouponModal || !applicablePlansModal) {
      fetchCoupons();
    }
  }, [addCouponModal, editCouponModal, applicablePlansModal]);

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
    <AdminPageWrapper heading="Discount Management">
      <div>
        <div className="my-20">
          <div className="flex justify-between items-center my-5">
            <h2>Coupons</h2>
            <div className="flex flex-row gap-2">
              <Button onClick={() => setAddCouponModal((p) => true)}>
                Add
              </Button>

              <Button onClick={fetchCoupons}>Refresh</Button>

              <AddCouponForm
                visible={addCouponModal}
                setVisible={setAddCouponModal}
              />

              <EditCouponForm
                visible={editCouponModal}
                setVisible={setEditCouponModal}
                coupon={editCoupon}
              />

              <ApplicablePlansForm
                visible={applicablePlansModal}
                setVisible={setApplicablePlansModal}
                coupon={editCoupon}
                getUpdatedCoupon={fetchCoupon}
              />
            </div>
          </div>

          <Table data={coupons}>
            <Table.Column prop="coupon_name" label="Coupon Name" />
            <Table.Column
              prop="coupon_description"
              label="Coupon Description"
              className="max-w-xs break-words break-all"
            />
            <Table.Column
              prop="discount_percentage"
              label="Discount Percentage"
            />
            <Table.Column prop="created" label="Created" render={displayDate} />
            <Table.Column
              prop="validity"
              label="Validity"
              render={displayValidity}
            />
            <Table.Column
              label="Actions"
              render={(val, row, idx) => {
                return (
                  <div
                    className="flex flex-row gap-2"
                    key={"coupon-action-" + idx}
                  >
                    <Button
                      scale={0.7}
                      width={0.7}
                      onClick={() => {
                        setEditCoupon(row);
                        setApplicablePlansModal(true);
                      }}
                    >
                      View Plans
                    </Button>
                    <Button
                      scale={0.7}
                      width={0.7}
                      onClick={() => {
                        setEditCoupon(row);
                        setEditCouponModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="error"
                      scale={0.7}
                      width={0.7}
                      onClick={() => {
                        setToast({
                          id: `delete-${row.discount_coupon_id}`,
                          text: `Are you sure you want to delete discount coupon : ${row.coupon_name}?`,
                          actions: [
                            {
                              name: "Delete",
                              handler: () => {
                                handleCouponDelete(row.discount_coupon_id);
                              },
                            },
                          ],
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                );
              }}
            />
          </Table>
        </div>

        <div className="my-20">
          <div className="flex justify-between items-center my-5">
            <h2>Coupon Usage History</h2>
            <div className="flex flex-row gap-2">
              <Button>Export</Button>
              <Button>Refresh</Button>
            </div>
          </div>

          <div className="my-20">
            <Table data={usageHistory}>
              <Table.Column
                prop="transaction_order_id"
                label="Transaction ID"
              />
              <Table.Column prop="coupon_name" label="Coupon Name" />
              <Table.Column prop="plan_name" label="Plan" />
              <Table.Column prop="name" label="User" />
              <Table.Column
                prop="payment_date"
                label="Transaction Date"
                render={(val) => new Date(val).toLocaleDateString()}
              />
              <Table.Column prop="amount" label="Amount" />
              <Table.Column prop="currency" label="Currency" />
              <Table.Column
                prop="discount_percentage"
                label="Discount Percentage"
                render={(val) => `${val}%`}
              />
            </Table>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}

// function DiscountManagement() {
//   const [coupons, setCoupons] = useState([]);
//   const [usageHistory, setUsageHistory] = useState([]);
//   const [addCouponModal, setAddCouponModal] = useState(false);
//   const [editCouponModal, setEditCouponModal] = useState(false);
//   const [applicablePlansModal, setApplicablePlansModal] = useState(false);
//   const [editCoupon, setEditCoupon] = useState({});

//   const displayDate = (val) => {
//     return new Date(val).toLocaleString();
//   };

//   const displayValidity = (val, row, idx) => {
//     return (
//       <div key={"validity-" + idx} className="m-2">
//         <Chip label={displayDate(row.validity_from)} /> {"To"}
//         <Chip label={displayDate(row.validity_to)} />
//       </div>
//     );
//   };

//   const fetchCoupons = () => {
//     Fetch({
//       url: "/discount-coupon/get-all",
//       method: "POST",
//     })
//       .then((res) => {
//         setCoupons(res.data.discount_coupons);
//       })
//       .catch((err) => {
//         toast("Something went wrong", { appearance: "error" });
//       });
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       Fetch({
//         url: "/transaction/get-all-discounted",
//         method: "GET",
//       })
//         .then((res) => {
//           const usageData = res.data.transactions.map((entry) => ({
//             payment_date: entry.payment_date,
//             transaction_order_id: entry.transaction_order_id,
//             amount: entry.amount,
//             currency: entry.currency.short_tag,
//             coupon_name: entry.discount_coupon.coupon_name,
//             discount_percentage: entry.discount_coupon.discount_percentage,
//             name: entry.user.name,
//           }));
//           setUsageHistory(usageData);
//         })
//         .catch((err) => {
//           toast("Something went wrong", { appearance: "error" });
//         });
//     };
//     fetchData();
//   }, []);

//   const fetchCoupon = (discount_coupon_id) => {
//     Fetch({
//       url: "/discount-coupon/get-by-id",
//       method: "POST",
//       data: { discount_coupon_id },
//     })
//       .then((res) => {
//         setEditCoupon(res.data.discount_coupon);
//         setCoupons((p) => {
//           const idx = p.findIndex(
//             (coupon) => coupon.discount_coupon_id === discount_coupon_id
//           );
//           if (idx === -1) return p;
//           p[idx] = res.data.discount_coupon;
//           return p;
//         });
//         toast("Coupon updated", { appearance: "success" });
//       })
//       .catch((err) => {
//         toast("Error fetching coupon", { appearance: "error" });
//       });
//   };

//   const handleCouponDelete = (id) => {
//     Fetch({
//       url: "/discount-coupon/delete",
//       method: "DELETE",
//       data: { discount_coupon_id: id },
//     })
//       .then((res) => {
//         toast(res.data.message, { appearance: "success" });
//         fetchCoupons();
//       })
//       .catch((err) => {
//         toast(err.response?.data?.message, { appearance: "error" });
//       });
//   };

//   useEffect(() => {
//     if (!addCouponModal || !editCouponModal || !applicablePlansModal) {
//       fetchCoupons();
//     }
//   }, [addCouponModal, editCouponModal, applicablePlansModal]);

//   const handleDownload = (data1) => {
//     const csv = Papa.unparse(data1);
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", "data.csv");
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   return (
//     <AdminPageWrapper heading="Discount Management">
//       <div className="my-20">
//         <div className="flex justify-between items-center my-5">
//           <Typography variant="h6">Coupons</Typography>
//           <div className="flex flex-row gap-2">
//             <Button onClick={() => setAddCouponModal(true)}>Add</Button>
//             <Button onClick={fetchCoupons}>Refresh</Button>
//           </div>
//         </div>

//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Coupon Name</TableCell>
//                 <TableCell>Description</TableCell>
//                 <TableCell>Discount Percentage</TableCell>
//                 <TableCell>Created</TableCell>
//                 <TableCell>Validity</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {coupons.map((row, idx) => (
//                 <TableRow key={row.discount_coupon_id}>
//                   <TableCell>{row.coupon_name}</TableCell>
//                   <TableCell>{row.coupon_description}</TableCell>
//                   <TableCell>{row.discount_percentage}%</TableCell>
//                   <TableCell>{displayDate(row.created)}</TableCell>
//                   <TableCell>{displayValidity(null, row, idx)}</TableCell>
//                   <TableCell>
//                     <div className="flex flex-row gap-2">
//                       <Button
//                         size="small"
//                         onClick={() => {
//                           setEditCoupon(row);
//                           setApplicablePlansModal(true);
//                         }}
//                       >
//                         View Plans
//                       </Button>
//                       <Button
//                         size="small"
//                         onClick={() => {
//                           setEditCoupon(row);
//                           setEditCouponModal(true);
//                         }}
//                       >
//                         Edit
//                       </Button>
//                       <Button
//                         size="small"
//                         color="error"
//                         onClick={() => {
//                           if (
//                             window.confirm(
//                               `Are you sure you want to delete discount coupon : ${row.coupon_name}?`
//                             )
//                           ) {
//                             handleCouponDelete(row.discount_coupon_id);
//                           }
//                         }}
//                       >
//                         Delete
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Add Coupon Modal */}
//         <Dialog open={addCouponModal} onClose={() => setAddCouponModal(false)}>
//           <DialogTitle>Add Coupon</DialogTitle>
//           <DialogContent>
//             <AddCouponForm setVisible={setAddCouponModal} />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setAddCouponModal(false)}>Cancel</Button>
//           </DialogActions>
//         </Dialog>

//         {/* Edit Coupon Modal */}
//         <Dialog
//           open={editCouponModal}
//           onClose={() => setEditCouponModal(false)}
//         >
//           <DialogTitle>Edit Coupon</DialogTitle>
//           <DialogContent>
//             <EditCouponForm
//               coupon={editCoupon}
//               setVisible={setEditCouponModal}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setEditCouponModal(false)}>Cancel</Button>
//           </DialogActions>
//         </Dialog>

//         {/* Applicable Plans Modal */}
//         <Dialog
//           open={applicablePlansModal}
//           onClose={() => setApplicablePlansModal(false)}
//         >
//           <DialogTitle>Applicable Plans</DialogTitle>
//           <DialogContent>
//             <ApplicablePlansForm
//               coupon={editCoupon}
//               getUpdatedCoupon={fetchCoupon}
//               setVisible={setApplicablePlansModal}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setApplicablePlansModal(false)}>
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     </AdminPageWrapper>
//   );
// }

export default withAuth(DiscountManagement, ROLE_ROOT);
