const express = require('express');
const linkPreview = require('./linkpreview');
const cors = require('cors'); 
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  // 許可するオリジン
    credentials: true  // 資格情報を許可
  }));
app.use(express.json());
app.use('/link-preview', linkPreview); 

app.use(express.static('public'));

app.listen(5001, function () {
    console.log('App is listening on port 5001');
});
