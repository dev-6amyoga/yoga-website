import { Modal } from "@geist-ui/core";
import JsonTable from "../../../components/Common/JsonTable/JsonTable";

function TransactionModal({ data, open, handleClose }) {
	// console.log("Transaction modal", { data, open });
	return (
		<Modal visible={open} onClose={handleClose}>
			<Modal.Title>
				Transaction Info | | Transaction #{data?.transaction_id}
			</Modal.Title>
			<Modal.Content>
				<JsonTable
					data={data || {}}
					includeKeys={[
						"transaction_id",
						"transaction_order_id",
						"transaction_payment_id",
						"transaction_signature",
					]}
				/>
			</Modal.Content>
			<Modal.Action onClick={handleClose}>Close</Modal.Action>
		</Modal>
	);
}

export default TransactionModal;
