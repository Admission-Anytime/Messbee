import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure it points to 5000!
});

export default instance;