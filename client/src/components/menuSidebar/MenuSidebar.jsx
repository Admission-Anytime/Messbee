import "./MenuSidebar.scss";
import "../../assets/svgicon/Home.svg";

const MenuSidebar = () => {
  return (
    <div className="main-container">
      <div className="menu-container">
        <div className="heading">
          <h3>Chat</h3>
        </div>
        <hr />
        {makeButton.map}
      </div>
    </div>
  );
};

export default MenuSidebar;

const makeButton = [
  {
    to: "/chat/all-chat",
    img: <img src="../../assets/svgicon/Home.svg" alt="icon" />,
    title: "inbox1",
    subButton: ["All Chat", "All Chat"],
  },
  {
    to: "/chat/all-chat",
    img: <img src="../../assets/svgicon/Home.svg" alt="icon" />,
    title: "inbox",
    subButton: ["All Chat", "All Chat"],
  },
  {
    to: "/chat/all-chat",
    img: <img src="../../assets/svgicon/Home.svg" alt="icon" />,
    title: "inbox2",
    subButton: ["All Chat", "All Chat"],
  },
  {
    to: "/chat/all-chat",
    img: <img src="../../assets/svgicon/Home.svg" alt="icon" />,
    title: "inbox3",
    subButton: ["All Chat", "All Chat"],
  },
];
