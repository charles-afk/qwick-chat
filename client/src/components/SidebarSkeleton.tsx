export default function SidebarSkeleton(){
	const skeletonContacts = Array(8).fill(null);
	return(
		<aside className="skeleton-side-container">
			<div className="skeleton-side-header">
				<div className="skeleton-side-header-title">
					<span className="skeleton-side-header-title-span">Contacts</span>
				</div>
			</div>
			<div className="skeleton-side-contact">
			{skeletonContacts.map((_, idx) => (
				<div key={idx} className="skelecton-side-contact-wrapper">
					<div className="skeleton-side-avatar">
						<div className="skeleton-side-avatar-icon"/>
					</div>
					<div className="skeleton-side-info">
						<div className="skeleton-side-info-1"/>
						<div className="skeleton-side-info-2"/>
					</div>
				</div>
			))}
			</div>
		</aside>
	);
};