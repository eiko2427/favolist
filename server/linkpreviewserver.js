const express = require('express');
const linkPreview = require('./linkpreview');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json());
app.use('/link-preview', linkPreview); 

app.use(express.static('public'));

app.listen(5001, function () {
    console.log('App is listening on port 5001');
});
