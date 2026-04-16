import "../../pages/contats/contact.scss";
import PropTypes from "prop-types";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
export const SubHeading = ({ title, children }) => {
  const [searchValue, setSearchValue] = useState("");
  
  const onSearch = (value) => {
    console.log("search:", value);
  };

  return (
    <div className="contact-heading">
      <h2>{title}</h2>
      <div className="contact-search">
        <TextField
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSearch(searchValue);
            }
          }}
          size="medium"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => onSearch(searchValue)} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
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
