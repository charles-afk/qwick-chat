export default function MessageSkeleton() {
	const skeletonMessages = Array(6).fill(null);
	return(
		<div className="message-skeleton-container">
		{skeletonMessages.map((_, idx) => (
			<div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
				<div className="chat-image avatar">
					<div className="chat-avatar-placeholder">
						<div className="avatar-placeholder"/>	
					</div>
				</div>
				<div className="chat-header-msg-skeleton-wrapper">
					<div className="chat-header-msg-skeleton"/>
				</div>
				<div className="chat-bubble-wrapper">
					<div className="chat-bubble"/>
				</div>
			</div>
		))}
		</div>
	)
};