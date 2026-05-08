import sendIcon from '../../icons/send.svg'
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setTheme } from '../../store/user/userSlice';
export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const PREVIEW_MESSAGES = [
    { content: "Hey! How's it going?", isSent: false },
    { content: "I'm doing great! Just working on some new features.", isSent: true },
  ];

  const THEMES = [
    "light",
    "dark",
    "coffee",
    "dracula",
    "luxury",
    "aqua",
    "forest",
    "nord",
  ];

  function handleThemeChange(theme: string): void {
    dispatch(setTheme(theme));
  }

  return(
    <div className="settings-container">
      <div>
        <h2 style={{color:'#c59f61'}}>{'Theme'}</h2>
        <p style={{color:'#c59f61'}}>{'Choose a theme for your chat interface'}</p>
      </div>
      <div className="settings-grid">
      {THEMES.map(theme => (
        <div key={theme} className="theme-area">
          <button className="theme-button" data-theme={theme} onClick={()=>handleThemeChange(theme)}>
            <div className="theme-wrapper" >
              <div className="theme-container">
                <div className="primary-theme"></div>
                <div className="secondary-theme"></div>
                <div className="accent-theme"></div>
                <div className="neutral-theme"></div>
              </div>
            </div>
          </button>
          <span style={{color:'white'}}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        </div>
      ))}
      </div>
      <h3 style={{color:'#c59f61'}}>{'Preview'}</h3>
      <div className="chat-contaier">
        <div className="chat-wrapper">
          <div className="chat-inner">
           <div className="chat-content">
            <div className="chat-header">
              <div className="chat-header-wrapper">
                <div className="chat-avatar">{'J'}</div>
                <div>
                  <h3 className="chatter-name">{'John Doe'}</h3>
                  <p className="chatter-status">{'Online'}</p>
                </div>
              </div>
            </div>
              <div className="chat-section">
              {PREVIEW_MESSAGES.map((message, index) => (
                <div key={index} className={`chat-msg ${message.isSent ? 'chat-isSent' : 'chat-IsNotSent'}`}>
                  <div className={`chat-msg ${message.isSent ? 'chat-msg-bg' : 'chat-msg-bg2'}`}>
                    <p className="chat-text">{message.content}</p>
                    <p className={`chat-time ${message.isSent ? 'time-isSent' : 'time-isNotSent'}`}>
                      {'12:00 PM'}
                    </p>
                  </div>
                </div>
              ))}
              </div>
              <div className="msg-input-container">
                <div className="msg-wrapper">
                  <input 
                    type={"text"}
                    className="prev-input"
                    placeholder="Type a message..."
                    value={'This is a preview'}
                    readOnly />
                  <button className='prev-button'>
                    <img src={sendIcon} width={25} height={25}/>
                  </button>
                </div>
              </div> 
            </div> 
          </div>
        </div> 
      </div>
    </div>
  );
};