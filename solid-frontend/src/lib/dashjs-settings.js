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
      initialBufferLevel: 8,
      bufferTimeAtTopQuality: 25,
      bufferToKeep: 18,
    },
  },
};
