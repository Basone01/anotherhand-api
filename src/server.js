const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const path = require('path');
const socketIO = require('./services/socket')(server);
const db = require('./services/db');

const applyRoutes = require('./routes');
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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname, 'public/index.html'));
});

applyRoutes(app);

app.get('*', (req, res) => {
	return res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use((err, req, res, next) => {
	console.error(err);
	return res.status(500).send(err.message);
});

server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
