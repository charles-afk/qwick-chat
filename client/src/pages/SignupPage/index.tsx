import personIcon from '../../icons/person.svg';
import chatIcon from '../../icons/chat.svg';
import emailIcon from '../../icons/email.svg';
import lockIcon from '../../icons/lock.svg';
import eyeOpen from '../../icons/eye-open.svg';
import eyeClosed from '../../icons/eye-close.svg';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { signup } from '../../store/user/userSlice';
import type { AppDispatch } from '../../store';
import toast from "react-hot-toast";
export default function SignUp() {
  const dispatch = useDispatch<AppDispatch>();
  
  const [signUpInfo, setSignUpInfo] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  function validateForm() {
    if (!signUpInfo.fullName.trim()) return toast.error("Full name is required");
    if (!signUpInfo.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(signUpInfo.email)) return toast.error("Invalid email format");
    if (!signUpInfo.password) return toast.error("Password is required");
    if (signUpInfo.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  function handleSignUpInput(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target ?? {};
    setSignUpInfo(previousSignupInfo => ({ ...previousSignupInfo, [name]: value }));
  };

  function handleShowPasswordToggle(): void {
    setShowPassword(prev => !prev);
  };

  function handleSignUp(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const success = validateForm();
    if (success === true) dispatch(signup(signUpInfo));
  };
  
  return(
    <div className={"auth-container"}>
      <div className={"auth-wrapper"}>
        <div className={"auth-form-wrapper"}>
          <div className={"logo-wrapper"}>
            <div className={"logo-container"}>
              <div className={"logo-icon-wrapper"}>
                <img src={chatIcon} className={'chat-icon'}/>
              </div>
              <h1 className={"logo-title"}>{'Create Account'}</h1>
              <p className={"logo-subtext"}>{'Get started with your free account'}</p>
            </div>
          </div>
          <form method={'POST'} className={'formContainer'} onSubmit={e=>handleSignUp(e)}>
            <div className={'inputContainer'}>
              <label htmlFor={'signup_fullname'} className={'label'}>{'Full Name: '}</label>
              <div className={'input-group'}>
                <div className={'input-icon-left'}>
                  <img src={personIcon} className={'input-icon'}/>
                </div>
                <input 
                  type={'text'}
                  className={'input'}
                  placeholder={'John Doe'}
                  value={signUpInfo.fullName} 
                  id={'signup_fullname'} 
                  name={'fullName'} 
                  autoComplete={"on"} 
                  onChange={e=>handleSignUpInput(e)} />
              </div>
            </div>
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
                  value={signUpInfo.email} 
                  id={'login_mail'} 
                  name={'email'} 
                  autoComplete={"on"} 
                  onChange={e=>handleSignUpInput(e)} />
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
                  value={signUpInfo.password} 
                  id={'login_password'} 
                  name={'password'}
                  autoComplete={"current-password"} 
                  onChange={e=>handleSignUpInput(e)} />
                <button type={'button'} className={'toggle-password'} onClick={handleShowPasswordToggle}>
                  { showPassword 
                    ? <img src={eyeClosed} className={'input-icon'}/> 
                    : <img src={eyeOpen} className={'input-icon'}/> }
                </button>
              </div>
            </div>
            <button type={'submit'} className={"auth-btn"} disabled={false}>
              {'Sign Up'}
            </button>
          </form>
          <div className={'auth-footer'}>
            <p className={'text-color'}>
              {"Already have an account? "}<Link to="/login">{'Log in'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};