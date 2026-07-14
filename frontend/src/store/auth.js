import{create}from 'zustand';
import api from '../utils/api.js';
export const useAuthStore=create((set,get)=>({
  user:null,token:localStorage.getItem('cxip_token'),
  login:async(email,password)=>{const r=await api.post('/auth/login',{email,password});localStorage.setItem('cxip_token',r.data.token);set({token:r.data.token,user:r.data.user});return r.data;},
  logout:()=>{localStorage.removeItem('cxip_token');set({user:null,token:null});},
  fetchMe:async()=>{try{const r=await api.get('/auth/me');set({user:r.data});}catch{get().logout();}},
  isAuthenticated:()=>!!get().token,
}));
