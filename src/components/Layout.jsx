import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../features/api/notificationsApiSlice';
import {
  LayoutDashboard, Users, UserPlus, Briefcase, Activity, LogOut, Bell, CheckCircle, Shield, List,
  Home, Gift, Calendar, BarChart3, Menu, X, ChevronLeft, ChevronDown, MapPin, Building, Layers,
  AlertTriangle, Package, FolderTree, PackageOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { apiSlice } from '../features/api/apiSlice';

const Layout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const socket = useSocket();

  const { data: notifications } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  // Real‑time notification via socket
  useEffect(() => {
    if (socket) {
      socket.on('newNotification', () => {
        dispatch(apiSlice.util.invalidateTags(['Notification']));
      });
      return () => socket.off('newNotification');
    }
  }, [socket, dispatch]);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Permission check (kept as is)
  const hasPermission = (moduleName, action) => {
    if (!userInfo || !userInfo.role || !userInfo.role.permissions) return false;
    const perm = userInfo.role.permissions.find(p => p.module === moduleName);
    return perm ? perm.actions.includes(action) : false;
  };

  // Build navigation items based on permissions (same as original)
  const navItems = [];
  if (hasPermission('Dashboard', 'View')) navItems.push({ name: 'Dashboard', path: '/', icon: LayoutDashboard });
  if (hasPermission('Leads', 'View')) navItems.push({ name: 'Leads', path: '/leads', icon: UserPlus });
  if (hasPermission('Customers', 'View')) navItems.push({ name: 'Customers', path: '/customers', icon: Users });
  if (hasPermission('Deals', 'View')) navItems.push({ name: 'Deals', path: '/deals', icon: Briefcase });
  if (hasPermission('Activities', 'View')) navItems.push({ name: 'Activities', path: '/activities', icon: Activity });
  if (hasPermission('Dashboard', 'View')) navItems.push({ name: 'System Logs', path: '/system-logs', icon: List });
  if (hasPermission('Users', 'View')) navItems.push({ name: 'Users', path: '/users', icon: Users });
  if (hasPermission('Roles', 'View')) navItems.push({ name: 'Roles', path: '/roles', icon: Shield });

  // Sidebar state (collapsible / mobile)
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
        setIsMobileView(true);
        setIsMenuOpen(false);
      } else {
        setIsMobileView(false);
        setIsExpanded(window.innerWidth >= 1280);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileView) setIsMenuOpen(false);
  }, [location.pathname, isMobileView]);

  // Toggle sidebar expand
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine current page title (reusing original logic or simplified)
  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.name : 'Overview';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile menu toggle button */}
      {isMobileView && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-3 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md shadow-lg border border-gray-700 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileView && isMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600
        border-r border-gray-700 shadow-2xl
        transition-all duration-300 z-50 flex flex-col
        ${isMobileView
            ? (isMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : isExpanded ? 'w-64' : 'w-20'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {(isExpanded || isMobileView) ? (
            <>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent tracking-tight flex-1 text-center">
                Lead Management
              </h1>
              {!isMobileView && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-300 flex-shrink-0"
                >
                  <ChevronLeft size={20} className={isExpanded ? '' : 'rotate-180'} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-300 mx-auto"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (isMobileView) setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-700/40 text-white font-medium'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px' }}
                  >
                    <Icon className="flex-shrink-0" size={20} />
                    {(isExpanded || isMobileView) && (
                      <span className="truncate whitespace-nowrap text-base">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer - only logout (user info removed) */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logoutHandler}
            className={`w-full flex items-center ${(isExpanded || isMobileView) ? 'space-x-3' : 'justify-center'} px-3 py-2 text-gray-300 hover:text-pink-400 hover:bg-gray-800/50 rounded-lg transition`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(isExpanded || isMobileView) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-auto flex flex-col relative w-full transition-all duration-300
          ${isMobileView ? 'ml-0' : isExpanded ? 'ml-64' : 'ml-20'}`}
      >
        {/* Header - now includes user profile info */}
        <header className="backdrop-blur-md bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 h-16 flex items-center justify-between px-4 md:px-8 shadow-lg border-b border-gray-700 sticky top-0 z-30">
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-pink-100 bg-clip-text text-transparent drop-shadow-sm tracking-tight ml-10 md:ml-0">
            {getPageTitle()}
          </h2>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-300 hover:text-white transition rounded-full hover:bg-gray-700/50"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-gray-700">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed top-16 right-2 left-2 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col sm:origin-top-right">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-pink-50 rounded-t-2xl">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications?.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications?.map(notif => (
                        <div
                          key={notif._id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50/80 transition cursor-pointer flex items-start space-x-3 ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => !notif.read && markAsRead(notif._id)}
                        >
                          <div className="mt-0.5">
                            {!notif.read ? (
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info - avatar and name */}
            <div className="flex items-center space-x-2 border-l border-gray-700 pl-3 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white truncate max-w-[100px]">{userInfo?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[100px]">{userInfo?.role?.name}</p>
              </div>
            </div>

            {/* Mobile Logout Button - keep as is, but now there is also logout in sidebar */}
            <button
              onClick={logoutHandler}
              className="md:hidden p-2 text-gray-300 hover:text-pink-400 transition rounded-full hover:bg-gray-700/50"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="p-4 md:p-8 pb-24 md:pb-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (dark themed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 border-t border-gray-700 z-50 px-1 py-1 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.3)] pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition ${isActive ? 'text-indigo-300' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-indigo-300' : 'text-gray-400'}`} />
              <span className="text-[9px] font-medium leading-none truncate w-full text-center px-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;