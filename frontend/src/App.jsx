// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query'; // 🚨 เพิ่มบรรทัดนี้
import { menuItems } from './constants/menuItems';

// Layout Components
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';

// Page Components
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import HardwarePage from './pages/HardwarePage.jsx';
import SitesPage from './pages/SitesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HardwareAddEditPage from './pages/HardwareAddEditPage.jsx';
import LocationPage from './pages/LocationsPage.jsx';
import SwitchesPage from './pages/SwitchesPage.jsx';
import VendorsPage from './pages/VendorsPage.jsx';
import HardwareTypesPage from './pages/HardwareTypesPage.jsx';
import HardwareModelsPage from './pages/HardwareModelsPage.jsx';
import HardwareStatusesPage from './pages/HardwareStatusesPage.jsx';
import ClustersPage from './pages/ClustersPage.jsx';
import D3HardwareTopologyPage from './pages/D3HardwareTopologyPage.jsx';

function AppContent() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState([]);
  const token = localStorage.getItem('authToken');

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  useEffect(() => {
    const currentPath = location.pathname.substring(1);
    const foundParentMenu = menuItems.find(item => {
      if (item.subItems && item.subItems.some(subItem => subItem.id === currentPath)) {
        return true;
      }
      return false;
    });

    const foundMenuId = currentPath || 'dashboard';
    setActiveMenu(foundMenuId);
    
    if (foundParentMenu && !expandedMenus.includes(foundParentMenu.id)) {
        setExpandedMenus(prev => [...prev, foundParentMenu.id]);
    }
  }, [location.pathname, expandedMenus]);

  // 🚨 ตรวจสอบ token ที่นี่
  if (!token && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  
  // 🚨 แสดงเฉพาะหน้า Login หากไม่มี Token
  if (!token) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // 🚨 แสดงหน้าหลักเมื่อมี Token
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        expandedMenus={expandedMenus}
        toggleSubmenu={toggleSubmenu}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/locations" element={<LocationPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/hardware" element={<HardwarePage />} />
          <Route path="/hardware/add" element={<HardwareAddEditPage />} />
          <Route path="/hardware/edit/:id" element={<HardwareAddEditPage />} />
          <Route path="/switches" element={<SwitchesPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/hardwaretypes" element={<HardwareTypesPage />} />
          <Route path="/hardwaremodels" element={<HardwareModelsPage />} />
          <Route path="/HardwareStatuses" element={<HardwareStatusesPage />} />
          <Route path="/clusters" element={<ClustersPage />} />
          <Route path="/d3hardwaretopology" element={<D3HardwareTopologyPage />} />
          <Route path="*" element={<p>Page Not Found</p>} />
        </Routes>
      </div>
    </div>
  );
}

// สร้าง QueryClient instance ที่นี่
const queryClient = new QueryClient();

export default function App() {
  return (
    // 🚨 หุ้ม Router ด้วย QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}