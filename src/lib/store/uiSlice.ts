import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeNav: string;
  activeTab: string;
  searchQuery: string;
}

const initialState: UIState = {
  sidebarOpen: false,
  activeNav: 'dashboard',
  activeTab: 'Overview',
  searchQuery: '',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveNav: (state, action: PayloadAction<string>) => {
      state.activeNav = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setActiveNav, setActiveTab, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
