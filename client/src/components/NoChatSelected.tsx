import chatIcon from '../icons/chat.svg';
export default function NoChatSelected() {
	return(
		<div className="nochat-container">
			<div className="nochat-wrapper">
				<div className="nochat-icon-container">
					<div className="nochat-icon-wrapper">
						<div className="nochat-icon-holder">
							<img className='nochat-icon' src={chatIcon}/>
						</div>
					</div>
				</div>
				<h2 className="nochat-title">
					{'Welcome!'}
				</h2>
				<p className="nochat-content">
					{'Select a conversation from the sidebar to start chatting'}
				</p>
			</div>
		</div>
	);
};