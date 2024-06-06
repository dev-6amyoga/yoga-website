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
      // bufferPruningInterval: 10,
    },
    abr: {
      bandwidthSafetyFactor: 0.4,
      initialBitrate: 20000,
      maxBitrate: 20000,
      movingAverageMethod: "ewma",
    },
    gaps: {
      jumpGaps: false,
      jumpLargeGaps: false,
      smallGapLimit: 1,
      threshold: 0.3,
    },
  },
};
