import { createContext } from "react";

export const userContext = createContext();

const context = (props) => {
  return props.children;
};

export default context;
