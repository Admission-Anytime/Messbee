import Button from "../../components/button/Button";
import "../../styles/dashboard-paid.scss";

const ActivePlans = () => {
  return (
    <div>
      <div className="bottom-container">
        <div className="payment-container">
          <div className="feature-heading">
            <h3>WhatsApp Conversation Credit (WCC)</h3>
            <p style={{ fontWeight: 400, fontSize: "14px" }}>
              Add money to your WhatsApp Conversation Credit
            </p>
          </div>
          <div className="pisa">
            <p style={{ fontWeight: 800, fontSize: "22.4px" }}>₹10000.00</p>
            <p style={{ fontWeight: 400, fontSize: "10px" }}>
              (Valid for lifetime)
            </p>
          </div>
        </div>
        <hr />
        <div className="offer-container">
          <p>🎁 Get WCC as cash-back upto ₹999 on recharge.</p>
          <Button title="NEW PAYMENT" />
        </div>
      </div>
    </div>
  );
};

export default ActivePlans;
