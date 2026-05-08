import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/LoginPage/';
import SignUp from './pages/SignupPage/';
import SettingsPage from './pages/SettingsPage';
import Home from './pages/HomePage';
import Profile from './pages/ProfilePage';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { Toaster } from 'react-hot-toast';
import useInit from './hooks/useInit';

function App() {
  const { theme } = useSelector((state: RootState) => state.user);
  const { authUser, isCheckingAuth, socketRef } = useInit();

  if (isCheckingAuth && !authUser?.accessToken) {
    return (
      <div style={{color:'white', display:'flex', alignItems:'center', justifyContent:'center', width: '100%'}}>
        {'Loading...'}
      </div>
    );
  }

  return (
    <main data-theme={theme}>
      <Navbar socketRef={socketRef} />
      <Routes>
        <Route path={'/'} element={authUser?.accessToken ? <Home socketRef={socketRef} /> : <Navigate to={'/login'}/>}/>
        <Route path={'/signup'} element={!authUser?.accessToken ? <SignUp /> : <Navigate to={'/'}/>}/>
        <Route path={'/login'} element={!authUser?.accessToken ? <Login/> : <Navigate to={'/'}/>}/>
        <Route path={'/settings'} element={<SettingsPage/>}/>
        <Route path={'/profile'} element={authUser?.accessToken ? <Profile/> : <Navigate to={'/login'}/>}/>
      </Routes>
      <Toaster />
    </main>
  );
}

export default App
