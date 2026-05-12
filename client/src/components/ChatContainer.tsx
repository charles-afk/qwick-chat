import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageSkeleton from './MessageSkeleton';
import MessageInput from './MessageInput';
import avatarIcon from '../icons/avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import type { ChatContainerProps } from '..';
import { getMessages, setMessages } from '../store/chat/chatSlice';
export default function ChatContaimer({ socketRef }: ChatContainerProps) {

	const dispatch = useDispatch<AppDispatch>();
	const { selectedUser, messages } = useSelector((state: RootState) => state.chat);
	const { authUser } = useSelector((state: RootState) => state.user);
	const messageEndRef = useRef<HTMLDivElement | null>(null);
	const isMessageLoading = false;

	useEffect(() => {
		if (selectedUser) dispatch(getMessages(authUser));
		else return;
		socketRef.current?.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.sender_id == selectedUser.id;
      if (!isMessageSentFromSelectedUser) return;
			dispatch(setMessages(newMessage));
    });
		return () => {
			socketRef.current?.off("newMessage");
		};
	}, [selectedUser?.id]);

	useEffect(() => {
    if (messageEndRef.current && messages) 
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

	if (isMessageLoading) {
		return(
			<div className='message-loading-skeleton'>
				<ChatHeader/>
				<MessageSkeleton/>
				<MessageInput/>
			</div>
		);
	}

	function formatMessageTime(date: Date | undefined | string) {
		if (!date) return;
		return new Date(date).toLocaleTimeString('en-US', {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		})
	}

  return(
		<div className='chat-container'>
			<ChatHeader/>
			<div className='chat-container-map'>
			{messages.map(message => (
				<div key={message.id} className={`chat ${message.sender_id === authUser?.id ? "chat-end" : "chat-start"}`} ref={messageEndRef}>
					<div className='chat-container-avatar'>
						<div className='chat-container-avatar-wrapper'>
							<img 
								alt="profile pic" 
								src={
									message?.sender_id === authUser?.id 
										? authUser?.profile_pic || avatarIcon
										: selectedUser?.profile_pic || avatarIcon
								} />
						</div>
					</div>
					<div className='chat-container-header'>
						<time className='chat-container-time'>
							{formatMessageTime(message?.created_at)}
						</time>
					</div>
					<div className='chat-container-bubble'>
						{message?.image && <img className='chat-container-bubble-img' src={message?.image} />}
						{message?.text && <p>{message?.text}</p>}
					</div>
				</div>
			))}
			</div>
			<MessageInput/> 
		</div>
	);
};