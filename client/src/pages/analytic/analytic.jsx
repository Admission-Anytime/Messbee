import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import YellowButton from "../../components/button/buttonReg/YellowButton";
import Analyticbody from "./Analyticbody";
import dayjs from "dayjs";

// ❌ DELETE THIS LINE: import MainSidebar from ... 
// ❌ DELETE THIS LINE: import "./analytic.scss";

const Analytic = () => {
  const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
  
  return (
    // ✅ Use this container to fill the screen correctly
    <div className="flex w-full h-full flex-col bg-slate-50 font-['Urbanist'] overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full h-[70px] bg-white px-6 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics</h2>
          <Tab />
        </div>
        <div className="flex items-center gap-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DatePicker
                label="From"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Urbanist',
                      },
                    },
                  },
                }}
              />
              <DatePicker
                label="To"
                value={dateRange[1]}
                onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Urbanist',
                      },
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
          <YellowButton title="Apply Filter" padding="0.5rem 1rem" />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 w-full overflow-y-auto p-6">
        <Analyticbody />
      </div>

    </div>
  );
};

export default Analytic;

// ... keep your Tab component code below ...
export const Tab = () => {
  const [value, setValue] = useState("Conversation");
  
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      setValue(newValue);
    }
  };
  
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label="analytics type"
      sx={{
        '& .MuiToggleButton-root': {
          fontFamily: 'Urbanist',
          fontWeight: 700,
          textTransform: 'none',
          px: 3,
          py: 1,
          color: '#64748b',
          borderRadius: '8px',
          border: '1px solid #f1f5f9',
          '&.Mui-selected': {
            backgroundColor: '#ba2525',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#a02020',
            },
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        padding: '4px',
      }}
    >
      <ToggleButton value="Conversation">Conversation</ToggleButton>
      <ToggleButton value="Message">Message</ToggleButton>
      <ToggleButton value="Campaign">Campaign</ToggleButton>
    </ToggleButtonGroup>
  );
};