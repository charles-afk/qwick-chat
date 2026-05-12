declare global {
  interface Window { 
    fbAsyncInit: () => void; 
  }
};
interface FacebookSDK {
  init: (options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
};
declare const FB: FacebookSDK;
import { io, Socket  } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import { checkAuth, setOnlineUsers } from '../store/user/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
export default function useInit() {

  const dispatch = useDispatch<AppDispatch>();
  const { authUser, isCheckingAuth } = useSelector((state: RootState) => state.user);
  const [cookies, setCookies] = useState({});
  const BASE_URL = 'https://api.qwick-chat.com';
  const socketRef = useRef<Socket | null>(null);

  function cookieParser(): void {
    const cookieArray = document.cookie.split(';');
    const collectedCookies : { [key:string]: string } = {};
    cookieArray.forEach(cookie => {
      if (!cookie) return;
      const cookieInfo = cookie.split('=');
      const key = decodeURIComponent(cookieInfo[0].trim());
      const value = decodeURIComponent(cookieInfo[1].trim());
      collectedCookies[key] = value;
    });
    setCookies(collectedCookies);
  };

  function loadFacebookSDK(): void {
    const id = "facebook-jssdk";
    if (document.getElementById(id)) return;
    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode?.insertBefore(js, firstScript);
  };

  function initSocket(): void {
    if (!authUser || socketRef.current?.connected) return;
    const newSocket = io(BASE_URL, { query: { userId: authUser?.id } });
    newSocket.connect();
    socketRef.current = newSocket;
    newSocket.on("getOnlineUsers", (users: number[]) => {
      const convertUsers = [];
      for (const user of users) convertUsers.push(Number(user));
      dispatch(setOnlineUsers(convertUsers));
    });
  };

  useEffect(() => {
    cookieParser();
    loadFacebookSDK();
    window.fbAsyncInit = () => {
      FB.init({
        appId: import.meta.env.VITE_FACEBOOK_ID,
        cookie: true,
        xfbml: true,
        version: 'v20.0',
      });
    };
  }, []);

  useEffect(() => { dispatch(checkAuth()); }, [checkAuth]);
  useEffect(() => { initSocket(); }, [authUser]);

  return { cookies, authUser, isCheckingAuth, socketRef };
};