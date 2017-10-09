class GameItem
{
    constructor(data){
        this._gameToken = data.gameToken;
        this._owner = data.owner;
        this._opponent = (data.opponent != null) ? data.opponent : ""; 
        this._size = data.size; 
        this._gameResult = data.gameResult;
        this._state = data.state;

        this.show();
    }
    

    show () 
    {
        var gamesList = document.getElementById("gamesList");
        this._item = document.createElement('div');
        this._item.className = "gameItem_" + this._state;
        var opponentName = (this._opponent != "") ? this._opponent : "_______________"
        this._item.innerHTML = "<p> " + this._owner +  "</p>" + "<p> " + opponentName + "</p>";
        this._item.addEventListener("click", this.joinGame.bind(this))
        gamesList.appendChild(this._item);
    }

    joinGame()
    {
        var event = new CustomEvent(OPEN_GAME_EVENT, {
            "detail": {
                "gameToken": this._gameToken
            }
        });
        document.dispatchEvent(event);
    }

    remove()
    {
        var gamesList = document.getElementById("gamesList");
        gamesList.removeChild(this._item);
    }

}