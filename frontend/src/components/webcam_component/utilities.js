import * as posenet from "@tensorflow-models/posenet";

export const drawKeypoints = (keypoints, minConfidence, ctx, scale = 1) => {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, 5, 0, 2 * Math.PI); // Adjust radius if needed
    ctx.fillStyle = "aqua";
    ctx.fill();
  }
};

export const drawSkeleton = (keypoints, minConfidence, ctx, scale = 1) => {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach((keypoints) => {
    const kp1 = keypoints[0].position;
    const kp2 = keypoints[1].position;
    ctx.beginPath();
    ctx.moveTo(kp1.x * scale, kp1.y * scale);
    ctx.lineTo(kp2.x * scale, kp2.y * scale);
    ctx.lineWidth = 2; // Adjust as needed
    ctx.strokeStyle = "red";
    ctx.stroke();
  });
};
