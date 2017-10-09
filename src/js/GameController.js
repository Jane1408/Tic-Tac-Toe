class GameController
{
    constructor(){
    this._requestsController = new RequestsController();
    this._gameToken = this.getGameToken();
    this.initGame();
    }

    addSurrenderButtonListener()
    {
        this._surrenderButton = document.getElementById('surrenderButton');
        this._surrenderButton.addEventListener("click", this.surrender.bind(this));
    }

    addMoveListener()
    {
        document.addEventListener('maked move', (function (event) {
            this.sendUpdate(event.detail);
          }).bind(this), false); 
    }
    
    getGameToken()
    {
        var pathname = window.location.pathname;
        var pathArr = pathname.split('/');
        return pathArr[2];
    }

    getAccessToken()
    {
        var pathname = window.location.pathname;
        var pathArr = pathname.split('/');
        return pathArr[3];
    }

    initGame()
    {
        var data = JSON.stringify({
            gameToken: this._gameToken,    
        });
        var response = this._requestsController.PostRequest('/games/get_game', data);
        var dataPars = JSON.parse(response);
        switch(dataPars.state)
        {
            case GAME_STATE_PLAYING:
            {
                var accessToken = this.getAccessToken();
                if (accessToken == dataPars.ownerToken || accessToken == dataPars.opponentToken)
                {
                    this.addMoveListener();
                    this.addSurrenderButtonListener()
                    this._gamePage = new GamePage(dataPars, accessToken);
                    this.setIntervalForUpdate();
                }
                else
                {
                    this._gamePage = new ViewingGamePage(dataPars);
                    this.setIntervalForUpdate();
                }
                break;
            }
            case GAME_STATE_DONE:
            {
                this._gamePage = new WatchComplenedGamePage(dataPars);
                this.update();
                break;
            }
            
        }
    }

    sendUpdate(detail){
        var data = JSON.stringify({
            gameToken: this._gameToken,    
            field: detail.field,
            turn: detail.turn
        });
        var response = this._requestsController.PostRequest('/games/do_step', data);
    }
    getData(){
        var data = JSON.stringify({
            gameToken: this._gameToken,    
        });
        var response = this._requestsController.PostRequest('/games/get_game', data);
        var dataPars = JSON.parse(response);
        this._gamePage = new GamePage(dataPars, this._accessToken);
    }

    update(){
        var data = JSON.stringify({
            gameToken: this._gameToken,    
        });
        var response = this._requestsController.PostRequest('/games/game_proc', data);
        var dataPars = JSON.parse(response)
        this._gamePage.update(dataPars);
        if (dataPars.winner != "")
            this.gameOver(dataPars.winner);
        
    }

    gameOver(winner)
    {
        clearTimeout(this._timerId);
        this._gamePage.gameOver(winner);
        var data = JSON.stringify({
            gameToken: this._gameToken,
            winner: winner
        });
        var response = this._requestsController.PostRequest('/games/game_over', data);
    }
    
    setIntervalForUpdate()
    {
        this._timerId = setInterval((function() {
            this.update();
          }).bind(this), 1000);
    }

    surrender()
    {
        this._gamePage.surrender();
        clearTimeout(this._timerId);
        this._surrenderButton.removeEventListener("click", this.surrender.bind(this));
    }

}