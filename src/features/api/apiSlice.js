import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://crm-backend-vi2w.onrender.com/api', 
  prepareHeaders: (headers) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      headers.set('authorization', `Bearer ${userInfo.token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lead', 'Customer', 'Deal', 'Activity', 'Dashboard', 'Notification', 'User'],
  endpoints: (builder) => ({}),
});
