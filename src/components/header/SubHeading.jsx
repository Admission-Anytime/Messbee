import "../../pages/contats/contact.scss";
import PropTypes from "prop-types";

import { Input } from "antd";

const { Search } = Input;
const onSearch = (value, _e, info) => console.log(info?.source, value);
// eslint-disable-next-line react/prop-types
export const SubHeading = ({ title, children }) => {
  return (
    <div className="contact-heading">
      <h2>{title}</h2>
      <div className="contact-search">
        <Search
          placeholder="input search text"
          enterButton="Search"
          size="large"
          onSearch={onSearch}
        />
        {children}
      </div>
    </div>
  );
};

SubHeading.prototype = {
  title: PropTypes.string.isRequired, // title prop is required and must be a string
  children: PropTypes.node, // children prop can be any renderable React node
};
