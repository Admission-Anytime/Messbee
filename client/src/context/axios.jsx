import axios from "axios";

const instance = axios.create({
  baseURL: "https://admin.messbee.com/api/user",
});

export default instance;
