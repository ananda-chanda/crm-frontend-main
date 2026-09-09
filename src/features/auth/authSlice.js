import { createSlice } from '@reduxjs/toolkit';

const userInfoFromStorage = sessionStorage.getItem('userInfo')
  ? JSON.parse(sessionStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      sessionStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      sessionStorage.removeItem('userInfo');
    },
  },
});

export const selectUser = (state) => state.auth.userInfo;

export const selectHasPermission = (state, moduleName, action) => {
  const user = state.auth.userInfo;
  if (!user || !user.role || !user.role.permissions) return false;
  
  const perm = user.role.permissions.find(p => p.module === moduleName);
  if (!perm) return false;

  return perm.actions.includes(action);
};

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
