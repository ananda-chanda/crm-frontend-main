import React, { useState } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation, useUpdateUserMutation } from '../features/api/usersApiSlice';
import { useGetRolesQuery } from '../features/api/roleApi';
import { toast } from 'react-toastify';
import { Users as UsersIcon, Plus, Copy, Check, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

const Users = () => {
  const { data: users, isLoading: usersLoading, error } = useGetUsersQuery();
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    role: '',
    manager: '',
    isActive: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateUser({ id: editId, ...formData }).unwrap();
        toast.success('User updated successfully!');
      } else {
        await createUser(formData).unwrap();
        toast.success('User created successfully!');
      }
      closeModal();
    } catch (err) {
      toast.error(err?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // blank by default
      role: user.role?._id || user.role,
      manager: user.manager?._id || '',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
    setEditId(user._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
        toast.success('User deleted successfully!');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete user');
      }
    }
  };

  const toggleStatus = async (user) => {
    try {
      await updateUser({ id: user._id, isActive: !user.isActive }).unwrap();
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setShowPassword(false);
    setFormData(initialFormState);
  };

  if (usersLoading || rolesLoading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading users</div>;

  const managers = users?.filter(u => u.role?.name === 'Sales Manager') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team and their access levels.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role / Manager</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role?.name === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        user.role?.name === 'Sales Manager' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role?.name || user.role}
                      </span>
                      {user.role?.name === 'Sales Executive' && user.manager && (
                        <span className="text-xs text-gray-400">Reports to: {user.manager.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        (user.isActive !== false) ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          (user.isActive !== false) ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs text-gray-500">{(user.isActive !== false) ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                      title="Edit User"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isEditing && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-white"
                    value={formData.role}
                    onChange={(e) => {
                      const selectedRole = roles?.find(r => r._id === e.target.value);
                      const isExec = selectedRole?.name === 'Sales Executive';
                      setFormData({...formData, role: e.target.value, manager: !isExec ? '' : formData.manager});
                    }}
                  >
                    <option value="">-- Select Role --</option>
                    {roles?.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                
                {(() => {
                  const selectedRole = roles?.find(r => r._id === formData.role);
                  return selectedRole?.name === 'Sales Executive' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Manager</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-white"
                      value={formData.manager}
                      onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    >
                      <option value="">-- No Manager Assigned --</option>
                      {managers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                  );
                })()}
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="userForm"
                disabled={isCreating || isUpdating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {isCreating || isUpdating ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
