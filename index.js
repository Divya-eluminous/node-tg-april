const express = require('express');
const app = express();
const PORT = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use('/uploads',express.static('uploads'));
const db = require('./config/mongoose');

require('./routes/routes')(app);



app.listen(PORT,console.log(`server started on port ${PORT}`));

