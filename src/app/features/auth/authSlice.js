
import { createSlice } from "@reduxjs/toolkit";

const getStoredAuth = () => {
  try {
    const stored =
      localStorage.getItem("pharmacy_auth") ||
      sessionStorage.getItem("pharmacy_auth");

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      !parsed.token ||
      !parsed.exp ||
      parsed.exp * 1000 <= Date.now()
    ) {
      localStorage.removeItem("pharmacy_auth");
      sessionStorage.removeItem("pharmacy_auth");
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem("pharmacy_auth");
    sessionStorage.removeItem("pharmacy_auth");
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",

  initialState: getStoredAuth(),

  reducers: {
    setCredentials: (state, action) => {
      return action.payload;
    },

    logout: () => null,
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth?.user || null;

export const selectToken = (state) => state.auth?.token || null;

export const selectIsAuthenticated = (state) => {
  const auth = state.auth;

  return Boolean(
    auth?.token &&
    auth?.exp &&
    auth.exp * 1000 > Date.now()
  );
};

export default authSlice.reducer;
