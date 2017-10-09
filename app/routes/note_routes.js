const express        = require('express');
var path    = require('path');
var ObjectID = require('mongodb').ObjectID;
var WINNING_COMBINATION = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
function genToken (size){
    var result = '';
    var words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    var max_position = words.length - 1;
    for( i = 0; i < size; ++i ) {
        position = Math.floor ( Math.random() * max_position );
        result = result + words.substring(position, position + 1);
    }
    return result;
}

function checkDraw(field)
{
    for (var i = 0; i < field.length; i++)
    {
        if (field[i] == 0)
            return false;
    }
    return true;
}

function getWinner(field) 
{
    for (var i = 0; i < WINNING_COMBINATION.length; i++)
    {
        var first = WINNING_COMBINATION[i][0];
        var second = WINNING_COMBINATION[i][1];
        var third = WINNING_COMBINATION[i][2];
        if(field[first] == field[second] && field[second] == field[third] && field[first] != 0)
        {
            var winner = (field[first] == 1) ? "owner" : "opponent";
            return winner;
        }          
    }
    if (checkDraw(field))
        return "draw";
    return "";
}

module.exports = function(app, db) {
    app.use("/styles", express.static(path.resolve('src/css')));
    app.use("/scripts", express.static(path.resolve('src/js')));
    app.get('/games/list', (req, res) => {
        db.collection('games_list').find().toArray(function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                var json = JSON.stringify({
                    games: result,
                });
                res.send(json);
            } 
        });
    });

    app.get('/games/:gameToken/:accessToken', (req, res) => {           
         const gameToken = req.params.gameToken;
           const details = { 'gameToken': gameToken };
           db.collection('games_list').findOne(details, (err, item) => {
             if (err) {
               res.send({'error':'An error has occurred'});
             } else {
               res.sendFile(path.resolve('src/gamePage.html'));
             } 
           });  
    });

    app.get('/games/:gameToken', (req, res) => { 
           const details = { 'gameToken': req.params.gameToken };
           db.collection('games_list').findOne(details, (err, item) => {
             if (err) {
               res.send({'error':'An error has occurred'});
             } else {
               res.sendFile(path.resolve('src/gamePage.html'));
             } 
           });  
    });

    app.post('/games/do_step', (req, res) => {    
        var details = { 'gameToken': req.body.gameToken };
        var winner = getWinner(req.body.field);    
        const note = { gameToken: req.body.gameToken, field: req.body.field , turn: req.body.turn, winner: winner}
        db.collection('game_process').update(details, note, (err, result) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                res.send(result);
            }
        });
    });

    app.post('/games/game_proc', (req, res) => {                           
        var details = { 'gameToken': req.body.gameToken}
        db.collection('game_process').findOne(details, (err, item) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {;
                res.send(item); 
            }
        });
    });

    app.post('/games/get_game_status', (req, res) => {         
        var details = { 'gameToken': req.body.gameToken}
        db.collection('games_list').findOne(details, (err, item) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                res.send(item.state); 
            }
        });
    });
    app.post('/games/get_game', (req, res) => {  
         const gameToken = req.body.gameToken;
           const details = { 'gameToken': gameToken };
           db.collection('games_list').findOne(details, (err, item) => {
             if (err) {
               res.send({'error':'An error has occurred'});
             } else {
               res.send(item);
             } 
           });
       
        
    });

    app.post('/games/new', (req, res) => {
        var accessToken =  genToken(12);
        var gameToken =  genToken(6)
        const note = {gameToken: gameToken, owner: req.body.userName, ownerToken: accessToken, opponent: "", opponentToken: "", size: req.body.size, gameResult: "", state: 'ready'};   
        db.collection('games_list').insert(note, (err, result) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                var json = JSON.stringify({
                    accessToken: accessToken,
                    gameToken: gameToken
                });
                res.send(json);
            }
        });
    });

    app.post('/games/join', (req, res) => {   
        var accessToken =  genToken(12);
        var details = { 'gameToken': req.body.gameToken}
        db.collection('games_list').findOne(details, (err, item) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                const note = {gameToken: item.gameToken, owner: item.owner, ownerToken: item.ownerToken, opponent: req.body.userName, opponentToken: accessToken, size: item.size, gameResult: item.gameResult, state: 'playing'};   
                db.collection('games_list').update(details, note, (err, result) => {
                    if (err) {
                        res.send({'error':'An error has occurred'});
                    } else {
                        const proc_note = {gameToken: item.gameToken, field: [0,0,0,0,0,0,0,0,0], turn: "crossSymbol", winner: ""};
                        db.collection('game_process').insert(proc_note, (err, result) => {
                             if (err) { 
                                res.send({ 'error': 'An error has occurred' }); 
                            } else {
                                res.send(accessToken);
                            }
                        });
                    } 
                });
            }
        });
    });

    app.post('/games/game_over', (req, res) => {     
        var details = { 'gameToken': req.body.gameToken}
        db.collection('games_list').findOne(details, (err, item) => {
             if (err) { 
                res.send({ 'error': 'An error has occurred' }); 
            } else {
                const note = {gameToken: item.gameToken, owner: item.owner, ownerToken: item.ownerToken, opponent: item.opponent, opponentToken: item.opponentToken, size: item.size, gameResult: req.body.winner, state: 'done'};   
                db.collection('games_list').update(details, note, (err, result) => {
                    if (err) {
                        res.send({'error':'An error has occurred'});
                    } else {
                        res.send(result);
                    } 
                });
            }
        });
    });
 };  
