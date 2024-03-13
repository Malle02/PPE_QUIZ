import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
};
axios.defaults.timeout = 60000; // 1 minute
axios.defaults.maxRedirects = 0;
axios.defaults.maxContentLength = 2000;

// Vous n'avez pas besoin de définir manuellement les cookies, Axios gère cela automatiquement lorsque withCredentials est activé.

export default axios;
