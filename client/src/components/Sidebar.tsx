import SidebarSkeleton from './SidebarSkeleton.tsx';
import userIcon from '../icons/person.svg';
import avatarIcon from '../icons/avatar.png'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, setSelectedUser } from '../store/chat/chatSlice';
import type { AuthUser } from '..';
import type { AppDispatch, RootState } from '../store';
export default function Sidebar() {
	const dispatch = useDispatch<AppDispatch>();
	const { isUsersLoading, users, selectedUser } = useSelector((state: RootState) => state.chat);
	const { authUser, onlineUsers } = useSelector((state: RootState) => state.user);

	const [showOnlineOnly, setShowOnlineOnly] = useState(false);

	useEffect(() => {
		dispatch(getUsers(authUser));
	}, [getUsers])

	function handleSelectUser(user: AuthUser) {
		dispatch(setSelectedUser(user));
	}

	const filteredUsers = showOnlineOnly ? users.filter((user) => onlineUsers.includes(Number(user.id))) : users;

	if (isUsersLoading) return <SidebarSkeleton/>;

  return(
		<aside className="sidebar-container">
			<div className="sidebar-header-container">
				<div className="sidebar-header-wrapper">
					<img src={userIcon} className='chat-icon'/>
					<span className="sidebar-header-title">Contacts</span>
				</div>
				<div className='sidebar-toggle-container'>
					<label className='sidebar-label'>
						<input 
							type='checkbox'
							checked={showOnlineOnly}
							onChange={(e) => setShowOnlineOnly(e.target.checked)}
							className='sidebar-checkbox' />
						<span className='sidebar-toggle-span'>Show online only</span>
					</label>
					<span className='sidebar-toggle-span2'>({onlineUsers?.length - 1} online)</span>
				</div>
			</div>
			<div className='sidebar-users-container'>
			{filteredUsers.map(user => (
				<button key={user?.id} className={`sidebar-users-button ${selectedUser?.id === user.id ? 'selected-sidebar' : ''}`} onClick={()=>handleSelectUser(user)}>
					<div className='sidebar-user-status-container'>
						<img 
							src={user?.profile_pic || avatarIcon} 
							alt={user?.full_name} 
							className='sidebar-user-avatar' />
						{onlineUsers.includes(user.id) && (
							<span className="side-online-status"/>
						)}
					</div>
					<div className='sidebar-user-list'>
						<div className='sidebar-user'>{user?.full_name}</div>
						<div className='sidebar-user-status-label'>
							{onlineUsers.includes(user.id) ? "Online" : "Offline"}
						</div>
					</div>
				</button>
			))}
			{filteredUsers.length === 0 && ( <div className='sidebar-online-users'>No online users</div> )}
			</div>
		</aside>
	);
};