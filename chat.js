/**
 * Created with JetBrains WebStorm.
 * User: xuwenmin
 * Date: 14-4-19
 * Time: 下午1:20
 * To change this template use File | Settings | File Templates.
 */

var express = require('express'),
    io = require('socket.io');

var app  =express();

app.use(express.static(__dirname));

var server = app.listen(8080, '172.26.74.44');


var ws = io.listen(server);


// 检查昵称
var checkNickname = function(name){
    for(var k in ws.sockets.sockets){
        if(ws.sockets.sockets.hasOwnProperty(k)){
            if(ws.sockets.sockets[k].nickname == name){
                return true;
            }
        }
    }
    return false;
}
//获取昵称数组
var getAllNickname = function(){
    var result = [];
    for(var k in ws.sockets.sockets){
        if(ws.sockets.sockets.hasOwnProperty(k)){
            result.push({
                name: ws.sockets.sockets[k].nickname
            });
        }
    }
    return result;
}
ws.on('connection', function(client){
    client.on('join', function(msg){
        // 检查是否有重复
        if(checkNickname(msg)){
            client.emit('nickname', '昵称有重复!');
        }else{
            client.nickname = msg;
            ws.sockets.emit('howmany',getAllNickname().length);
            ws.sockets.emit('announcement', '系统', msg + ' 加入了聊天室!', {type:'join', name:getAllNickname()});
        }
    });
    client.on('drew',function(data){
        client.broadcast.emit('newImg',data);
    })
    // 监听发送消息
    client.on('send.message', function(msg){
        client.broadcast.emit('send.message',client.nickname,  msg);
    });
    client.on('draw',function(){
        client.broadcast.emit('draw',client.nickname);
    })
    client.on('disconnect', function(){
        if(client.nickname){
            ws.sockets.emit('howmany',getAllNickname().length-1);
            client.broadcast.emit('send.message','系统',  client.nickname + '离开聊天室!', {type:'disconnect', name:client.nickname});
        }
    })

})

