interface FBAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
}

interface FBStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FBAuthResponse;
}

interface FacebookSDK {
  init: (options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;

  login: (
    callback: (response: FBStatusResponse) => void,
    options?: { scope?: string }
  ) => void;

  api: (
    path: string,
    method: 'get' | 'post' | 'delete',
    params: Record<string, any>,
    callback: (response: any) => void
  ) => void;
}

declare const FB: FacebookSDK;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from "react-hot-toast";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SignUpInfo, LoginInfo, AuthUser, UserState, FBUserInfoResponse } from '../..';
import { FetchManager } from '../../lib/utils';
import type { RootState } from '..';

const fetcher = new FetchManager();

export const signup = createAsyncThunk('user/signup', 
  async (signUpInfo: SignUpInfo) => {
    try {
      return await fetcher.apiRequest({
        url: '/auth/signup',
        method: 'POST',
        body: signUpInfo,
      });
    } catch(error) {
      if (error instanceof Error) toast.error(error.message);
    }
  },
);

export const login = createAsyncThunk('user/login', 
  async (loginInfo: LoginInfo) => {
    return await fetcher.apiRequest({
      url: '/auth/login',
      method: 'POST',
      body: loginInfo,
    });
  },
);

export const googleLogin = createAsyncThunk('user/googleOAuth', 
  async () => {
    const response = await fetcher.apiRequest({ url: '/auth/googleOAuth' });
    const { code } = response ?? {};
    window.location.href = code;
  }
);

export const FBlogin = createAsyncThunk('user/facebook-login', 
  async () => {
    FB.login((response: FBStatusResponse) => {
      if (response.authResponse) {
        FB.api('/me', 'get', { fields: 'id,name,email,picture' },
          (response: FBUserInfoResponse) => {
            console.log('User Info:', response);
            
          }
        );
      } else {
        console.error('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'public_profile,email' });
    
  },
);

export const logout = createAsyncThunk('user/logout', 
  async () => {
    return await fetcher.apiRequest({
      url: '/auth/logout',
      method: 'POST',
    });
  },
);

export const updateProfile = createAsyncThunk<null, { file: File }, { state: RootState }>('user/update-profile',
  async ( upload: { file: File }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const { file } = upload ?? {};
      const { name: fileName, type: fileType } = file ?? {};
      const getSignedURL = await fetcher.apiRequest({
        url: `/auth/image-upload?fileName=${fileName}&fileType=${fileType}`,
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${state.user.authUser?.accessToken}` },
      });
      const { uploadURL, key } = getSignedURL ?? {};
      await fetch(uploadURL, { 
        method: "PUT", 
        //headers: { "Content-Type": fileType }, 
        body: file
      });
      const fileUrl = `https://${import.meta.env.VITE_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
      const response = await fetcher.apiRequest({
        url: '/auth/store-profile',
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${state.user.authUser?.accessToken}` },
        body: { fileUrl }
      });
      toast.success("Profile updated successfully");
      return response;
    } catch(error) {
      if (error instanceof Error) toast.error(error.message);
    }
  },
);

export const post = createAsyncThunk('user/post', 
  async (authUser: AuthUser | null ) => {
    return await fetcher.apiRequest({
      url: '/auth/posts',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authUser?.accessToken}` },
      timeout: 5000,
    });
  },
);

export const checkAuth = createAsyncThunk('user/auth/check', 
  async () => { return await fetcher.apiRequest({ url: '/auth/check' }); },
);

const initialState: UserState = {
  value: 0,
	authUser: null,
	isSigningUp: false,
	isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  theme: localStorage.getItem("chat-theme") || 'dark'
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.authUser = action.payload
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload
    },
    facebookLogin: () => {
      FB.login((response: FBStatusResponse) => {
        if (response.authResponse) {
          FB.api('/me', 'get', { fields: 'id,name,email,picture' },
            (response: FBUserInfoResponse) => {
              console.log('User Info:', response);
            }
          );
        } else {
          console.error('User cancelled login or did not fully authorize.');
        }
      }, { scope: 'public_profile,email' });
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
	extraReducers: (builder) => {
    /** Signup Status */
		builder.addCase(signup.pending, (state) => {
			state.isSigningUp = true;
		});
		builder.addCase(signup.fulfilled, (state, action: PayloadAction<AuthUser>) => {
			state.isSigningUp = false;
      state.authUser = action.payload;
      toast.success("Account created successfully");
    });
		builder.addCase(signup.rejected, (state) => {
			state.isSigningUp = false;
		});
    /** Login Status */
    builder.addCase(login.pending, (state) => {
			state.isLoggingIn = true;
		});
		builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
			state.isLoggingIn = false;
      state.authUser = action.payload;
      toast.success("Logged in successfully");
    });
		builder.addCase(login.rejected, (state) => {
			state.isLoggingIn = false;
		});
    /** Logout Status */
		builder.addCase(logout.fulfilled, (state) => {
      state.authUser = null;
      toast.success("Logged out successfully");
    });
    /** Post Status */
		builder.addCase(post.fulfilled, (state, action: PayloadAction<AuthUser>) => {
      state.authUser = action.payload;
    });
    builder.addCase(post.rejected, (state) => {
			state.authUser = null;
		});
    /** Check Authentication Status */
		builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<AuthUser>) => {
			state.isCheckingAuth = false;
      if (action.payload.full_name === undefined && action.payload.accessToken === undefined) state.authUser = null;
      else state.authUser = action.payload;
    });
		builder.addCase(checkAuth.rejected, (state) => {
			state.isCheckingAuth = false;
		});
	}
});

export const { setAuthUser, facebookLogin, setTheme, setOnlineUsers } = userSlice.actions;
export default userSlice.reducer;