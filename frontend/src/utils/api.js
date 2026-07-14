import axios from 'axios';
const api=axios.create({baseURL:'/api/v1',timeout:30000});
api.interceptors.request.use(cfg=>{const t=localStorage.getItem('cxip_token');if(t)cfg.headers.Authorization=`Bearer ${t}`;return cfg;});
api.interceptors.response.use(r=>r,err=>{if(err.response?.status===401){localStorage.removeItem('cxip_token');window.location.href='/login';}return Promise.reject(err);});
export default api;
