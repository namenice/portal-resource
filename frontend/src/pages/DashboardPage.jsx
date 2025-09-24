// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { HardDrive, Server, LayoutDashboard, GitFork } from 'lucide-react';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalHardwares: 0,
    hardwareByStatus: {},
    totalSwitches: 0,
    totalProjects: 0,
    totalClusters: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('hardwares'); // ใช้ endpoint /hardwares
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();

      // คำนวณจำนวน Hardware ทั้งหมด
      const totalHardwares = data.length;

      // นับจำนวน Hardware ตามสถานะ
      const hardwareByStatus = data.reduce((acc, hardware) => {
        const statusName = hardware.status?.name || 'Unknown';
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {});

      // นับจำนวน Switch, Project, และ Cluster ที่ไม่ซ้ำกัน
      const uniqueSwitches = new Set();
      const uniqueProjects = new Set();
      const uniqueClusters = new Set();
      data.forEach(item => {
        if (item.type?.name === 'Network Switch') {
          uniqueSwitches.add(item.id);
        }
        if (item.cluster?.project?.name) {
          uniqueProjects.add(item.cluster.project.name);
        }
        if (item.cluster?.name) {
          uniqueClusters.add(item.cluster.name);
        }
      });
      
      const totalSwitches = uniqueSwitches.size;
      const totalProjects = uniqueProjects.size;
      const totalClusters = uniqueClusters.size;

      setDashboardData({
        totalHardwares,
        hardwareByStatus,
        totalSwitches,
        totalProjects,
        totalClusters
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { totalHardwares, hardwareByStatus, totalSwitches, totalProjects, totalClusters } = dashboardData;
  const hardwareStatuses = Object.keys(hardwareByStatus);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Cards for total counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Hardwares"
          value={totalHardwares}
          icon={<HardDrive className="w-6 h-6" />}
        />
        <StatCard
          title="Total Switches"
          value={totalSwitches}
          icon={<GitFork className="w-6 h-6" />}
        />
        <StatCard
          title="Total Projects"
          value={totalProjects}
          icon={<LayoutDashboard className="w-6 h-6" />}
        />
        <StatCard
          title="Total Clusters"
          value={totalClusters}
          icon={<Server className="w-6 h-6" />}
        />
      </div>

      {/* Cards for hardware statuses */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hardware Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hardwareStatuses.map(status => (
            <StatCard
              key={status}
              title={`Status: ${status}`}
              value={hardwareByStatus[status]}
              icon={<HardDrive className="w-6 h-6" />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}