/* eslint-disable react/prop-types */
import { Drawer } from "antd";
import ContactForm from "../form/Form";

const OpenDrawer = ({ title, onClose, open }) => {
  const onSubmit = (data) => {
    // Simulate adding contact to the database
    console.log("Contact data:", data);
    // Add your logic to send data to the database here
  };

  return (
    <Drawer title={title} onClose={onClose} open={open}>
      <ContactForm onSubmit={onSubmit} />
    </Drawer>
  );
};

export default OpenDrawer;
