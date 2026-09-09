import { apiSlice } from './apiSlice';

export const activitiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: (params) => ({
        url: '/activities',
        params,
      }),
      providesTags: ['Activity'],
    }),
    updateActivity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/activities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Activity', id }, 'Activity', 'Dashboard'],
    }),
    createActivity: builder.mutation({
      query: (data) => ({
        url: '/activities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Activity', 'Dashboard'],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useUpdateActivityMutation,
  useCreateActivityMutation,
} = activitiesApiSlice;
