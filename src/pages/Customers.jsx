import { useState } from 'react';
import { useGetCustomersQuery } from '../features/api/customersApiSlice';
import { Search } from 'lucide-react';

const Customers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useGetCustomersQuery({ page, limit: 10, search });

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading customers...</div>;
  if (error) return <div className="text-red-500">Error loading customers: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center w-full">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {data?.customers?.map((customer) => (
            <div key={customer._id} className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{customer.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{customer.company || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg mt-2">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium mb-0.5">Email</span>
                  <span className="text-gray-800 truncate">{customer.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium mb-0.5">Assigned To</span>
                  <span className="text-gray-800 truncate">{customer.assignedTo?.name || '-'}</span>
                </div>
              </div>
            </div>
          ))}
          {data?.customers?.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No customers found. Convert a lead to create a customer.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.customers?.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.leadId?.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.assignedTo?.name || '-'}
                  </td>
                </tr>
              ))}
              {data?.customers?.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    No customers found. Convert a lead to create a customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
