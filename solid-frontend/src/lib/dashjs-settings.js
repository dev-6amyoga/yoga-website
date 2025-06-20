// export const dashSettings = {
// 	debug: {
// 		logLevel: 5,
// 	},
// 	streaming: {
// 		cacheInitSegments: true,
// 		buffer: {
// 			initialBufferLevel: 4,
// 			bufferTimeAtTopQuality: 15,
// 			bufferToKeep: 10,
// 		},
// 	},
// };

export const dashSettings = {
	debug: {
		logLevel: 3,
	},
	streaming: {
		cacheInitSegments: true,
		buffer: {
			initialBufferLevel: 0,
			bufferTimeAtTopQuality: 16,
			bufferToKeep: 10,
			bufferTimeAtTopQualityLongForm: 30,
			stableBufferTime: 10,
		},
		fragmentRequestTimeout: 60000,
	},
};
