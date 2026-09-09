import { apiSlice } from './apiSlice';

export const dealsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query({
      query: (params) => ({
        url: '/deals',
        params,
      }),
      providesTags: ['Deal'],
    }),
    getDealById: builder.query({
      query: (id) => `/deals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Deal', id }],
    }),
    updateDeal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/deals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Deal', id }, 'Deal', 'Dashboard', 'Activity'],
    }),
  }),
});

export const {
  useGetDealsQuery,
  useGetDealByIdQuery,
  useUpdateDealMutation,
} = dealsApiSlice;
