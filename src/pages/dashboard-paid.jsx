import "../styles/dashboard-paid.scss";
import MainSidebar from "../components/mainsidebar/MainSidebar";
import FirstHeader from "../components/header/FirstHeader";
import MainHeading from "../components/header/MainHeading";
import Infobox from "../components/infobox/infobox";
import { Card } from "antd";
import Button from "../components/button/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

const infoBoxData = [
  {
    link: "/admin/help/introduction",
    title: "Current's Updates",
    body: "Introducing Messbee Business, leveraging the WhatsApp Official",
  },
  {
    link: "/admin/help/introduction",
    title: "Share WhatsApp Api",
    body: "Check  WhatsApp Api profile",
  },
  {
    link: "/admin/help/introduction",
    title: "What's new",
    body: "In manage team, defining various roles like manager, team member & custom.",
  },
  {
    link: "/admin/help/introduction",
    title: "What's new",
    body: "In manage team, defining various roles like manager, team member & custom.",
  },
];

function Dashboard() {
  return (
    <div className="main">
      <MainSidebar />
      <div className="body-dashboard">
        <FirstHeader></FirstHeader>
        <MainHeading></MainHeading>
        <div className="main-container">
          <div className="feature-heading">
            <p>Explore MessBee&#39;s Feature</p>
          </div>
          <hr></hr>
          <div className="content">
            <div className="left">
              {infoBoxData.map((data, index) => {
                return (
                  <Infobox
                    key={index}
                    title={data.title}
                    link={data.link}
                    body={data.body}
                  />
                );
              })}
            </div>

            {/* ///center content area/// */}

            <div className="center">
              <Card
                title="Today’s update"
                extra={
                  <p style={{ fontSize: 10 }}>
                    Delay of 24hrs is needed to refresh data
                  </p>
                }
                style={{ width: 500 }}
              >
                <div
                  className="trail"
                  style={{
                    backgroundColor: "#faf9f7",
                    padding: "0.5rem",
                  }}
                >
                  <p>Free tier conversation (of Dec) </p>
                  <p style={{ fontSize: 10 }}>
                    <strong>5 of 1,000 used</strong>
                  </p>
                </div>

                <div className="list">
                  <h5>New Chats</h5>
                  <div className="listItem">
                    <p>Unread messages</p>
                    <p>0</p>
                  </div>
                  <div className="listItem">
                    <p>Unassigned chats</p>
                    <p>0</p>
                  </div>
                </div>
                <div className="list">
                  <h5>Business wise data</h5>
                  <div className="listItem">
                    <p>Team member online</p>
                    <p>0</p>
                  </div>
                  <div className="listItem">
                    <p>Ongoing campaign</p>
                    <p>0</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="right">
              <div className="date">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar />
                </LocalizationProvider>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
export default Dashboard;
