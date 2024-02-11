import { Button, Divider, Modal, Spacer, Table, Tag } from "@geist-ui/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "react-toastify";
import JsonTable from "../../../components/Common/JsonTable/JsonTable";
import { REFUND_ERROR, REFUND_PROCESSED } from "../../../enums/refund_status";
import { TRANSACTION_SUCCESS } from "../../../enums/transaction_status";
import { Fetch } from "../../../utils/Fetch";

function RefundModal({ data, open, handleClose }) {
  const {
    isLoading,
    data: refundHistory,
    error,
    refetch: getRefundHistory,
  } = useQuery({
    queryKey: ["refund-history", data?.transaction_order_id],
    queryFn: async () => {
      console.log({ transaction_id: data?.transaction_id });
      try {
        const res = await Fetch({
          url: `http://localhost:4000/payment/refund/history`,
          method: "POST",
          data: { transaction_id: data?.transaction_id },
          token: true,
        });
        console.log({ refunds: res?.data?.refunds });
        return res?.data?.refunds;
      } catch (err) {
        console.log(err);
        toast("Failed to fetch refund history", { type: "error" });
        return null;
      }
    },
    enabled: open && data !== null && data !== undefined,
  });

  const refundableTransaction = useMemo(() => {
    if (open) {
      return (
        data?.payment_status === TRANSACTION_SUCCESS &&
        (!data?.user_plan || (data?.user_plan && !data?.user_plan?.plan)) &&
        !data?.refund
      );
    } else return false;
  }, [data, open]);

  const handleRefund = async () => {
    console.log("Refunding...");
    console.log(data);
    Fetch({
      url: "http://localhost:4000/payment/refund/create",
      method: "POST",
      data: {
        // transaction_id: data?.transaction_id,
        transaction_payment_id: data?.transaction_payment_id,
        amount: data?.amount,
        currency: data?.currency?.short_tag,
      },
      token: true,
    })
      .then((res) => {
        if (res.status === 200) {
          toast("Refund Initiated", { type: "success" });
          getRefundHistory();
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Refund Failed, try again!", { type: "error" });
        getRefundHistory();
      });
  };

  return (
    <Modal visible={open} onClose={handleClose} width="50rem">
      <Modal.Title>
        Refund Initiation | Transaction #{data?.transaction_id}
      </Modal.Title>
      <Modal.Content>
        {refundableTransaction ? (
          <div>
            <p className="text-center font-bold">Refundable Payment</p>
            <Divider />

            <p className="py-2">Review Transaction :</p>

            <JsonTable
              data={data || {}}
              includeKeys={["payment_status", "refund", "user_plan", "amount"]}
              renderMap={{
                amount: (val, rowData) => {
                  const formatted = new Intl.NumberFormat("en-IN", {
                    currency: rowData?.currency?.short_tag || "INR",
                    style: "currency",
                  }).format(val / 100);

                  return formatted;
                },
                refund: (val) => {
                  return (
                    <>
                      {val ? (
                        val?.refund_status === TRANSACTION_SUCCESS ? (
                          <Tag>{val?.refund_status}</Tag>
                        ) : (
                          <Tag type="warning">{val?.refund_status}</Tag>
                        )
                      ) : (
                        <p>---</p>
                      )}
                    </>
                  );
                },
                user_plan: (val, rowData, original) => {
                  return (
                    <>
                      {val && val?.plan ? (
                        <Tag type="success">Mapped</Tag>
                      ) : original?.payment_status === TRANSACTION_SUCCESS ? (
                        <Tag type="warning">Unmapped</Tag>
                      ) : (
                        <p>---</p>
                      )}
                    </>
                  );
                },
              }}
            />

            <p className="py-2">Refund History :</p>

            {refundHistory && refundHistory.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table data={refundHistory}>
                  <Table.Column prop="refund_id" label="Refund ID" />
                  <Table.Column
                    prop="refund_status"
                    label="Refund Status"
                    render={(val) => {
                      return (
                        <>
                          {val === REFUND_PROCESSED ? (
                            <Tag type="success">{val}</Tag>
                          ) : val === REFUND_ERROR ? (
                            <Tag type="error">{val}</Tag>
                          ) : (
                            <Tag type="warning">{val}</Tag>
                          )}
                        </>
                      );
                    }}
                  />
                  <Table.Column
                    prop="amount"
                    label="Refund Amount"
                    render={(val, rowData) => {
                      const formatted = new Intl.NumberFormat("en-IN", {
                        currency: rowData?.currency?.short_tag || "INR",
                        style: "currency",
                      }).format(val / 100);

                      return formatted;
                    }}
                  />
                  <Table.Column prop="refund_error_code" label="Error Code" />
                  <Table.Column
                    prop="refund_error_desc"
                    label="Error Description"
                  />
                  <Table.Column
                    prop="created"
                    label="Refund Initiated At"
                    render={(val) => {
                      return new Date(val).toLocaleString();
                    }}
                  />
                </Table>
              </div>
            ) : (
              <p>---</p>
            )}

            <Spacer y={1} />
            <Divider />
            <Spacer y={1} />

            <Button type="success" width="100%" onClick={handleRefund}>
              Refund Payment{" -- "}
              {new Intl.NumberFormat("en-IN", {
                currency: data?.currency?.short_tag || "INR",
                style: "currency",
              }).format(data?.amount / 100)}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-center font-bold">Non Refundable Payment</p>
            <Divider />
            <JsonTable
              data={data || {}}
              includeKeys={["payment_status", "refund", "user_plan"]}
              renderMap={{
                refund: (val) => {
                  return (
                    <>
                      {val ? (
                        val?.refund_status === TRANSACTION_SUCCESS ? (
                          <Tag>{val?.refund_status}</Tag>
                        ) : (
                          <Tag type="warning">{val?.refund_status}</Tag>
                        )
                      ) : (
                        <p>---</p>
                      )}
                    </>
                  );
                },
                user_plan: (val) => {
                  return (
                    <>{val ? <Tag type="success">Mapped</Tag> : <p>---</p>}</>
                  );
                },
              }}
            />
          </div>
        )}
      </Modal.Content>
      <Modal.Action onClick={handleClose}>Close</Modal.Action>
    </Modal>
  );
}

export default RefundModal;
