import PageWrapper from "../../components/Common/PageWrapper";

import {
	ReactToSolidBridge,
	ReactToSolidBridgeProvider,
} from "react-solid-bridge";
import Playbar from "../../solidjs-src/src/components/StackVideoDashJS/Playbar";

export default function PlaybarPage() {
	return (
		<PageWrapper heading="Player">
			<div className="mx-auto max-w-7xl">
				<ReactToSolidBridgeProvider>
					<ReactToSolidBridge
						getSolidComponent={({ getChildren, props }) =>
							Playbar({ children: getChildren })
						}></ReactToSolidBridge>{" "}
					{/* <VideoPlayerWrapperSolid /> */}
				</ReactToSolidBridgeProvider>
			</div>
		</PageWrapper>
	);
}
