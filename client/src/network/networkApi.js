import { PARAM_SERVER_API_URL } from '../parameters.js';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
>>>>>>> f2d05ec (Initial commit)
import { ErrorAlert, LogMe } from '../myGeneralLibrary.jsx';


const POST_HEADERS = {
    method: 'POST',
    headers: {
        'Content-type': 'application/json',
    },
};



export async function ApiReceiveMessage(cookie) {
<<<<<<< HEAD
    LogMe(1, 'ApiReceiveMessage()');;
=======
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('ApiReceiveMessage()'); };
>>>>>>> f2d05ec (Initial commit)
    return fetch(`${PARAM_SERVER_API_URL}/messages/receiveMessage`, {
        ...POST_HEADERS,
        body: JSON.stringify({cookie}),
    })
    .then((res) => res.json())
    .then((res) => res)
}



export async function ApiSendMessage(cookie, recipient, message) {
// message is of the form [{}] although we will only handle simple messages with one object
// contents only applies to pictures; it is the base64 content of the file image

    return fetch(`${PARAM_SERVER_API_URL}/messages/sendMessage`, {
        ...POST_HEADERS,
        body: JSON.stringify({cookie, recipient, message}),
    })
    .then((res) => res.json())
    .then((res) => res)
}


export async function ApiResetFactoryDB() {

<<<<<<< HEAD
    LogMe(1, 'API: ApiResetDB');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('API: ApiResetDB');  }
>>>>>>> f2d05ec (Initial commit)

    return fetch(`${PARAM_SERVER_API_URL}/administration/resetFactoryDB`, {
        ...POST_HEADERS,
    })
    .then((res) => res.json())
    .then((res) => res)
}


export async function ApiCreateAccount(username) {

<<<<<<< HEAD
    LogMe(1, 'API: ApiCreateAccount');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('API: ApiCreateAccount');  }
>>>>>>> f2d05ec (Initial commit)

    return fetch(`${PARAM_SERVER_API_URL}/accounts/createAccount`, {
        ...POST_HEADERS,
        body: JSON.stringify({username}),
    })
    .then((res) => res.json())
    .then((res) => res)
}

export async function ApiCheckAccount(cookie) {

<<<<<<< HEAD
    LogMe(1, 'API: ApiCheckAccount');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('API: ApiCheckAccount');  }
>>>>>>> f2d05ec (Initial commit)

    return fetch(`${PARAM_SERVER_API_URL}/accounts/checkAccount`, {
        ...POST_HEADERS,
        body: JSON.stringify({cookie}),
    })
    .then((res) => res.json())
    .then((res) => res)
}


export async function ApiGetAccountsList(cookie) {

<<<<<<< HEAD
    LogMe(1, 'API: ApiGetAccountsList');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('API: ApiGetAccountsList');  }
>>>>>>> f2d05ec (Initial commit)

    return fetch(`${PARAM_SERVER_API_URL}/accounts/getAccountsList`, {
        ...POST_HEADERS,
        body: JSON.stringify({cookie}),
    })
    .then((res) => res.json())
    .then((res) => res)
}



export async function ApiTestNetworkConnection() {

<<<<<<< HEAD
    LogMe(1, 'API: ApiTestNetworkConnection');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('API: ApiTestNetworkConnection');  }
>>>>>>> f2d05ec (Initial commit)

    return fetch(`${PARAM_SERVER_API_URL}/test/doNothing`, {
        ...POST_HEADERS,
        body: JSON.stringify({}),
    })
    .then((res) => res.json())
    .then((res) => res)
}
