import { Modal } from "@geist-ui/core";

function SaveChangesAlert({ unloadBlock, handleUnloadToggle, blocker }) {
	return (
		<Modal visible={blocker.state === "blocked"}>
			<Modal.Title>Changes will be lost!</Modal.Title>
			<Modal.Content>
				Changes made will be lost if you proceed, are you sure?
			</Modal.Content>
			<Modal.Action
				onClick={() => {
					if (blocker?.reset) blocker.reset();
				}}>
				Cancel
			</Modal.Action>
			<Modal.Action
				onClick={() => {
					if (blocker?.proceed) blocker.proceed();
					if (unloadBlock) handleUnloadToggle();
				}}>
				Proceed
			</Modal.Action>
		</Modal>
	);
}
export default SaveChangesAlert;
