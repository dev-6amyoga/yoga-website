// export const dashSettings = {
//   debug: {
//     logLevel: 3,
//   },
//   streaming: {
//     cacheInitSegments: true,
//     buffer: {
//       initialBufferLevel: 0,
//       bufferTimeAtTopQuality: 16,
//       bufferToKeep: 10,
//       bufferTimeAtTopQualityLongForm: 30,
//       stableBufferTime: 10,
//     },
//   },
// };

export const dashSettings = {
	debug: {
		logLevel: 5,
	},
	streaming: {
		cacheInitSegments: true,
		fragmentRequestTimeout: 5000,
		buffer: {
			initialBufferLevel: 2,
			bufferTimeAtTopQuality: 10,
			bufferToKeep: 15,
		},
		abr: {
			bandwidthSafetyFactor: 0.4,
			initialBitrate: 20000,
			maxBitrate: 20000,
			movingAverageMethod: "ewma",
		},
		gaps: {
			jumpGaps: true,
			jumpLargeGaps: true,
			smallGapLimit: 1,
			threshold: 0.3,
		},
	},
};
