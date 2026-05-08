import chatIcon from '../icons/chat.svg';
import logoutIcon from '../icons/logout.svg'
import settingsIcon from '../icons/settings.svg';
import personIcon from '../icons/person.svg';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { Link } from "react-router-dom";
import { logout } from '../store/user/userSlice';
import type { NavbarProps } from '..';
export default function Navbar({ socketRef }: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { authUser } = useSelector((state: RootState) => state.user);

  function handleLogout() {
    dispatch(logout());
    if (socketRef.current?.connected) socketRef.current.disconnect();
  };

  return(
    <header className="header-container">
      <div className='navbar-container'>
        <div className='navbar-wrapper'>
          <div className='left-nav'>
            <Link to={'/'} className='left-link'>
              <div className='left-icon-container'>
                <img src={chatIcon} className={'chat-icon'}/>
              </div>
              <h1 className='left-link-text'>{'Qwick-Chat'}</h1>
            </Link>
          </div>
          <div className='right-nav'>
            <Link to={'/settings'} className='settings'>
              <img src={settingsIcon} className={'chat-icon'}/>&nbsp;
              <span className='right-text'>{'Settings'}</span>
            </Link>
            {authUser?.accessToken && (
              <>
                <Link to={'/profile'} className='profile-container'>
                  <img className='chat-icon' src={personIcon}/>&nbsp;
                  <span>Profile</span>
                </Link>
                <button className='logout-button' onClick={handleLogout}>
                  <img src={logoutIcon} className='chat-icon'/>
                  <span className='logout-span'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};