class Controller
{
    constructor(playerName){
    this._playerName = playerName;
    this._accessToken = "";
    this._gameToken = "";
    this._requestsController = new RequestsController();
    this._gamesListPage = new GamesListPage(this._requestsController); 
    this.initNewGameButton();
    this.initUserName();
    document.addEventListener(OPEN_GAME_EVENT, (function (event) {
        this.openGamePage(event.detail);
      }).bind(this), false); 
    this._timerId = setInterval((function() {
        this.update();
      }).bind(this), 2000);
    }

    createNewGame (){
        if (this.checkMustUserCreateNewGame()){
            var data = JSON.stringify({
                userName: this._playerName,    
                size: 3
            });
            var response = this._requestsController.PostRequest('/games/new', data);
            var responseData = JSON.parse(response);
            this._accessToken = responseData.accessToken;
            this._gameToken = responseData.gameToken;
        }
        else {
            alert("Необходимо завершить созданную ранее игру");
        }
    }   

    openGamePage(detail){
        var gameState = this.getGameState(detail.gameToken);
        switch(gameState)
        {
            case GAME_STATE_READY:
            { 
                if (detail.gameToken !=  this._gameToken)
                {
                    var data = JSON.stringify({
                        gameToken: detail.gameToken,    
                        userName: this._playerName
                    });
                    var response = this._requestsController.PostRequest('/games/join', data);
                    window.open('/games/' + detail.gameToken + '/' + response);
                }
                break;
            }
            case GAME_STATE_PLAYING:
            {
                if (detail.gameToken ==  this._gameToken)
                {
                    window.open('/games/' + this._gameToken + '/' + this._accessToken);
                }
                else
                {
                    window.open('/games/' + detail.gameToken);
                }
                break;
            }
            case GAME_STATE_DONE:
            {
                window.open('/games/' + detail.gameToken);
            }
        }        
    }
    

    update(){
        this._gamesListPage.update();
    }

    initNewGameButton()
    {
        this._newGameButton = document.getElementById('newGameButton');
        this._newGameButton.addEventListener("click", this.createNewGame.bind(this));
    }

    initUserName()
    {
        document.getElementById("playerName").value = this._playerName;
    }


    getGameState(gameToken){
        var data = JSON.stringify({
            gameToken: gameToken,    
        });
        var response = this._requestsController.PostRequest('/games/get_game_status', data);
        return response;
           
    }

    checkMustUserCreateNewGame()
    {
        if (this._accessToken != "" && this._gameToken != "")
        {
            var state = this.getGameState(this._gameToken);
            if (state == GAME_STATE_READY || state == GAME_STATE_PLAYING)
            {
                return false;
            }
        }
        return true;
    }

}