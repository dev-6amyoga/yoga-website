import AdminPageWrapper from "../../../../components/Common/AdminPageWrapper";
import RegisterPlaylistForm from "../../../../components/content-management/forms/RegisterPlaylistForm";

export default function RegisterPlaylist() {
	return (
		<AdminPageWrapper heading="Content Management - Register Playlist">
			<RegisterPlaylistForm />
		</AdminPageWrapper>
	);
}
