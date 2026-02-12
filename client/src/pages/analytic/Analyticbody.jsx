import { Card, Space, Col, Row } from "antd";
import "../analytic/analytic.scss";
import BarsDataset from "./BarsDataset";
import PieChartbox from "./PieChartbox";
import YellowButton from "../../components/button/buttonReg/yellowButton";
// import PieChartbox from "./PieChartbox";
const Analyticbody = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        marginTop: "1rem",
        marginBottom: "1rem",
        overFlow: "auto",
      }}
    >
      <Space direction="vertical" size={20}>
        <Card title="Conversation">
          <div id="analytic-bar">
            <BarsDataset />
          </div>
        </Card>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="User">
              <h2>3456</h2>
              <PieChartbox />
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Summary Report">
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Charges</p>
                <p>₹20</p>
              </div>
              <hr style={{ marginTop: "2rem", marginBottom: "2rem" }} />
              <h4 style={{ fontWeight: 600, fontSize: "16px" }}>
                Marketing Conversation
              </h4>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div style={{ marginTop: "1.3rem" }}>
                <YellowButton
                  title="WhatsApp conversation Pricing "
                  padding="0.6rem 2rem"
                ></YellowButton>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Summary Report">
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Charges</p>
                <p>₹20</p>
              </div>
              <hr style={{ marginTop: "0.7rem", marginBottom: "0.7rem" }} />
              <h4 style={{ fontWeight: 600, fontSize: "16px" }}>
                Marketing Conversation
              </h4>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <hr style={{ marginTop: "0.7rem", marginBottom: "0.7rem" }} />
              <h4 style={{ fontWeight: 600, fontSize: "16px" }}>
                Marketing Conversation
              </h4>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
              <div
                className="title-wrapper"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Total Conversation</p>
                <p>₹20</p>
              </div>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Analyticbody;
