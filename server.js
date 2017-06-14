'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(bodyParser.json());

var config = {
  user: user,
  database: database,
  password: password, 
  host: host, 
  port: port, 
  max: 20, 
  idleTimeoutMillis: 30000 
};

const pool = new pg.Pool(config);


module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

app.post('/login', function(req,res) {
	const userName = req.body.user;
	const pass = req.body.pass;

	pool.query('SELECT passwords FROM users.users WHERE user_name = $1', [userName], function(err, result) {
		if(err) {
			res.send({
				"error": err.message
			});
		}else{
			if(result.rows[0] === undefined){
				res.send({
					"status": "error", "message": "Wrong username or password."
				})
			}else if(result.rows[0].passwords === pass){
				let token = jwt.sign({"user": userName, "password": pass}, 'shhhhhhhhh');
				res.json({
					success: true,
					token: token
				})
			}else{
				res.send({
					"status": "error", "message": "Wrong username or password."
				})
			}
		}
		});
})


app.post('/register', function(req,res) {
	const userName = req.body.user;
	const pass = req.body.pass;


	pool.query('SELECT user_name FROM users.users WHERE user_name = $1', [userName], function(err, result) {
		if(err) {
			res.send({
				"error": err.message
			});
		}else{
			if(result.rows[0] === undefined){
				pool.query('INSERT INTO users.users (passwords, user_name) VALUES( $1, $2);', [pass ,userName], function(err, result) {
					if(err) {
						res.send({
							"error": err.message
						});
					}else{
						let token = jwt.sign({"user": userName, "password": pass}, 'shhhhhhhhh');
						res.json({
							success: true,
							token: token
						})
					}
				});
			}else{
				res.send({
					"status": "error", 
					"message": "Username is already taken."
				})
			}
		}
	});
})



app.listen(process.env.PORT || 3000);