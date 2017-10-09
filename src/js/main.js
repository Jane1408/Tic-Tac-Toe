function StartApp() 
{
    var userName = null;
    while (userName == null)
    {
        userName = prompt("Enter your name", "name");
    }
    var controller = new Controller(userName);
}

function InitGame(){
    var gameController = new GameController();
}
