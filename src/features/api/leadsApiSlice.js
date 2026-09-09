import { apiSlice } from './apiSlice';

export const leadsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({
        url: '/leads',
        params,
      }),
      providesTags: ['Lead'],
    }),
    getLeadById: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    createLead: builder.mutation({
      query: (data) => ({
        url: '/leads',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lead', 'Dashboard'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Lead', 'Activity'],
    }),
    convertLead: builder.mutation({
      query: ({ id, data }) => ({
        url: `/leads/${id}/convert`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lead', 'Customer', 'Deal', 'Dashboard', 'Activity'],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useConvertLeadMutation,
} = leadsApiSlice;
