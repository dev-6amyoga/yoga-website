export const browser = {
	chrome: "Chrome",
	edge: "Edge",
	firefox: "Firefox",
	safari: "Safari",
	opera: "Opera",
	ie: "IE",
	unknown: "Unknown",
};

export function detectBrowser() {
	const userAgent = navigator.userAgent;

	if ((userAgent.indexOf("Opera") || userAgent.indexOf("OPR")) != -1) {
		return browser.opera;
	} else if (userAgent.indexOf("Edg") != -1) {
		return browser.edge;
	} else if (userAgent.indexOf("Chrome") != -1) {
		return browser.chrome;
	} else if (userAgent.indexOf("Safari") != -1) {
		return browser.safari;
	} else if (userAgent.indexOf("Firefox") != -1) {
		return browser.firefox;
	} else if (
		userAgent.indexOf("MSIE") != -1 ||
		userAgentString.indexOf("rv:") != -1 ||
		!!document.documentMode == true
	) {
		//IF IE > 10
		return browser.ie;
	} else {
		return browser.unknown;
	}
}
