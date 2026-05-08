import chatIcon from '../../icons/chat.svg';
import emailIcon from '../../icons/email.svg';
import lockIcon from '../../icons/lock.svg';
import eyeOpen from '../../icons/eye-open.svg';
import eyeClosed from '../../icons/eye-close.svg';
import googleIcon from '../../icons/google.svg';
//import facebookIcon from '../../icons/facebook.svg';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../../store/user/userSlice';
import type { AppDispatch, RootState } from '../../store';
//import type { FBUserInfoResponse } from '../..';
export default function Login() {
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggingIn } = useSelector((state: RootState) => state.user);

	const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  function handleLoginInput(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target ?? {};
    setLoginInfo(previousLoginInfo => ({ ...previousLoginInfo, [name]: value }));
  };

  function handleShowPasswordToggle(): void {
    setShowPassword(prev => !prev);
  };

  function handleNativeLogin(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    dispatch(login(loginInfo));
  };

  function handleGoogleLogin(): void {
    dispatch(googleLogin());
  };

  // async function handleFacebookLogin(): Promise<void> {
  //   FB.login((response: fb.StatusResponse) => {
  //     if (response.authResponse) {
  //       FB.api('/me', 'get', { fields: 'id,name,email,picture' },
  //         async (response: FBUserInfoResponse) => {
  //           const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
  //           const login = await fetch(`${BASE_URL}/auth/facebook-login`, {
  //             method: 'POST',
  //             credentials: 'include',
  //             mode: 'cors',
  //             body: JSON.stringify(response),
  //             headers: {
  //               'Accept': 'application/json', 
  //               'Content-Type': 'application/json',
  //             }
  //           });
  //           const res = await login.json();
  //           dispatch(setAuthUser(res));
  //         }
  //       );
  //     } else {
  //       console.error('User cancelled login or did not fully authorize.');
  //     }
  //   }, { scope: 'public_profile,email' });
  // };

	return(
    <div className={"auth-container"}>
      <div className={"auth-wrapper"}>
        <div className={"auth-form-wrapper"}>
          <div className={"logo-wrapper"}>
            <div className={"logo-container"}>
              <div className={"logo-icon-wrapper"}>
                <img src={chatIcon} className={'chat-icon'}/>
              </div>
              <h1 className={"logo-title"}>{'Welcome Back!'}</h1>
              <p className={"logo-subtext"}>{'Login to your account'}</p>
            </div>
          </div>
          <form method={'POST'} className={'formContainer'} onSubmit={e=>handleNativeLogin(e)}>
            <div className={'inputContainer'}>
              <label htmlFor={'login_mail'} className={'label'}>{'Email: '}</label>
              <div className={'input-group'}>
                <div className={'input-icon-left'}>
                  <img src={emailIcon} className={'input-icon'}/>
                </div>
                <input 
                  type={'email'}
                  className={'input'}
                  placeholder={'example@email.com'}
                  value={loginInfo.email} 
                  id={'login_mail'} 
                  name={'email'} 
                  autoComplete={"on"} 
                  onChange={e=>handleLoginInput(e)} />
              </div>
            </div>
            <div className={'inputContainer'}>
              <label htmlFor={'login_password'} className={'label'}>{'Password: '}</label>
              <div className={'input-group'}>
                <div className={'input-icon-left'}>
                  <img src={lockIcon} className={'input-icon'}/>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className={'input'}
                  placeholder={"••••••"}
                  value={loginInfo.password} 
                  id={'login_password'} 
                  name={'password'}
                  autoComplete={"current-password"} 
                  onChange={e=>handleLoginInput(e)} />
                <button type={'button'} className={'toggle-password'} onClick={handleShowPasswordToggle}>
                  { showPassword 
                    ? <img src={eyeClosed} className={'input-icon'}/> 
                    : <img src={eyeOpen} className={'input-icon'}/> }
                </button>
              </div>
            </div>
            <button type={'submit'} className={"auth-btn"} disabled={isLoggingIn}>
              {'Login'}
            </button>
          </form>
          <div className={'auth-footer'}>
            <p className={'text-color'}>
              {"Don't have an account? "}<Link to="/signup">{'Create account'}</Link>
            </p>
          </div>
          <div className={'provider-section'}>
            <p className={'text-color'}>{'or'}</p>
          </div>
          <div>
            <button type={'button'} className={"auth-btn"} disabled={isLoggingIn} onClick={handleGoogleLogin}>
              <div className={'provider-label'}>
                <img src={googleIcon} className={'auth-icon'}/>&nbsp;{'Login With Google'}
              </div>
            </button>
          </div>
          {/* <div>
            <button type={'button'} className={"auth-btn"} disabled={isLoggingIn} onClick={handleFacebookLogin}>
              <div className={'provider-label'}>
                <img src={facebookIcon} className={'auth-icon'}/>&nbsp;{'Login With Facebook'}
              </div>
            </button>
          </div> */}
        </div>
      </div>
    </div>
	);
};