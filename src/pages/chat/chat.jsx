import MainSidebar from "../../components/mainsidebar/MainSidebar";
import "./chat.scss";
import Infobox from "./Infobox";
import "react-chat-elements/dist/main.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { IconButton } from "@mui/material";
import Divider from "@mui/material/Divider";
import { Input } from "antd";
const { Search } = Input;
import ContactCard from "./ContactCard";
import Conversion from "./Conversion";

const onSearch = (value, _e, info) => console.log(info?.source, value);
const chat = () => {
  return (
    <div className="main">
      <MainSidebar />
      <div className="body">
        <div className="sidebar">
          <Infobox />
          <div className="message-container">
            <div className="message-sidebar">
              <div className="mb-header">
                <div className="righticon">
                  <IconButton>
                    <AccountCircleIcon />
                  </IconButton>
                </div>
                <div className="lefticon">
                  <IconButton>
                    <PersonAddIcon />
                  </IconButton>
                  <IconButton>
                    <AddCircleIcon />
                  </IconButton>
                </div>
              </div>
              <Divider />
              <div className="mb-search">
                <Search
                  placeholder="input search text"
                  enterButton="Search"
                  size="medium"
                  onSearch={onSearch}
                />
              </div>
              <Divider />
              <div className="mb-conversion">
                <ContactCard />
                <ContactCard />
                <ContactCard />
                <ContactCard />
                <ContactCard />
                <ContactCard />
              </div>
            </div>
            <div className="workArea">
              <Conversion />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default chat;

//
// import Conversion from "./Conversion";
// import blankChatIcon from "../../assets/conversion.svg";
// import { useState } from "react";

// eslint-disable-next-line react-hooks/rules-of-hooks
// const [selectedContact, setSelectedContact] = useState(null);
// const handleContactClick = (contact) => {
//   console.log(contact);
//   setSelectedContact(contact);
// };

{
  /* <ContactCard onContactClick={handleContactClick} />
          {selectedContact ? (
            <Conversion contact={selectedContact} />
          ) : (
            <>
              <div className="blankScreen">
                <img src={blankChatIcon} alt="chatIcon" />
                <p>Click any particular chat to see messages</p>
              </div>
            </>
          )} */
}
