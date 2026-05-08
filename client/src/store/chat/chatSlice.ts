import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { FetchManager } from '../../lib/utils';
import type { AuthUser, ChatState, Message } from '../..';
import type { RootState } from '..';

const fetcher = new FetchManager();

export const getUsers = createAsyncThunk('chat/users',
	async (authUser: AuthUser | null) => {
		return await fetcher.apiRequest({
			url: `/messages/users`,
			headers: { 'Authorization': `Bearer ${authUser?.accessToken}` },
		});
	},
);

export const getMessages = createAsyncThunk<Message[], AuthUser | null, { state: RootState }>('chat/getMessage', 
	async (_authUser, thunkAPI) => {
		const state = thunkAPI.getState();
		return await fetcher.apiRequest({
			url: `/messages/${state.chat.selectedUser?.id}`,
			headers: { 'Authorization': `Bearer ${state.user.authUser?.accessToken}` },
		});
	}
)

export const sendMessage = createAsyncThunk<Message, Message, { state: RootState }>('chat/send', 
	async (message, thunkAPI) => {
		const state = thunkAPI.getState();
		const { file } = message ?? {};
		let fileUrl = null;
		if (file) {
			const { name: fileName, type: fileType } = file ?? {};
			const getSignedURL = await fetcher.apiRequest({
				url: `/auth/image-upload?fileName=${fileName}&fileType=${fileType}`,
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${state.user.authUser?.accessToken}` },
			});
			const { uploadURL, key } = getSignedURL ?? {};
			await fetch(uploadURL, { 
				method: "PUT", 
				headers: { "Content-Type": fileType }, 
				body: file 
			});
			fileUrl = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
		}
		return await fetcher.apiRequest({
			url: `/messages/send/${state.chat.selectedUser?.id}?fileName=${file?.name}&fileType=${file?.type}`,
			method: 'POST',
			headers: { 'Authorization': `Bearer ${state.user.authUser?.accessToken}` },
			body: { text: message.text, image: fileUrl }
		});
	}
)

const initialState: ChatState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
		setSelectedUser: (state, action) => {
			state.selectedUser = action.payload;
		},
		setMessages: (state, action) => {
			state.messages = action.payload;
		},
  },
  extraReducers: (builder) => {
		builder.addCase(getUsers.pending, (state) => {
			state.isUsersLoading = true;
		});
		builder.addCase(getUsers.fulfilled, (state, action) => {
			state.isUsersLoading = false;
			state.users = action.payload;
		});
		builder.addCase(getUsers.rejected, (state) => {
			state.isUsersLoading = false;
		});

		builder.addCase(getMessages.pending, (state) => {
			state.isMessagesLoading = true;
		});
		builder.addCase(getMessages.fulfilled, (state, action) => {
			state.isMessagesLoading = false;
			state.messages = action.payload ?? [];
		});
		builder.addCase(getMessages.rejected, (state) => {
			state.isMessagesLoading = false;
		});

		builder.addCase(sendMessage.fulfilled, (state, action) => {
			state.messages = [...state.messages, action.payload];
		});
		builder.addCase(sendMessage.rejected, () => {
			// toast error
		});
	},
});

export const { setSelectedUser, setMessages } = chatSlice.actions;
export default chatSlice.reducer;