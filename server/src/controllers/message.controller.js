import { getReceiverSocketId, io } from "../lib/socket.js";
import { query } from "../lib/db.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    let sql = 'SELECT `full_name`, `email`, `id`, `provider`, `profile_pic`, `created_at` FROM `users` WHERE NOT (`email` = ? AND `provider` = ?);';
    let params = [req.session.email, req.session.provider];
    const sidebarUsers = await query(sql, params);
    res.status(200).json(sidebarUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params ?? {};
    let sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?);';
    let params = [req.session.userID, userToChatId, userToChatId, req.session.userID];
    const messages = await query(sql, params);
    messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body ?? {};
    const { id: receiverId } = req.params ?? {};
    const senderId = req.session.userID;

    let sql = 'INSERT INTO `messages` (`sender_id`, `receiver_id`, `text`, `image`) VALUES ? ;';
    let params = [[senderId, receiverId, text, image]];
    const newMessage = await query(sql, [params]);

    const { insertId } = newMessage ?? {};
		sql = 'SELECT * FROM `messages` WHERE `id` = ?;';
		params = [insertId];
		const [newMessageInfo] = await query(sql, [params]);
    
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessageInfo);
    }

    res.status(201).json(newMessageInfo);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};