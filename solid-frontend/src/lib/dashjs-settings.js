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
    logLevel: 5,
  },
  streaming: {
    cacheInitSegments: true,
    buffer: {
      initialBufferLevel: 8,
      bufferTimeAtTopQuality: 25,
      bufferToKeep: 18,
    },
    gaps: {
      jumpGaps: false,
      jumpLargeGaps: false,
      smallGapLimit: 1.5,
      threshold: 0.3,
      enableSeekFix: false,
      enableStallFix: false,
      stallSeek: 0.1,
    },
  },
};
