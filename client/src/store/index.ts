import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/user/userSlice';
import chatReducer from '../store/chat/chatSlice';
export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
  },
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;