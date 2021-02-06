const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback';

app.get('/api/auth/login', function(req, res) {
	console.log(process.env.SPOTIFY_CLIENT_ID)
	console.log(redirect_uri)
	res.redirect(
		'https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: process.env.SPOTIFY_CLIENT_ID,
				scope: 'user-read-private user-read-email user-top-read',
				redirect_uri
			})
	);
});

app.get('/api/auth/callback', function(req, res) {
	const code = req.query.code || null;
	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			code: code,
			redirect_uri,
			grant_type: 'authorization_code'
		},
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		json: true
	};
	request.post(authOptions, function(error, response, body) {
		console.log(body);
		const { refresh_token, access_token } = body;
		const uri = process.env.FRONTEND_URI || 'http://localhost:8000';
		res.redirect(uri + '?access_token=' + access_token + '&refresh_token=' + refresh_token);
	});
});

app.post('/refresh', function(req, res) {
	const code = req.body.code || null;
	console.log(code);
	console.log(req.body);

	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		form: {
			refresh_token: code,
			grant_type: 'refresh_token'
		},
		headers: {
			Authorization:
				'Basic ' +
				new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		json: true
	};
	request.post(authOptions, function(error, response, body) {
		console.log(response.body);
		res.json(response.body);
	});
});

module.exports.handler = serverless(app);


// const port = process.env.PORT || 8888;
// console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`);
// app.listen(port);
