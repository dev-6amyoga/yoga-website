import { memo } from "react";
import "./Tooltip.css";

function Tooltip({ children, text }) {
	return (
		<div className="tooltip">
			{children}
			<div className="tooltip_text">
				<div className="flex items-center justify-center h-12 text-white">
					{text}
				</div>
			</div>
		</div>
	);
}

export default memo(Tooltip);
