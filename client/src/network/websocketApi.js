import io from 'socket.io-client';

import { PARAM_SERVER_WS_URL } from '../parameters.js';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
>>>>>>> f2d05ec (Initial commit)
import { ErrorAlert, LogMe } from '../myGeneralLibrary.jsx';


let mysocket = null;


export async function WsApiEmitSomething(mycommand, mydata) {
<<<<<<< HEAD
    LogMe(1, 'WS: send message of ' + mycommand);
    LogMe(2, '  with data: #' + JSON.stringify(mydata)+'#');
=======
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: send message of ' + mycommand);  }
    if (PARAM_LOGGING_LEVEL>=2) { LogMe('  with data: #' + JSON.stringify(mydata)+'#'); }
>>>>>>> f2d05ec (Initial commit)
    mysocket.emit(mycommand, {myclientdata: mydata});
}



export async function WsApiHandleReception(mycommand, MyDataHandler) {
    mysocket.on(mycommand, (data) => {
<<<<<<< HEAD
        LogMe(1, 'WS: handle message of ' + mycommand);
=======
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: handle message of ' + mycommand); }
>>>>>>> f2d05ec (Initial commit)
        MyDataHandler(data.myserverdata);
    });
}


export async function MyWebsocketConnect(mycookie, MyWebsocketOnOpen, MyWebsocketOnClose) {

<<<<<<< HEAD
    LogMe(1, 'WS: MyWebsocketConnect');
=======
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketConnect');  }
>>>>>>> f2d05ec (Initial commit)

    mysocket = io(PARAM_SERVER_WS_URL, {
        transports: ['websocket'],
        auth: {
          mycookie,
        },
    });  

    mysocket.io.on("open", () => MyWebsocketOnOpen());
    mysocket.io.on("close", () => MyWebsocketOnClose());
  
}

export async function MyWebsocketDisconnect() {
    if (mysocket != null) {
<<<<<<< HEAD
        LogMe(1, 'WS: MyWebsocketDisconnect');
        mysocket.disconnect();
        mysocket.removeAllListeners();
    } else {
        LogMe(1, 'WS: MyWebsocketDisconnect could not be completed because the socket is null');   
=======
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketDisconnect');  }
        mysocket.disconnect();
        mysocket.removeAllListeners();
    } else {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketDisconnect could not be completed because the socket is null');  }   
>>>>>>> f2d05ec (Initial commit)
    }
}

