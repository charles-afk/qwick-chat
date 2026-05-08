import Sidebar from '../../components/Sidebar.tsx';
import NoChatSelected from '../../components/NoChatSelected.tsx';
import ChatContaimer from '../../components/ChatContainer.tsx';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { HomeProps } from '../..';
export default function Home({ socketRef }: HomeProps) {
	const { selectedUser } = useSelector((state: RootState) => state.chat);

	return (
		<div className='home-container'>
			<div className='home-wrapper'>
				<div className='home-contents'>
					<div className='home-inner'>
						<Sidebar/>
						{!selectedUser ? <NoChatSelected/> : <ChatContaimer socketRef={socketRef}/>}
					</div>
				</div>
			</div>
		</div>
	)
};