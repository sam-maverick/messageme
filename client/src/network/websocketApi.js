import io from 'socket.io-client';

import { PARAM_SERVER_WS_URL } from '../parameters.js';
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
import { ErrorAlert, LogMe } from '../myGeneralLibrary.jsx';


let mysocket = null;


export async function WsApiEmitSomething(mycommand, mydata) {
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: send message of ' + mycommand);  }
    if (PARAM_LOGGING_LEVEL>=2) { LogMe('  with data: #' + JSON.stringify(mydata)+'#'); }
    mysocket.emit(mycommand, {myclientdata: mydata});
}



export async function WsApiHandleReception(mycommand, MyDataHandler) {
    mysocket.on(mycommand, (data) => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: handle message of ' + mycommand); }
        MyDataHandler(data.myserverdata);
    });
}


export async function MyWebsocketConnect(mycookie, MyWebsocketOnOpen, MyWebsocketOnClose) {

    if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketConnect');  }

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
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketDisconnect');  }
        mysocket.disconnect();
        mysocket.removeAllListeners();
    } else {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: MyWebsocketDisconnect could not be completed because the socket is null');  }   
    }
}

