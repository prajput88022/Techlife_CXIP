import{useEffect}from 'react';
import{Routes,Route,Navigate}from 'react-router-dom';
import{useAuthStore}from './store/auth.js';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TenantSetupPage from './pages/TenantSetupPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CallsPage from './pages/CallsPage.jsx';
import PlayerPage from './pages/PlayerPage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import CompliancePage from './pages/CompliancePage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import WebhooksPage from './pages/WebhooksPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import TenantsAdminPage from './pages/TenantsAdminPage.jsx';

function Guard({children}){const ok=useAuthStore(s=>s.isAuthenticated());return ok?children:<Navigate to="/login" replace/>;}
function AdminGuard({children}){const user=useAuthStore(s=>s.user);return user?.role==='admin'?children:<Navigate to="/dashboard" replace/>;}

export default function App(){
  const{token,fetchMe}=useAuthStore();
  useEffect(()=>{if(token)fetchMe();},[token]);
  return(<Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/setup" element={<TenantSetupPage/>}/>
    <Route path="/" element={<Guard><Layout/></Guard>}>
      <Route index element={<Navigate to="/dashboard" replace/>}/>
      <Route path="dashboard" element={<Dashboard/>}/>
      <Route path="calls" element={<CallsPage/>}/>
      <Route path="calls/:id" element={<PlayerPage/>}/>
      <Route path="agents" element={<AgentsPage/>}/>
      <Route path="customers" element={<CustomersPage/>}/>
      <Route path="compliance" element={<CompliancePage/>}/>
      <Route path="providers" element={<ProvidersPage/>}/>
      <Route path="webhooks" element={<WebhooksPage/>}/>
      <Route path="reports" element={<ReportsPage/>}/>
      <Route path="settings" element={<SettingsPage/>}/>
      <Route path="admin" element={<AdminGuard><TenantsAdminPage/></AdminGuard>}/>
    </Route>
  </Routes>);
}
