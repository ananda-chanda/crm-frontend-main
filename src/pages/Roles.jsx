import React, { useState } from 'react';
import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from '../features/api/roleApi';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const MODULES = ['Dashboard', 'Leads', 'Customers', 'Deals', 'Activities', 'Users', 'Roles'];
const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Assign', 'Convert'];
const SCOPES = ['OWN', 'TEAM', 'ALL'];

const Roles = () => {
  const { data: roles, isLoading, refetch } = useGetRolesQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  const handleCreateNew = () => {
    setCurrentRole({
      name: '',
      permissions: MODULES.map(m => ({ module: m, actions: [], scope: 'OWN' }))
    });
    setIsEditing(true);
  };

  const handleEdit = (role) => {
    // Ensure all modules are represented in the edit state even if missing from DB
    const permissions = MODULES.map(m => {
      const existing = role.permissions.find(p => p.module === m);
      return existing ? { ...existing, actions: [...existing.actions] } : { module: m, actions: [], scope: 'OWN' };
    });
    setCurrentRole({ ...role, permissions });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id).unwrap();
        toast.success('Role deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete role');
      }
    }
  };

  const handleSave = async () => {
    if (!currentRole.name) return toast.error('Role name is required');
    
    // Filter out permissions that have no actions selected
    const payload = {
      ...currentRole,
      permissions: currentRole.permissions.filter(p => p.actions.length > 0)
    };

    try {
      if (currentRole._id) {
        await updateRole({ id: currentRole._id, ...payload }).unwrap();
        toast.success('Role updated');
      } else {
        await createRole(payload).unwrap();
        toast.success('Role created');
      }
      setIsEditing(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save role');
    }
  };

  const toggleAction = (moduleName, action) => {
    const updated = currentRole.permissions.map(p => {
      if (p.module === moduleName) {
        const hasAction = p.actions.includes(action);
        return {
          ...p,
          actions: hasAction ? p.actions.filter(a => a !== action) : [...p.actions, action]
        };
      }
      return p;
    });
    setCurrentRole({ ...currentRole, permissions: updated });
  };

  const setScope = (moduleName, scope) => {
    const updated = currentRole.permissions.map(p => {
      if (p.module === moduleName) {
        return { ...p, scope };
      }
      return p;
    });
    setCurrentRole({ ...currentRole, permissions: updated });
  };

  if (isLoading) return <div className="p-4">Loading roles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Role</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Role Name</th>
                <th className="p-4 font-semibold text-gray-600">Permissions Setup</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles?.map(role => (
                <tr key={role._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{role.name}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {role.permissions.length} modules configured
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(role)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {role.name !== 'Admin' && (
                      <button onClick={() => handleDelete(role._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{currentRole._id ? 'Edit Role' : 'Create Role'}</h2>
            <div className="flex space-x-2">
              <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Save className="w-5 h-5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              value={currentRole.name}
              onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Sales Executive"
              disabled={currentRole.name === 'Admin'}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 font-semibold text-gray-600">Module</th>
                  <th className="p-3 font-semibold text-gray-600">Data Scope</th>
                  {ACTIONS.map(a => <th key={a} className="p-3 font-semibold text-gray-600 text-center">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {currentRole.permissions.map(perm => (
                  <tr key={perm.module} className="border-b border-gray-50">
                    <td className="p-3 font-medium text-gray-800">{perm.module}</td>
                    <td className="p-3">
                      <select 
                        value={perm.scope} 
                        onChange={(e) => setScope(perm.module, e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    {ACTIONS.map(action => (
                      <td key={action} className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.actions.includes(action)}
                          onChange={() => toggleAction(perm.module, action)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
