import { useState } from 'react';
import { useGetLeadByIdQuery, useUpdateLeadMutation } from '../features/api/leadsApiSlice';
import { useGetTimelineQuery } from '../features/api/timelineApiSlice';
import { useGetActivitiesQuery, useCreateActivityMutation, useUpdateActivityMutation } from '../features/api/activitiesApiSlice';
import { X, Clock, FileText, Send, User, Calendar, CheckCircle, AlertCircle, Phone, Mail, Users, Monitor, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

const LeadDetailsModal = ({ leadId, onClose }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [newNote, setNewNote] = useState('');
  
  // Activities state
  const [newActivity, setNewActivity] = useState({ type: 'Call', description: '', dueDate: '', status: 'Pending' });

  const { data: lead, isLoading: leadLoading } = useGetLeadByIdQuery(leadId, { skip: !leadId });
  const { data: timeline, isLoading: timelineLoading } = useGetTimelineQuery({ onModel: 'Lead', id: leadId }, { skip: !leadId });
  const { data: activities, isLoading: activitiesLoading } = useGetActivitiesQuery({ relatedTo: leadId }, { skip: !leadId });
  
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [createActivity, { isLoading: isCreatingActivity }] = useCreateActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      await updateLead({ id: leadId, note: newNote }).unwrap();
      setNewNote('');
      toast.success('Note added successfully');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.description.trim()) return toast.error('Description is required');
    try {
      await createActivity({ 
        ...newActivity, 
        relatedTo: leadId, 
        onModel: 'Lead' 
      }).unwrap();
      setNewActivity({ type: 'Call', description: '', dueDate: '', status: 'Pending' });
      toast.success('Activity created');
    } catch (err) {
      toast.error('Failed to create activity');
    }
  };

  const handleActivityStatusChange = async (activityId, status) => {
    try {
      await updateActivity({ id: activityId, status }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'Call': return <Phone className="w-4 h-4" />;
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Meeting': return <Users className="w-4 h-4" />;
      case 'Demo': return <Monitor className="w-4 h-4" />;
      case 'Reminder': return <Bell className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (leadLoading) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">Loading details...</div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col slide-up-animation">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-white z-10 rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h2>
            <p className="text-sm text-gray-500">{lead.company} | {lead.status}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 sm:px-6 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'activities' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Activities</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Existing Notes */}
              <div className="space-y-4">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.text}</p>
                      <div className="flex items-center space-x-2 mt-3 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{note.createdBy?.name || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">No notes added yet.</p>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-auto">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a new note here..."
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[100px] p-3 resize-none border"
                />
                <div className="flex justify-end mt-3">
                  <button 
                    type="submit" 
                    disabled={isUpdating || !newNote.trim()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timelineLoading ? (
                <div className="text-center text-gray-500 py-4">Loading timeline...</div>
              ) : timeline && timeline.length > 0 ? (
                <div className="relative border-l-2 border-blue-200 ml-3 pl-4 space-y-6 py-2">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{event.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(event.createdAt).toLocaleString()} • by {event.createdBy?.name || 'System'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No timeline events found.</p>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Existing Activities */}
              <div className="space-y-4">
                {activitiesLoading ? (
                   <div className="text-center text-gray-500 text-sm py-4">Loading activities...</div>
                ) : activities && activities.length > 0 ? (
                  activities.map((act) => (
                    <div key={act._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`p-1.5 rounded-full ${act.status === 'Completed' ? 'bg-green-100 text-green-600' : act.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {getActivityIcon(act.type)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{act.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            act.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            act.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            {act.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{act.description}</p>
                        {act.dueDate && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Due: {new Date(act.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <select
                          className="text-xs py-1.5 px-2 bg-gray-50 border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                          value={act.status}
                          onChange={(e) => handleActivityStatusChange(act._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">No follow-up activities added yet.</p>
                )}
              </div>

              {/* Add Activity Form */}
              <form onSubmit={handleCreateActivity} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select 
                      value={newActivity.type} 
                      onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    >
                      <option value="Call">Call</option>
                      <option value="Email">Email</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Demo">Demo</option>
                      <option value="Reminder">Reminder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                    <input 
                      type="date" 
                      value={newActivity.dueDate}
                      onChange={e => setNewActivity({...newActivity, dueDate: e.target.value})}
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    />
                  </div>
                </div>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Activity description or instructions..."
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[60px] p-3 resize-none border"
                />
                <div className="flex justify-end mt-3">
                  <button 
                    type="submit" 
                    disabled={isCreatingActivity || !newActivity.description.trim()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Create Activity</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
