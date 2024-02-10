import { Modal } from "@geist-ui/core";
import JsonTable from "../../../components/Common/JsonTable/JsonTable";

function UserModal({ data, open, handleClose }) {
	// console.log("Transaction modal", { data, open });
	return (
		<Modal visible={open} onClose={handleClose}>
			<Modal.Title>
				User Info | Transaction #{data?.transaction_id}
			</Modal.Title>
			<Modal.Content>
				<JsonTable
					data={data?.user || {}}
					excludeKeys={[
						"password",
						"created",
						"updated",
						"last_login",
						"deletedAt",
						"role_id",
					]}
				/>
			</Modal.Content>
			<Modal.Action onClick={handleClose}>Close</Modal.Action>
		</Modal>
	);
}

export default UserModal;
