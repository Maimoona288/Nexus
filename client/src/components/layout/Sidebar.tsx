// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { 
//   Home, Building2, CircleDollarSign, Users, MessageCircle, 
//   Bell, FileText, Settings, HelpCircle
// } from 'lucide-react';

// interface SidebarItemProps {
//   to: string;
//   icon: React.ReactNode;
//   text: string;
// }

// const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text }) => {
//   return (
//     <NavLink
//       to={to}
//       className={({ isActive }) => 
//         `flex items-center py-2.5 px-4 rounded-md transition-colors duration-200 ${
//           isActive 
//             ? 'bg-primary-50 text-primary-700' 
//             : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//         }`
//       }
//     >
//       <span className="mr-3">{icon}</span>
//       <span className="text-sm font-medium">{text}</span>
//     </NavLink>
//   );
// };

// export const Sidebar: React.FC = () => {
//   const { user } = useAuth();
  
//   if (!user) return null;
  
//   // Define sidebar items based on user role
//   const entrepreneurItems = [
//     { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
//     { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
//     { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
//     { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
//     { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
//     { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
//   ];
  
//   const investorItems = [
//     { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
//     { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
//     { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
//     { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
//     { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
//     { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
//   ];
  
//   const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
//   // Common items at the bottom
//   const commonItems = [
//     { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
//     { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
//   ];
  
//   return (
//     <div className="w-64 bg-white h-full border-r border-gray-200 hidden md:block">
//       <div className="h-full flex flex-col">
//         <div className="flex-1 py-4 overflow-y-auto">
//           <div className="px-3 space-y-1">
//             {sidebarItems.map((item, index) => (
//               <SidebarItem
//                 key={index}
//                 to={item.to}
//                 icon={item.icon}
//                 text={item.text}
//               />
//             ))}
//           </div>
          
//           <div className="mt-8 px-3">
//             <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//               Settings
//             </h3>
//             <div className="mt-2 space-y-1">
//               {commonItems.map((item, index) => (
//                 <SidebarItem
//                   key={index}
//                   to={item.to}
//                   icon={item.icon}
//                   text={item.text}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
        
//         <div className="p-4 border-t border-gray-200">
//           <div className="bg-gray-50 rounded-md p-3">
//             <p className="text-xs text-gray-600">Need assistance?</p>
//             <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
//             <a 
//               href="mailto:support@businessnexus.com" 
//               className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
//             >
//               support@businessnexus.com
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Briefcase, MessageSquare, Bell,
  FileText, Settings, HelpCircle, DollarSign, LogOut,
  Calendar, CreditCard, Video
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const dashboardPath = user?.role === 'investor'
    ? '/dashboard/investor'
    : '/dashboard/entrepreneur';

  const navItems = [
    { to: dashboardPath, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/investors', icon: <Briefcase className="w-5 h-5" />, label: 'Investors' },
    { to: '/entrepreneurs', icon: <Users className="w-5 h-5" />, label: 'Entrepreneurs' },
    { to: '/meetings', icon: <Calendar className="w-5 h-5" />, label: 'Meetings' },
    { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
    { to: '/chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
    { to: '/documents', icon: <FileText className="w-5 h-5" />, label: 'Documents' },
    { to: '/deals', icon: <DollarSign className="w-5 h-5" />, label: 'Deals' },
    { to: '/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
    { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { to: '/help', icon: <HelpCircle className="w-5 h-5" />, label: 'Help' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Nexus</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
