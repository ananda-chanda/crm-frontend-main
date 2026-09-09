import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

export const useRBAC = () => {
  const user = useSelector(selectUser);

  const hasPermission = (moduleName, action) => {
    if (!user || !user.role || !user.role.permissions) return false;
    
    const perm = user.role.permissions.find(p => p.module === moduleName);
    if (!perm) return false;

    return perm.actions.includes(action);
  };

  const getScope = (moduleName) => {
    if (!user || !user.role || !user.role.permissions) return 'OWN';
    const perm = user.role.permissions.find(p => p.module === moduleName);
    return perm ? perm.scope : 'OWN';
  };

  return { hasPermission, getScope, role: user?.role?.name, user };
};
