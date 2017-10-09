class RequestsController{
    constructor(){}

    PostRequest (url, data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader('Content-Type', 'application/json', 'charset=utf-8');
    xhr.send(data);
    return xhr.responseText;
    }

    GetRequest (url){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.setRequestHeader('Content-Type', 'application/json', 'charset=utf-8');
    xhr.send();
    return xhr.responseText;
    }
}