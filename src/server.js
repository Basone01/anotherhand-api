const config = require('./config');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
// const db = require('./services/db');
const applyRoutes = require('./routes');
const applySocketIO = require('./services/socket');
mongoose.Promise = global.Promise;
mongoose.connect(config.db, (err) => {
	if (!err) {
		console.log('MongoDB Connected');
		const db = mongoose.connection;
		db.on('error', console.error.bind(console, 'MongoDB connection error:'));

		const port = process.env.PORT || 3000;
		const server = http.createServer(app).listen(port, () => {
			console.log(`Server started on port ${port}`);
		});
		const socketIO = applySocketIO(server);

		app.use(cors());
		app.use((req, res, next) => {
			req.socketIO = socketIO;
			next();
		});
		app.use(bodyParser.json({ limit: '20mb' }));
		app.use(
			bodyParser.urlencoded({
				extended: true
			})
		);
		app.use(logger('dev'));
		app.use(express.static(path.join(__dirname, 'public'),{index:"_"}));
		app.use('/static',express.static(path.join(__dirname, 'public/static')));

		app.get('/', (req, res) => {
			return res.sendFile(path.join(__dirname, 'public/index.html'));
		});
		
		applyRoutes(app);
		app.get('*', (req, res) => {
			return res.sendFile(path.join(__dirname, 'public/index.html'));
		});

		app.use((err, req, res, next) => {
			// console.error(err);
			console.error(err.message);
			return res.status(500).send(err.message);
		});
	}
	else {
		console.log(err);
	}
});
