import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import sendIcon from '../icons/send.svg';
import crossIcon from '../icons/cross.svg';
import galleryIcon from '../icons/gallery.svg';
import { sendMessage } from '../store/chat/chatSlice';
import type { AppDispatch } from '../store';
import { useDispatch } from 'react-redux';
import toast from "react-hot-toast";
export default function MessageInput() {

	const dispatch = useDispatch<AppDispatch>();
	const [text, setText] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
		if (!e?.target?.files || e?.target?.files?.length === 0) return;
		const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
		reader.readAsDataURL(file);
    reader.onloadend = () => {
			const base64Image = reader.result;
			if (typeof base64Image === "string") {
      	setImagePreview(base64Image);
			}
    };
	};

	function removeImage() {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

	function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
		setText(e?.target?.value)
	};

	async function handleSendMessage(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
    if (!text.trim() && !imagePreview) return;
		try {
			const files = fileInputRef.current?.files;
			const file = files && files.length > 0 ? files[0] : null;
			await dispatch(sendMessage({ text: text.trim(), file }));
			setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
		} catch(err) {
			console.error("Failed to send message:", err);
		}
	};

	return(
		<div className="message-input-container">
		{imagePreview && (
			<div className="image-preview-container">
				<div className="image-preview-wrapper">
					<img src={imagePreview} alt="Preview" className="image-preview"/>
					<button onClick={removeImage} className="image-remove-button">
						<img src={crossIcon} className="chat-icon"/>
					</button>
				</div>
			</div> )}
			<form onSubmit={handleSendMessage} className="message-input-form">
				<div className="message-input-form-wrapper">
					<input
						type="text"
						placeholder="Type a message..."
						value={text}
						onChange={e=>handleTextChange(e)}
						name="chat-input"
						className="message-input-form-text" />
					<input
						type="file"
            accept="image/*"
						className="message-input-image-upload"
						name='chat-file'
						ref={fileInputRef}
						onChange={handleImageChange} />
					<button className="message-input-chat-send" onClick={() => fileInputRef.current?.click()}>
						<img src={galleryIcon} className="chat-icon"/>
					</button>
				</div>
				<button type={'submit'} disabled={!text.trim() && !imagePreview} className="message-handle-send">
					<img src={sendIcon} className={`extra ${!text.trim() && !imagePreview ? '' : 'extra2'}`}/>
				</button>
			</form>
		</div>
	);
};