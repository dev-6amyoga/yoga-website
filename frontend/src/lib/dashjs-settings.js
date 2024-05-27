export const dashSettings = {
	debug: {
		logLevel: 5,
	},
	streaming: {
		cacheInitSegments: true,
		buffer: {
			initialBufferLevel: 4,
			bufferTimeAtTopQuality: 10,
			bufferToKeep: 15,
		},
	},
};
