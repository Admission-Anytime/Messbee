import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import YellowButton from "../../components/button/buttonReg/YellowButton";
import Analyticbody from "./Analyticbody";
import dayjs from "dayjs";

const Analytic = () => {
  const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
  
  return (
    <div className="flex w-full h-full flex-col bg-slate-50 font-['Urbanist'] overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="w-full bg-white px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h2>
            <p className="text-sm text-slate-500 font-medium">Track your messaging performance and costs</p>
          </div>
          <div className="hidden lg:block h-10 w-px bg-gray-200"></div>
          <Tab />
        </div>

        {/* DATE PICKER & FILTER */}
        <div className="flex items-center gap-3">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <DatePicker
                label="From"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: '140px',
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Urbanist',
                        borderRadius: '10px',
                        backgroundColor: '#eff3f6',
                      },
                    },
                  },
                }}
              />
              <span className="text-gray-400 font-medium">-</span>
              <DatePicker
                label="To"
                value={dateRange[1]}
                onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: '140px',
                      '& .MuiOutlinedInput-root': {
                        fontFamily: 'Urbanist',
                        borderRadius: '10px',
                        backgroundColor: '#eff3f6',
                      },
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
          <YellowButton title="Apply Filter" padding="0.55rem 1.2rem" />
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-6 md:p-8">
        <Analyticbody />
      </div>

    </div>
  );
};

export default Analytic;

// --- CUSTOM STYLED TAB COMPONENT ---
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
        backgroundColor: '#f1f5f9',
        borderRadius: '10px',
        padding: '4px',
        height: 'fit-content',
        '& .MuiToggleButton-root': {
          fontFamily: 'Urbanist',
          fontWeight: 700,
          textTransform: 'none',
          px: 3,
          py: 0.75,
          color: '#64748b',
          border: 'none',
          borderRadius: '8px !important',
          '&.Mui-selected': {
            backgroundColor: '#10B981', // Changed to Messbee Green
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            '&:hover': {
              backgroundColor: '#059669',
            },
          },
          '&:hover': {
            backgroundColor: '#e2e8f0',
          },
        },
      }}
    >
      <ToggleButton value="Conversation">Conversation</ToggleButton>
      <ToggleButton value="Message">Message</ToggleButton>
      <ToggleButton value="Campaign">Campaign</ToggleButton>
    </ToggleButtonGroup>
  );
};