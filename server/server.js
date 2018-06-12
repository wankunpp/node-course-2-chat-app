const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '..', 'public');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

app.get('/try', (req,res) =>{
    res.send('set up')
})

app.listen(port, () =>{
    console.log(`Started up at port ${port}`);
    
})