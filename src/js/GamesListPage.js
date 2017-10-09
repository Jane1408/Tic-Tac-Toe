class GamesListPage
{
    constructor(requestsController){
        this._requestsController = requestsController;
        this._gamesList = [];
        this._gameItemsList = [];
        this.getData();
    }
    
    getData () 
    {
        var response = this._requestsController.GetRequest('/games/list');
        var data = JSON.parse(response);
        for (var i = 0; i < data.games.length; i++)
            {
                this._gamesList.push(data.games[i]);
                this.show(this._gamesList[i]);
            }
    }

    show (data) 
    {
        var item = new GameItem(data);
        this._gameItemsList.push(item);
    }

    update()
    {
        this.clearData();
        this.getData();
    }

    clearData()
    {
        this._gamesList.splice(0, this._gamesList.length);
        for (var i = 0; i < this._gameItemsList.length; i++)
            {
                this._gameItemsList[i].remove();
            }
        this._gameItemsList.splice(0, this._gameItemsList.length);
    }
}


