import { useState, type ChangeEvent } from 'react';
import { updateProfile } from '../../store/user/userSlice';
import avatarIcon from '../../icons/avatar.png';
import cameraIcon from '../../icons/camera.svg';
import personIcon from '../../icons/person.svg';
import mailIcon from '../../icons/send.svg'
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
export default function Profile() {
	const dispatch = useDispatch<AppDispatch>();
  const { authUser } = useSelector((state: RootState) => state.user);
	const [selectedImg, setSelectedImg] = useState<string | null>(null);

	async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
		if (!e?.target?.files || e?.target?.files?.length === 0) return;
		const file = e?.target?.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async () => {
			const base64Image = reader.result;
			if (typeof base64Image === "string") {
				setSelectedImg(base64Image);
				await dispatch(updateProfile({ file }));
			}
		}
	};

	return(
		<div className='profile-conatiner'>
			<div className='profile-inner-container'>
				<div className='profile-wrapper'>
					<div className='profile-header-container'>
						<h1 className='profile-header-title'>Profile</h1>
						<p className='profile-header-sub'>Your profile information</p>
					</div>
					<div className='avatar-upload'>
						<div className='avatar-upload-wrapper'>
							<img
								src={selectedImg || authUser?.profile_pic || avatarIcon}
								alt={'Profile'}
								className='profile-avatar-icon'/>
							<label className='profile-avatar-label'>
								<img className='profile-camera-icon' src={cameraIcon}/>
								<input
									type={'file'}
									id="avatar-upload"
									accept="image/*"
									className='hide-input'
									onChange={(e)=>handleImageUpload(e)} />
							</label>
						</div>
						<p className='profile-subtext'>
							{"Click the camera icon to update your photo"}
						</p>
					</div>
					<div>
						<div>
							<div className='profile-name-label-wrapper'>
								<img className='profile-name-icon chat-icon' src={personIcon}/> Full Name
							</div>
							<p className='profile-fullName'>{authUser?.full_name}</p>
						</div>
						<div>
							<div className='profile-email-wrapper'>
								<img className='profile-name-icon chat-icon' src={mailIcon}/> Email Address
							</div>
							<p className='profile-fullName'>{authUser?.email}</p>
						</div>
					</div>
					<div className='profile-sub-container'>
						<h2 className='profile-sub-header'>Account Information</h2>
						<div className='profile-sub-wrapper'>
							<div className='profile-member-container'>
								<span>Member Since</span>
								<span>{authUser?.createdAt?.split("T")[0]}</span>
							</div>
							<div className='profile-account-container'>
								<span>Account Status</span>
								<span className='profile-active'>Active</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};