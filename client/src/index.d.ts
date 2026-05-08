import type { RefObject } from "react";
import { Socket } from "socket.io-client";

export type SignUpInfo = {
  fullName: string,
  email: string,
  password: string,
};

export type LoginInfo = {
  email: string,
  password: string,
}

export type AuthUser = {
	full_name?: string | undefined,
	accessToken: string | null,
  profile_pic: string | null;
  email: string;
  createdAt: string;
  id: number;
  name: string;
};

export type UserState = {
  value: number,
  authUser: AuthUser | null,
  isSigningUp: boolean,
  isLoggingIn: boolean,
  isUpdatingProfile: boolean,
  isCheckingAuth: boolean,
  onlineUsers: number[],
  socket: Socket | null,
  theme: string,
};

export type Message = {
  id?: string | number,
  sender_id?: string | number,
  created_at?: Date | string | undefined,
  text: string,
  file?: File | null,
  image?: string | null
};

export type ChatState = {
	messages: Message[],
	users: AuthUser[],
	selectedUser: AuthUser | null,
	isUsersLoading: boolean,
	isMessagesLoading: boolean,
};

export type GoogleSearchParams = {
  client_id: string,
  redirect_uri: string,
  access_type: string,
  response_type: string,
  state: string,
  scope: string,
  include_granted_scopes: string,
  prompt: string,
};

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  picture: {
    data: { url: string };
  };
};

export type FBUserInfoResponse = FacebookUser & {
  picture: { 
    data: { url: string };
  };
};

export interface NavbarProps {
  socketRef: RefObject<Socket | null>;
}

export interface ChatContainerProps {
  socketRef: RefObject<Socket | null>;
}

export interface HomeProps {
  socketRef: RefObject<Socket | null>;
}