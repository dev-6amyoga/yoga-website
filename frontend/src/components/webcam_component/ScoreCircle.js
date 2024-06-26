import React from "react";
import PropTypes from "prop-types";

const ScoreCircle = ({ globalScore }) => {
  const normalizedScore = Math.max(0, Math.min(globalScore, 100));
  const circumference = 100; // circumference of the circle
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <svg className="score-circle" viewBox="0 0 36 36">
      <path
        className="circle-bg"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="circle"
        strokeDasharray={`${circumference}, ${circumference}`}
        strokeDashoffset={offset}
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text x="18" y="20.35" className="circle-text" textAnchor="middle">
        {globalScore.toFixed(0)}
      </text>
    </svg>
  );
};

ScoreCircle.propTypes = {
  globalScore: PropTypes.number.isRequired,
};

export default ScoreCircle;

// import React from "react";
// import PropTypes from "prop-types";

// const ScoreCircle = ({ globalScore }) => {
//   // Ensure globalScore is between 0 and 100
//   const normalizedScore = Math.max(0, Math.min(globalScore, 100));
//   const circumference = 2 * Math.PI * 15.9155; // circumference of the circle
//   const offset = circumference - (normalizedScore / 100) * circumference;

//   // Determine the color based on the score
//   let circleColor;
//   if (normalizedScore < 30) {
//     circleColor = "red";
//   } else if (normalizedScore < 70) {
//     circleColor = "yellow";
//   } else {
//     circleColor = "green";
//   }

//   return (
//     <svg className="score-circle" viewBox="0 0 36 36">
//       <circle className="circle-bg" cx="18" cy="18" r="15.9155" />
//       <circle
//         className="circle"
//         cx="18"
//         cy="18"
//         r="15.9155"
//         stroke={circleColor}
//         strokeDasharray={`${circumference} ${circumference}`}
//         strokeDashoffset={offset}
//       />
//       <text x="18" y="20.35" className="circle-text" textAnchor="middle">
//         {globalScore.toFixed(0)}
//       </text>
//     </svg>
//   );
// };

// ScoreCircle.propTypes = {
//   globalScore: PropTypes.number.isRequired,
// };

// export default ScoreCircle;
