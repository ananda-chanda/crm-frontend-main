import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../features/api/analyticsApiSlice';
import { useGetGlobalLogsQuery } from '../features/api/timelineApiSlice';
import { useGetAssignableUsersQuery } from '../features/api/usersApiSlice';
import {
  Users, UserPlus, Briefcase, IndianRupee, Activity, List, Clock, ChevronRight, Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- NEW: StatsCard Component (reusable) ---
const StatsCard = ({ title, value, subtitle, icon: Icon, gradient, iconBg }) => (
  <div className={`rounded-2xl shadow-lg p-6 text-white ${gradient}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
        {subtitle && <p className="text-xs font-medium mt-2 opacity-90">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconBg || 'bg-white/20'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);
// -------------------------------------------

const Dashboard = () => {
  // --- Optional Date Filter State (like second dashboard) ---
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // --- Existing API hooks ---
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery();
  const { data: logs, isLoading: logsLoading } = useGetGlobalLogsQuery(
    selectedUserId ? { userId: selectedUserId } : {}
  );
  const { data: teamUsers } = useGetAssignableUsersQuery();


  // --- Pie chart data ---
  const pieData = [
    { name: 'Open', value: stats?.deals.open || 0, color: '#3b82f6' },
    { name: 'Won', value: stats?.deals.won || 0, color: '#16a34a' },
    { name: 'Lost', value: stats?.deals.lost || 0, color: '#dc2626' }
  ].filter(item => item.value > 0);

  // --- Loading & error states ---
  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-lg font-semibold text-indigo-700">Loading dashboard...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-red-500">Error loading dashboard: {error.message}</div>;

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* --- Header with optional Date Filter (inspired by second dashboard) --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500">Your CRM activity at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-3 py-2 border border-gray-200">
            <Filter className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="text-sm border-0 focus:ring-0 p-0 w-32"
              placeholder="From"
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="text-sm border-0 focus:ring-0 p-0 w-32"
              placeholder="To"
            />
            {(createdFrom || createdTo) && (
              <button
                onClick={() => { setCreatedFrom(''); setCreatedTo(''); }}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Stats Cards with Gradients --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={stats?.leads.total || 0}
          subtitle={`${stats?.leads.conversionRate || 0}% Conversion`}
          icon={UserPlus}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
        />
        <StatsCard
          title="Total Customers"
          value={stats?.customers.total || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-pink-500 to-fuchsia-600"
        />
        <StatsCard
          title="Pipeline Value"
          value={`₹${(stats?.deals.pipelineValue || 0).toLocaleString()}`}
          subtitle={`${stats?.deals.open || 0} Open Deals`}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatsCard
          title="Won Revenue"
          value={`₹${(stats?.deals.wonRevenue || 0).toLocaleString()}`}
          subtitle={`${stats?.deals.won || 0} Won Deals`}
          icon={IndianRupee}
          gradient="bg-gradient-to-br from-green-400 to-emerald-600"
        />
      </div>

      {/* --- Charts Row (Pie + Activities) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Card – styled like the second dashboard's PieChartCard */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Deals Breakdown</h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Deals`, 'Count']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No deals data</div>
            )}
          </div>
        </div>

        {/* Activities Overview – now with gradient background and better styling */}
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Activities Overview</h3>
            <Activity className="text-gray-400 w-5 h-5" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-yellow-700">{stats?.activities.pending || 0}</div>
              <div className="text-xs font-medium text-yellow-600 mt-1 uppercase">Pending</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700">{stats?.activities.completed || 0}</div>
              <div className="text-xs font-medium text-green-600 mt-1 uppercase">Completed</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-700">{stats?.activities.overdue || 0}</div>
              <div className="text-xs font-medium text-red-600 mt-1 uppercase">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- System Logs (with improved styling) --- */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <List className="text-gray-400 w-5 h-5" />
            <h3 className="text-lg font-bold text-gray-900">System Logs</h3>
          </div>
          {teamUsers && teamUsers.length > 0 && (
            <select
              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border shadow-sm"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">All Team Logs</option>
              {teamUsers.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          )}
        </div>
        <div>
          {logsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading logs...</div>
          ) : logs && logs.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {logs.slice(0, 5).map(log => (
                <li key={log._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{log.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{log.onModel}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(log.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>By: {log.createdBy?.name || 'Unknown'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">No logs found.</div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
          <Link to="/system-logs" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center transition">
            View All Logs <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;