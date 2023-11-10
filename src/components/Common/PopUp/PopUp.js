import React from "react";
import "../PopUp/PopUp.css";

function PopUpDialog({
  isOpen,
  onClose,
  onYes,
  onNo,
  message1,
  message2,
  message3,
  message4,
  message5,
  message6,
  message7,
}) {
  if (!isOpen) return null;
  return (
    <div className="popup-dialog-overlay">
      <div className="popup-dialog">
        <p>{message1}</p>
        <p>{message2}</p>
        <p>{message3}</p>
        <p>{message4}</p>
        <p>{message5}</p>
        <p>{message6}</p>
        <p>{message7}</p>
        <p id="updatesInPopUp"></p>
        <button className="b_yes" onClick={onYes}>
          Yes
        </button>
        <button className="b_no" onClick={onNo}>
          No
        </button>
        <button className="b_close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default PopUpDialog;
