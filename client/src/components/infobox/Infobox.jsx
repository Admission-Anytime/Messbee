import "./Infobox.scss";
import { Card, CardContent, Box } from "@mui/material";

// eslint-disable-next-line react/prop-types
const Infobox = ({ title, body, link }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <h3 style={{ margin: 0, fontFamily: 'poppins' }}>{title}</h3>
            <a href={link} style={{ color: '#ba2525' }}>View</a>
          </Box>
          <p>{body}</p>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Infobox;
