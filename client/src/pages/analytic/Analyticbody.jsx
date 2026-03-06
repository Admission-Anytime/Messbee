import { Box, Paper, Grid, Typography } from "@mui/material";
import "../analytic/analytic.scss";
import BarsDataset from "./BarsDataset";
import PieChartbox from "./PieChartbox";
import YellowButton from "../../components/button/buttonReg/YellowButton";

const Analyticbody = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        mt: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Conversation
          </Typography>
          <div id="analytic-bar">
            <BarsDataset />
          </div>
        </Paper>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User
              </Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>3456</Typography>
              <PieChartbox />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Summary Report
              </Typography>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography>Total Charges</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box sx={{ borderTop: '1px solid #e0e0e0', my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "16px", mb: 1 }}>
                Marketing Conversation
              </Typography>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <YellowButton
                  title="WhatsApp conversation Pricing "
                  padding="0.6rem 2rem"
                />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Summary Report
              </Typography>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Charges</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box sx={{ borderTop: '1px solid #e0e0e0', my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "16px", mb: 1 }}>
                Marketing Conversation
              </Typography>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box sx={{ borderTop: '1px solid #e0e0e0', my: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "16px", mb: 1 }}>
                Marketing Conversation
              </Typography>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
              <Box className="title-wrapper" sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Total Conversation</Typography>
                <Typography>₹20</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Analyticbody;
