export const dashSettings = {
	debug: {
		logLevel: 1,
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
			jumpLargeGaps: false,
			smallGapLimit: 1,
			threshold: 0.3,
		},
	},
};
