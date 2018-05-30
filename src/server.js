const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

const db = require('./services/db');
const applyRoutes = require('./routes');

app.use(cors());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({
    extended: true 
}));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname, 'public/client/index.html'));
});

applyRoutes(app);

app.get('*', (req, res) => {
	return res.sendFile(path.join(__dirname, 'public/client/index.html'));
});

app.use((err, req, res, next) => {
	console.error(err);
	return res.status(500).send(err.message);
});

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
