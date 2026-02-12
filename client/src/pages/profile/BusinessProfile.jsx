import "./profile.scss";
import SyncIcon from "../../assets/sync.svg";
import EditIcon from "../../assets/Edit.svg";
const BusinessProfile = () => {
  const date = new Date();
  const wabaId = 123456;
  return (
    <div id="business-profile">
      <div className="col1">
        <div id="edit-profile">
          <div id="img"></div>
          <div id="data">
            <div id="name-data">
              <div id="name-num">
                <h2>Admission Anytime</h2>
                <p>+912345678900</p>
              </div>
              <img
                src={EditIcon}
                alt="edit-icon"
                id="icon"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  console.log("helloworld");
                }}
              />
            </div>
            <div id="last-seen-box">
              {`Last synced at  ${date.toLocaleTimeString()} ${date.toLocaleDateString()}`}
              <img
                src={SyncIcon}
                alt="icon"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  console.log("helloworld");
                }}
              />
            </div>
            <div id="waba-option">
              <div id="waba-id">
                <p>WABA ID</p>
                {wabaId}
              </div>
              <div id="waba-id">
                <p>Created On</p>
                {date.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col1 list">
        <p className="pi-heading">PERSONAL INFORMATION</p>
        <div className="pi-box">
          <p className="pi-subheading">Message limit tier :</p>
          <p className="pi-subheading">1k</p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Quality score :</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Green
          </p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Code Verification Status :</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Verified
          </p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Phone :</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Connect
          </p>
        </div>
      </div>
      <div className="col1">
        <p className="pi-heading">WABA INFO</p>
        <div className="pi-box">
          <p className="pi-subheading">Name: Admission Anytime</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Approved
          </p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Business verification :</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Verified
          </p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Payment method :</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Verified
          </p>
        </div>
        <div className="pi-box">
          <p className="pi-subheading">Id : 128104917063617</p>
          <p className="pi-subheading" style={{ color: "green" }}>
            Connect
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
