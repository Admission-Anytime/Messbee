/* eslint-disable react/prop-types */
import { Drawer } from "@mui/material";
import ContactForm from "../form/Form";

const OpenDrawer = ({ title, onClose, open }) => {
  const onSubmit = (data) => {
    // Simulate adding contact to the database
    console.log("Contact data:", data);
    // Add your logic to send data to the database here
  };

  return (
    <Drawer anchor="right" onClose={onClose} open={open}>
      <div style={{ width: 400, padding: '20px' }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <ContactForm onSubmit={onSubmit} />
      </div>
    </Drawer>
  );
};

export default OpenDrawer;
