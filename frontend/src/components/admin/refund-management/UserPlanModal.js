import { Modal, Tag } from "@geist-ui/core";
import JsonTable from "../../../components/Common/JsonTable/JsonTable";

function UserPlanModal({ data, open, handleClose }) {
	// console.log("Transaction modal", { data, open });
	return (
		<Modal visible={open} onClose={handleClose}>
			<Modal.Title>
				User Plan Info | Transaction #{data?.transaction_id}
			</Modal.Title>
			<Modal.Content>
				<JsonTable
					data={data?.user_plan || {}}
					renderMap={{
						validity_to: (val) => new Date(val).toLocaleString(),
						validity_from: (val) => new Date(val).toLocaleString(),
						purchase_date: (val) => new Date(val).toLocaleString(),
						current_status: (val) => <Tag>{val}</Tag>,
					}}
					excludeKeys={[
						"user_id",
						"plan_id",
						"institute_id",
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

export default UserPlanModal;
