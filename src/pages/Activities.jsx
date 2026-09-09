import { useGetActivitiesQuery, useUpdateActivityMutation } from '../features/api/activitiesApiSlice';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Activities = () => {
  const { data: activities, isLoading, error } = useGetActivitiesQuery({});
  const [updateActivity] = useUpdateActivityMutation();

  const handleStatusChange = async (id, status) => {
    try {
      await updateActivity({ id, status }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="flex justify-center h-64 items-center">Loading activities...</div>;
  if (error) return <div className="text-red-500">Error loading activities: {error.message}</div>;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Recent Activities</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {activities?.map((activity) => (
            <li key={activity._id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0 flex items-center space-x-3 sm:block">
                  {getStatusIcon(activity.status)}
                  <span className="sm:hidden text-sm font-medium text-gray-900">{activity.type}</span>
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <p className="hidden sm:block text-sm font-medium text-gray-900">
                    {activity.type} - {activity.onModel}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <span>By: {activity.createdBy?.name}</span>
                    <span>Date: {new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex justify-end">
                  <select
                    className={`text-sm rounded-lg border-gray-300 ${
                      activity.status === 'Completed' ? 'bg-green-50 text-green-700' :
                      activity.status === 'Overdue' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}
                    value={activity.status}
                    onChange={(e) => handleStatusChange(activity._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
          {(!activities || activities.length === 0) && (
            <li className="p-6 text-center text-gray-500">No activities found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Activities;
