import { useState } from 'react';
import { useGetLeadsQuery, useCreateLeadMutation, useConvertLeadMutation, useUpdateLeadMutation } from '../features/api/leadsApiSlice';
import { useGetAssignableUsersQuery } from '../features/api/usersApiSlice';
import { Search, Filter, Plus, X, ArrowRightLeft, FileText, User, Building, Mail, Phone, Tag, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRBAC } from '../hooks/useRBAC';
import LeadDetailsModal from '../components/LeadDetailsModal';

const Leads = () => {
  const { hasPermission } = useRBAC();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    priority: 'Medium'
  });

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [convertData, setConvertData] = useState({
    dealValue: '',
    dealProbability: 50,
    expectedClosingDate: ''
  });

  const [detailsModalLeadId, setDetailsModalLeadId] = useState(null);

  const { data, isLoading, error } = useGetLeadsQuery({ page, limit: 10, search, status });
  const { data: assignableUsers } = useGetAssignableUsersQuery(undefined, {
    skip: !hasPermission('Leads', 'Assign')
  });
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [convertLead, { isLoading: isConverting }] = useConvertLeadMutation();
  const [updateLead] = useUpdateLeadMutation();

  const handleAssignChange = async (leadId, newAssignedTo) => {
    try {
      await updateLead({ id: leadId, assignedTo: newAssignedTo }).unwrap();
      toast.success('Lead assigned successfully');
    } catch (err) {
      toast.error('Failed to assign lead');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await createLead(newLead).unwrap();
      toast.success('Lead created successfully');
      setIsModalOpen(false);
      setNewLead({
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        priority: 'Medium'
      });
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to create lead');
    }
  };

  const openConvertModal = (lead) => {
    setLeadToConvert(lead);
    setConvertData({
      dealValue: '',
      dealProbability: 50,
      expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    });
    setIsConvertModalOpen(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    try {
      await convertLead({ id: leadToConvert._id, data: convertData }).unwrap();
      toast.success('Lead converted to Customer and Deal successfully!');
      setIsConvertModalOpen(false);
      setLeadToConvert(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to convert lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLead({ id: leadId, status: newStatus }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Status badge styling
  const getStatusBadge = (status, isConverted) => {
    if (isConverted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <CheckCircle className="w-3 h-3 mr-1 text-gray-500" />
          Converted
        </span>
      );
    }
    const variants = {
      New: 'bg-emerald-100 text-emerald-800',
      Contacted: 'bg-slate-200 text-slate-700',
      Qualified: 'bg-purple-100 text-purple-800',
      Unqualified: 'bg-amber-100 text-amber-800',
      Lost: 'bg-rose-100 text-rose-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-800'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
        {status}
      </span>
    );
  };

  // Avatar colors
  const getAvatarColor = (name) => {
    const colors = [
      'bg-slate-100 text-slate-700',
      'bg-indigo-100 text-indigo-700',
      'bg-violet-100 text-violet-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
      'bg-cyan-100 text-cyan-700'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]"></div>
        <p className="text-gray-500 text-sm">Loading leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-rose-800 font-medium">Error loading leads</h3>
        <p className="text-rose-600 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-9 rounded-full bg-[#1E3A5F]" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track your sales leads</p>
          </div>
        </div>
        {hasPermission('Leads', 'Create') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#16293F] text-white rounded-xl shadow-sm hover:shadow-md hover:shadow-[#1E3A5F]/15 transition-all duration-200 font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm placeholder-gray-400"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3 md:w-60">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              className="block w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm appearance-none"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {data?.leads?.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No leads found</p>
              <p className="text-sm">Create a new lead to get started</p>
            </div>
          ) : (
            data?.leads?.map((lead) => (
              <div
                key={lead._id}
                className="p-5 space-y-4 hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer"
                onClick={() => setDetailsModalLeadId(lead._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${getAvatarColor(
                        lead.firstName + lead.lastName
                      )}`}
                    >
                      {lead.firstName.charAt(0)}
                      {lead.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {lead.company || lead.title || '—'}
                      </div>
                    </div>
                  </div>
                  <div>
                    {lead.isConverted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <CheckCircle className="w-3 h-3 mr-1 text-gray-500" />
                        Converted
                      </span>
                    ) : hasPermission('Leads', 'Edit') ? (
                      <select
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer transition-colors ${
                          lead.status === 'New'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.status === 'Contacted'
                            ? 'bg-slate-200 text-slate-700'
                            : lead.status === 'Qualified'
                            ? 'bg-purple-100 text-purple-800'
                            : lead.status === 'Unqualified'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Lost">Lost</option>
                      </select>
                    ) : (
                      getStatusBadge(lead.status, false)
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{lead.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>
                      {hasPermission('Leads', 'Assign') ? (
                        <select
                          className="text-xs py-0.5 px-1 bg-white border border-gray-200 rounded-md w-full"
                          value={lead.assignedTo?._id || ''}
                          onChange={(e) => handleAssignChange(lead._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Unassigned</option>
                          {assignableUsers?.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        lead.assignedTo?.name || 'Unassigned'
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailsModalLeadId(lead._id);
                    }}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    Details
                  </button>
                  {!lead.isConverted && hasPermission('Leads', 'Convert') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (lead.status === 'Qualified') openConvertModal(lead);
                      }}
                      disabled={lead.status !== 'Qualified'}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm ${
                        lead.status === 'Qualified'
                          ? 'bg-[#1E3A5F] hover:bg-[#16293F] text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                      Convert
                    </button>
                  )}
                  {lead.isConverted && (
                    <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium border border-emerald-200">
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Converted
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company / Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data?.leads?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="font-medium text-gray-700">No leads found</p>
                      <p className="text-sm">Adjust your filters or create a new lead</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.leads?.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer group"
                    onClick={() => setDetailsModalLeadId(lead._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${getAvatarColor(
                            lead.firstName + lead.lastName
                          )}`}
                        >
                          {lead.firstName.charAt(0)}
                          {lead.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.company || '—'}</div>
                      <div className="text-xs text-gray-500">{lead.title || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.isConverted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <CheckCircle className="w-3 h-3 mr-1 text-gray-500" />
                          Converted
                        </span>
                      ) : hasPermission('Leads', 'Edit') ? (
                        <select
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-[#1E3A5F] cursor-pointer transition-colors ${
                            lead.status === 'New'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lead.status === 'Contacted'
                              ? 'bg-slate-200 text-slate-700'
                              : lead.status === 'Qualified'
                              ? 'bg-purple-100 text-purple-800'
                              : lead.status === 'Unqualified'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Unqualified">Unqualified</option>
                          <option value="Lost">Lost</option>
                        </select>
                      ) : (
                        getStatusBadge(lead.status, false)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hasPermission('Leads', 'Assign') ? (
                        <select
                          className="text-xs py-1.5 px-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] bg-white w-full max-w-[140px]"
                          value={lead.assignedTo?._id || ''}
                          onChange={(e) => handleAssignChange(lead._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Unassigned</option>
                          {assignableUsers?.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{lead.assignedTo?.name || 'Unassigned'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsModalLeadId(lead._id);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Notes
                        </button>
                        {!lead.isConverted && hasPermission('Leads', 'Convert') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (lead.status === 'Qualified') openConvertModal(lead);
                            }}
                            disabled={lead.status !== 'Qualified'}
                            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                              lead.status === 'Qualified'
                                ? 'text-[#1E3A5F] bg-[#EAEFF4] hover:bg-[#DCE4EC]'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                            Convert
                          </button>
                        )}
                        {lead.isConverted && (
                          <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Converted
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="bg-gray-50/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * 10, data.totalLeads)}
                  </span>{' '}
                  of <span className="font-medium">{data.totalLeads}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 duration-300">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Lead</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newLead.firstName}
                    onChange={(e) =>
                      setNewLead({ ...newLead, firstName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newLead.lastName}
                    onChange={(e) =>
                      setNewLead({ ...newLead, lastName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) =>
                      setNewLead({ ...newLead, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) =>
                      setNewLead({ ...newLead, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newLead.title}
                    onChange={(e) =>
                      setNewLead({ ...newLead, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="Sales Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newLead.company}
                    onChange={(e) =>
                      setNewLead({ ...newLead, company: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Source
                  </label>
                  <select
                    value={newLead.source}
                    onChange={(e) =>
                      setNewLead({ ...newLead, source: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={newLead.priority}
                    onChange={(e) =>
                      setNewLead({ ...newLead, priority: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {hasPermission('Leads', 'Assign') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Assign To
                    </label>
                    <select
                      value={newLead.assignedTo || ''}
                      onChange={(e) =>
                        setNewLead({ ...newLead, assignedTo: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm bg-white"
                    >
                      <option value="">Self (Default)</option>
                      {assignableUsers?.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#16293F] text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {isConvertModalOpen && leadToConvert && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8 duration-300">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Convert Lead</h2>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pt-4 pb-2 bg-[#EAEFF4]/70 border-b border-[#DCE4EC]">
              <p className="text-sm text-gray-700">
                Converting <strong>{leadToConvert.firstName} {leadToConvert.lastName}</strong> from{' '}
                <span className="font-medium">{leadToConvert.company || '—'}</span> will create a new Customer and a new Deal.
              </p>
            </div>
            <form onSubmit={handleConvertLead} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deal Value (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    required
                    type="number"
                    min="0"
                    value={convertData.dealValue}
                    onChange={(e) =>
                      setConvertData({ ...convertData, dealValue: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Probability to Win (%) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={convertData.dealProbability}
                    onChange={(e) =>
                      setConvertData({ ...convertData, dealProbability: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expected Closing Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    required
                    type="date"
                    value={convertData.expectedClosingDate}
                    onChange={(e) =>
                      setConvertData({ ...convertData, expectedClosingDate: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E3A5F]/15 focus:border-[#1E3A5F] transition-all duration-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalLeadId && (
        <LeadDetailsModal
          leadId={detailsModalLeadId}
          onClose={() => setDetailsModalLeadId(null)}
        />
      )}
    </div>
  );
};

export default Leads;