
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", express.static('./src/css'))
app.use("/scripts", express.static('./src/js'));

MongoClient.connect(db.url, (err, database) => {
    if (err) return console.log(err)
    database.collection('game_process').remove();
    database.collection('games_list').remove();
    require('./app/routes')(app, database);
    app.get('/', function(req, res){
        res.sendFile(__dirname + '/src/index.html');
    });
    app.listen(port, () => {
        console.log('We are live on ' + port);
    });
})