import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { query } from '../lib/db.js';
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { app } from '../lib/socket.js';

export const signup = async(req, res) => {
	try {
		const { fullName, email, password } = req.body ?? {};
		if (!fullName || !email || !password) return res.status(400).json({ message: "All Fields Required" });
		if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

		let sql = 'SELECT `id` FROM `users` WHERE `email` = ? AND `provider` = ? ;';
		let params = [email, 'native'];
		const [userExists] = await query(sql, params);
		if (userExists) return res.status(409).json({ message: "Email Already Exists" });

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password.normalize(), salt.normalize());

		sql = 'INSERT INTO `users` (`full_name`, `email`, `password`, `provider`, `created_at`) VALUES ? ;';
		params = [[fullName, email, hashedPassword, 'native', new Date()]];
		const newUser = await query(sql, [params]);

		const { insertId } = newUser ?? {};
		sql = 'SELECT `full_name`, `email`, `id`, `provider`, `profile_pic`, `created_at` FROM `users` WHERE `id` = ?;';
		params = [insertId];
		const [newUserInfo] = await query(sql, [params]);

		if (newUserInfo) {
			const { id, full_name, email, profile_pic, created_at } = newUserInfo ?? {};
			const accessToken = jwt.sign({ id }, app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, { expiresIn: app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE });
			const refreshToken = jwt.sign({ id }, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET, { expiresIn: app.locals.secrets.JWT_REFRESH_TOKEN_EXPIRE });
			req.session.userID = id;
      req.session.fullName = fullName;
      req.session.email = email;
      req.session.provider = 'native';
      req.session.profilePic = '';
      req.session.createdAt = created_at;
			req.session.refreshToken = refreshToken;
			res.status(200).json({ id, full_name, email, profile_pic, created_at, accessToken });
		} else {
			res.status(409).json({ message: "Signup Failed" });
		}
	} catch(error) {
		console.error("Error in signup controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	};
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body ?? {};

		let sql = 'SELECT * FROM `users` WHERE `email` = ? AND `provider` = ? ;';
		let params = [email, 'native'];
		const [ userFound ] = await query(sql, params);
		if (!userFound) return res.status(400).json({ message: "Invalid credentials" });

		const { password: userPassword, full_name, profile_pic, created_at, id } = userFound ?? {};
		const isPasswordCorrect = await bcrypt.compare(password.normalize(), userPassword.normalize());
		if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

		const accessToken = jwt.sign({ id }, app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, { expiresIn: app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE });
		const refreshToken = jwt.sign({ id }, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET, { expiresIn: app.locals.secrets.JWT_REFRESH_TOKEN_EXPIRE });
			
		req.session.userID = id;
    req.session.fullName = full_name;
    req.session.email = email;
    req.session.provider = 'native';
    req.session.profilePic = profile_pic;
    req.session.createdAt = created_at;
		req.session.refreshToken = refreshToken;

		res.status(200).json({ id, full_name, email, profile_pic, created_at, accessToken });
	} catch(error) {
		console.error("Error in login controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
  try {
    res.clearCookie('jid', { path: '/auth/refresh' });
    req.session.destroy();
    res.status(200).json({});
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const googleOAuth = async (req, res) => {
  try{
    const GOOGLE_API = 'https://www.googleapis.com/auth/userinfo';
    const scope = [`${GOOGLE_API}.email`, `${GOOGLE_API}.profile`].join(' ');
    const state = Math.random().toString(36).substring(2);
    const client_id = '652502340824-ri5js6t45rfdovb56gmb1ob787dkl454.apps.googleusercontent.com';
    const redirect_uri = 'https://api.qwick-chat.com/auth/google-login';
    const options = {
      state,
      scope,
      client_id,
      redirect_uri,
      access_type: 'offline',
      response_type: 'code',
      include_granted_scopes: 'true',
      prompt: 'consent',
    };
    const query = new URLSearchParams(options);
    const code = `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`;
    res.status(200).json({ code });
  } catch(error) {
    console.log("Error in google oauth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const client_id = '652502340824-ri5js6t45rfdovb56gmb1ob787dkl454.apps.googleusercontent.com';
    const redirect_uri = 'https://api.qwick-chat.com/auth/google-login';
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: req.query.code,
        client_id,
        client_secret: app.locals.secrets.GOOGLE_SECRET,
        redirect_uri,
        grant_type: "authorization_code"
      }),
    });
    const tokenData = await tokenResponse.json();
    const { id_token, access_token, expires_in, refresh_token } = tokenData ?? {};

    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
      headers: { Authorization: `Bearer ${id_token}` }
    });
    const { url } = userInfoResponse ?? {};
    const infoRequest = await fetch(url);
    const data = await infoRequest.json();
    const { email, given_name } = data ?? {};

		let sql = 'SELECT * FROM `users` WHERE `email` = ? AND `provider` = ? ;';
		let params = [email, 'google'];
		const [ userExists ] = await query(sql, params);

    let accessToken;
    let refreshToken;
    if (!userExists) {
			sql = 'INSERT INTO `users` (`full_name`, `email`, `provider`, `created_at`) VALUES ? ;';
			params = [[given_name, email, 'google', new Date()]];
			const newUser = await query(sql, [params]);

      const { id } = newUser;
      req.session.userID = id;
      req.session.profilePic = '';
      if (newUser) await newUser.save();
      accessToken = jwt.sign({ id }, app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, { expiresIn: `${app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE}` });
      refreshToken = jwt.sign({ id }, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET, { expiresIn: `${app.locals.secrets.JWT_REFRESH_TOKEN_EXPIRE}` });
    } else {
      const { id, profile_pic } = userExists ?? {};
      req.session.userID = id;
      req.session.profilePic = profile_pic;
      accessToken = jwt.sign({ id }, app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, { expiresIn: `${app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE}` });
      refreshToken = jwt.sign({ id }, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET, { expiresIn: `${app.locals.secrets.JWT_REFRESH_TOKEN_EXPIRE}` });
    }

    req.session.fullName = given_name;
    req.session.email = email;
    req.session.refreshToken = refreshToken;
    req.session.accessToken = accessToken;
    req.session.provider = 'google';
    req.session.exp = expires_in
    req.session.idToken = id_token;
    
    res.redirect('https://qwick-chat.com');
  } catch (error) {
    console.error("Error in google login controller", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const imageUpload = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;
    if (!fileType) return res.status(400).json({ message: "Profile pic is required" });
    const s3 = new S3Client({ region: "us-east-1" });
    const commandOptions = {
      Bucket: 'chat-demo-362552858517-us-east-1-an',
      Key: `uploads/${Date.now()}-${fileName}`,
      //ContentType: fileType,
    };
    const command = new PutObjectCommand(commandOptions);
    const uploadURL = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });
    res.status(200).json({ uploadURL, key: commandOptions.Key });
  } catch(error) {
    console.log("error in update profile:", error);
    res.status(500).send("Error generating URL");
  }
};

export const storeProfilePic = async (req, res) => {
  try {
    const { fileUrl } = req.body ?? {};
    const sql = 'UPDATE `users` SET `profile_pic` = ? WHERE id = ?;';
    let params = [fileUrl, req.session.id];
    await query(sql, params);
    req.session.profilePic = fileUrl;
    res.status(200).json({message: 'Profile Pic Stored Succesfully'});
  } catch(error) {
    console.log("error in store profile pic:", error);
    res.status(500).send("Error storing profile pic");
  }
};

export const checkAuth = async (req, res) => {
  if (!req.session.refreshToken) return res.status(403).json({ message: 'Session Expired' });
  try {
    const decoded = jwt.verify(req.session.refreshToken, app.locals.secrets.JWT_REFRESH_TOKEN_SECRET);
    if (decoded) {
      const token = jwt.sign({ id: req.session.userID }, app.locals.secrets.JWT_ACCESS_TOKEN_SECRET, { expiresIn: app.locals.secrets.JWT_ACCESS_TOKEN_EXPIRE });
      res.json({ full_name: req.session.fullName, accessToken: token, email: req.session.email, profile_pic: req.session.profilePic, createdAt: req.session.createdAt, id: req.session.userID }).status(200);
    }
  } catch (error) {
    console.error(error)
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Session Expired' })
    }
  }
};