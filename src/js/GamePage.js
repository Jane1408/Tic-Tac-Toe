class ViewingGamePage
{
    constructor(data)
    {
        this.initBaseData(data);
        this.initNames();
    }

    initBaseData(data)
    {
        this._gameToken = data.gameToken;
        this._crossPlayer = data.owner;
        this._zeroPlayer = data.opponent;
        this._field = [0,0,0,0,0,0,0,0,0];
        this._itemsArr = [];
    }

    initNames(){
        document.getElementById("crossPlayer").value = this._crossPlayer;
        document.getElementById("zeroPlayer").value = this._zeroPlayer;
    }

    clearItems(){
    for (var i = 0; i < this._itemsArr.length; i++)
        {
            var id = this._itemsArr[i][1];
            var block = document.getElementById(id);
            block.removeChild(this._itemsArr[i][0]);
        }
    this._itemsArr.splice(0, this._itemsArr.length);
    }
    update(data){
        this.clearItems();
        this._field = data.field;
        for (var i = 0; i < this._field.length; i++){
            if (this._field[i] != 0 ){
            var block = document.getElementById(i.toString());
            var item = document.createElement('div');
            item.className = this.getItemClassName(this._field[i]);
            this._itemsArr.push([item, i]);
            block.appendChild(item);
            }
        }
        
    }
    getItemClassName(i)
    {   
        var className = (i == 1) ? "crossSymbol" : "zeroSymbol";
        return className;
    }

    gameOver(winner)
    {
        var winnerName = (winner == "owner") ? this._crossPlayer : this._zeroPlayer;
        alert("Win " + winnerName + "!")
    }
}

class WatchComplenedGamePage extends ViewingGamePage{
    constructor(data)
    {
        super(data);
    }

    update(data)
    {
        super.update(data);
    }
}

class GamePage extends ViewingGamePage{
    constructor(data, accessToken)
    {
        super(data);
        this._accessToken = accessToken;
        this._playerSymbol = (data.ownerToken == this._accessToken) ? "1" : "2";
        this._symbolClass = (this._playerSymbol == 1) ? "crossSymbol" : "zeroSymbol";
        this._opponentSymbol = (this._playerSymbol == 2) ? "crossSymbol" : "zeroSymbol";
        this._isMoving =  false;
        this._isGameOver = (data.state == "done") ? true: false;
        this.initNewGame();
    }

    setAccessToken(accessToken)
    {
        this._accessToken = accessToken;
    }

    makeMove(id) 
    {
        if (this._isMoving && !this._isGameOver)
        {
            if (this._field[id] == 0)
            {
                this._field[id] = this._playerSymbol;
                var block = document.getElementById(id);
                var item = document.createElement('div');
                item.className = this._symbolClass;
                this._itemsArr.push([item, id]);
                block.appendChild(item);
                this.sendMoveEvent();
                this._isMoving = false;
            }
        }
    }

    initNewGame()
    {
        for (var i = 0; i < 9; i++)
        {
            var element = document.getElementById(i.toString());
            if (element != null )
                element.addEventListener("click", this.makeMove.bind(this, element.id));
        }
    }


    sendMoveEvent()
    {
        var event = new CustomEvent('maked move', {
            "detail": {
                "field": this._field,
                "turn" : this._opponentSymbol
            }
        });
    document.dispatchEvent(event);
    }

    setMakeMove(isMoving)
    {
      this._isMoving = isMoving;
    }

    gameOver(winner)
    {
        this._isGameOver = true;
        switch (winner)
        {
            case "owner": var winnerName = this._crossPlayer; break;
            case "opponent": var winnerName = this._zeroPlayer; break;
            default: var winnerName = "draw"; break;
        }
        var turnLine = document.getElementById("turnLine_" + this._symbolClass);
        turnLine.style.display = "none";
        var turnLineOpponent = document.getElementById("turnLine_" + this._opponentSymbol);
        turnLineOpponent.style.display = "none";
        for (var i = 0; i < 9; i++)
        {
            var element = document.getElementById(i.toString());
            if (element != null )
                element.removeEventListener("click", this.makeMove.bind(this, element.id));
        }
        alert("Win " + winnerName + "!")
    }

    update(data)
    {
        super.update(data);
        this._isMoving = (data.turn == this._symbolClass) ? true : false;
        if (this._isMoving)
        {
            var turnLine = document.getElementById("turnLine_" + this._symbolClass);
            turnLine.style.display = "block";
            var turnLineOpponent = document.getElementById("turnLine_" + this._opponentSymbol);
            turnLineOpponent.style.display = "none";
        }
        else {
            var turnLine = document.getElementById("turnLine_" + this._symbolClass);
            turnLine.style.display = "none";
            var turnLineOpponent = document.getElementById("turnLine_" + this._opponentSymbol);
            turnLineOpponent.style.display = "block";
        }
    }

    surrender()
    {
        if (!this._isGameOver){
            var winner = (this._playerSymbol == 1) ? 'opponent' : 'owner';
            this.gameOver(winner);
        }
    }
}
