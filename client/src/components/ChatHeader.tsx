import avatarIcon from '../icons/avatar.png';
import crossIcon from '../icons/cross.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedUser } from '../store/chat/chatSlice';
import type { RootState, AppDispatch } from '../store';
export default function ChatHeader() {
	const dispatch = useDispatch<AppDispatch>();
	const { onlineUsers } = useSelector((state: RootState) => state.user); 
	const { selectedUser } = useSelector((state: RootState) => state.chat); 

	function unselectUser() {
		dispatch(setSelectedUser(null));
	};

	let onlineOrOffline = false;
	if (selectedUser) onlineOrOffline = onlineUsers.includes(selectedUser?.id) ? true : false;

	return(
		<div className='chat-header-container'>
			<div className='chat-header-wrapper2'>
				<div className='chat-header-text-container'>
					<div className='chat-header-avatar'>
						<div className='chat-header-image-container'>
							<img src={selectedUser?.profile_pic || avatarIcon}/>
						</div>
					</div>
					<div>
						<h3 className='chat-header-h3'>{selectedUser?.full_name}</h3>
						<p className='chat-header-online-status'>
							{onlineOrOffline ? "Online" : "Offline"}
						</p>
					</div>
				</div>
				<button onClick={unselectUser} className='cross-button'>
					<img alt='cross' src={crossIcon} className='cross-icon'/>
				</button>
			</div>
		</div>
	);
};