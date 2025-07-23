import { ChatItem } from "react-chat-elements";
import { useState } from "react";
import "./conversion.scss";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import CustomizedMenus from "../../components/options/CustomizedMenus";

const Conversion = () => {
  const customColorStyle = {
    backgroundColor: "#610404", // Replace with your desired custom color
    color: "white",
    padding: "8px 20px", // Text color
  };

  // hamburger icon for
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div id="conversion-container">
      <div className="ca-header">
        <div className="leftArea">
          <ChatItem
            avatar={"https://facebook.github.io/react/img/logo.svg"}
            title="bag $ walet"
            subtitle={"+911231231234"}
            date={false}
          />
        </div>
        <div className="righticon">
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="fade-menu"
            MenuListProps={{
              "aria-labelledby": "fade-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            TransitionComponent={Fade}
          >
            <MenuItem onClick={handleClose}>
              <DeleteIcon />
              Delete Chat
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <BlockIcon />
              Block Chat
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <CloseIcon />
              Close Chat
            </MenuItem>
          </Menu>
        </div>
      </div>
      <Divider />
      <div className="ca-body">body</div>
      <Divider />
      <div className="ca-footer">
        <CustomizedMenus />
        <form action="">
          <input
            type="text"
            name=""
            id=""
            placeholder="Type Direct message..."
          />
          <Button
            variant="contained"
            style={customColorStyle}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Conversion;

{
  /* <div id="profile-header">
<ChatItem
  avatar={"https://facebook.github.io/react/img/logo.svg"}
  title="bag $ walet"
  subtitle={"+911231231234"}
  date={false}
/>
<div className="icon">hello world</div>
</div>
<div id="message-body">body</div>
<div id="message-input">input</div> */
}
