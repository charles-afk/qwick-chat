import mysql from 'mysql2';
import { app } from './socket.js';

const pool = mysql.createPool({
	connectionLimit: 10,
	host:  app.locals.secrets.DB_HOST,
	user: app.locals.secrets.DB_USER,
	password: app.locals.secrets.DB_PASS,
	database: app.locals.secrets.DB_NAME
});

const query = async (sql, binding) => {
	return new Promise((resolve, reject) => {
		pool.query(sql, binding, (err, result, fields) => {
			if (err) reject(err);
			resolve(result);
		});
	});
};

export { query };