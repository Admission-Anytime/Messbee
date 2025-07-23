import React from "react";
import "./PaymentBottomPanel.scss";

const PaymentBottomPanel = () => {
  return (
    <div className="bottom-container">
      <div className="feature-heading2">
        <h3>WhatsApp Conversation Credit (WCC)</h3>
        <p style={{ fontWeight: 400, fontSize: "14px" }}>
          Add money to your WhatsApp Conversation Credit
        </p>
      </div>
      <div className="pisa">
        <p>₹10000.00</p>
        <p style={{ fontWeight: 400, fontSize: "14px" }}>
          (Valid for lifetime)
        </p>
      </div>
    </div>
  );
};

export default PaymentBottomPanel;
