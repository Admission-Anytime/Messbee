import "./Infobox.scss";
import { Card, Space } from "antd";

// eslint-disable-next-line react/prop-types
const Infobox = ({ title, body, link }) => {
  return (
    <Space direction="vertical" size={50}>
      <Card
        size="small"
        fontFamily="poppins"
        title={title}
        extra={<a href={link}>View</a>}
        style={{ width: 400 }}
      >
        <p>{body}</p>
      </Card>
    </Space>
  );
};

export default Infobox;
