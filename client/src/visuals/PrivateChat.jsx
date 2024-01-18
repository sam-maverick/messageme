//import { StatusBar } from 'expo-status-bar';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import { StyleSheet, Button, Text, TextInput, View, TouchableOpacity, SafeAreaView } from 'react-native';

import uuid from 'react-native-uuid';

import { GiftedChat, GiftedChatState, Bubble, Send } from 'react-native-gifted-chat';
import * as ImagePicker from 'expo-image-picker';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Icon } from 'react-native-elements';

import * as FileSystem from 'expo-file-system';

//import Storage from 'react-native-storage';
//import AsyncStorage from '@react-native-async-storage/async-storage';



import { styles } from './myVisualsLibrary.jsx';
import { ErrorAlert, LogMe, InfoMessage, IsValidImageExtensionAndContentType } from '../myGeneralLibrary.jsx';
import { TabsComponent } from './Tabs.jsx';

import storage from '../storage/storageApi.js';

import { ApiSendMessage, ApiReceiveMessage } from '../network/networkApi.js';
import { MyWebsocketConnect, MyWebsocketDisconnect, WsApiEmitSomething, WsApiHandleReception } from '../network/websocketApi.js';

import { PARAM_IMAGES_DIRNAME } from '../parameters.js';
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
import { PARAM_IMAGE_PICKER_QUALITY } from '../parameters.js';




/**
 * 
 * IMPORTANT NOTE ABOUT HOW TO UPDATE MESSAGES IN GiftedChat .-
 * 
 * We associate messagesGC's state to the current layout of GiftedChat. However,
 * the only two safe ways of using messagesGC (either for reading or for writing) are:
 * 
 * 1. Adding messages to the UI:
 * setMessagesGC(previousMessages =>
 *     GiftedChat.append(previousMessages, newMessageLocalReference),
 * );
 * 
 * 2. Initialisation:
 * setMessagesGC(something);  //  ONLY WHEN THE COMPONENT IS INITIALIZED!!!
 * 
 * 
 * Do not read messagesGC or write setMessagesGC() otherwise, as it gives outated data (it lacks the last message).
 * Probably due to async issues in the way that GiftedChat uses messagesGC.
 * 
 */

const K_FROM_SCRATCH = 0;
const K_ONLY_SERVER_QUEUE = 1;


export const PrivateChatComponent = props => {

    const [messagesGC, setMessagesGC] = useState([]);  // Used by GiftedChat
    const [initStatus, setInitStatus] = useState({ key: 'init' });
    const [WsConnectionStatusIcon, setWsConnectionStatusIcon] = useState( 
        <TouchableOpacity onPress={() => InfoMessage('Connection status','Trying to connect to the server...')}>
            <Icon
                size={24}
                type="font-awesome"
                name="hourglass"
                color="black"
            />
        </TouchableOpacity>
    );
    const [MessageProcessingStatusIcon, setMessageProcessingStatusIcon] = useState(messageProcessingIconIdle);




    const messageProcessingIconIdle=
                    <Icon
                        size={24}
                        type="font-awesome"
                        name="hourglass"
                        color="#aaa"
                    />;

    const messageProcessingIconBusy=
                    <Icon
                        size={24}
                        type="font-awesome"
                        name="hourglass"
                        color="black"
                    />;

   
    function setCurrentScreenInMainComponent(newState) {
        props.setCurrentScreenInCurrentComponent(newState);
    }


    async function ComponentRefresh() {  // Invoked every time this screen is loaded
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('Refreshing PrivateChat Component');  }
        if (initStatus.key === 'init') {
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('Initialising PrivateChat Component');  }
            initStatus.key = 'updated'; //update without rendering
            //initStatus({ key:'updated'}); //update with rendering
            // This will reach only on the first time the scren is loaded
        }
    }
    

    /* Note: We could have put the code below in a ComponentRefresh() function and call it from PrivateChatComponent, as we have done in other Components,
       but the advantage of useEffect is that we can provide a cleanup function (MyWebsocketDisconnect, in our case)
    */
    useEffect( () => {  // This is executed when the app is launched
        async function didMount() { // Do not change the name of this function
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('useEffect of PrivateChat invocation');  }           

            await UpdateListOfMessages(K_FROM_SCRATCH);
            
            await MyWebsocketConnect(props.AccountData.cookie, WebsocketOnOpenEventPC, WebsocketOnCloseEventPC);

            await WsApiHandleReception('pong', WsPongHandler);
            await WsApiHandleReception('error', WsErrorHandler);
            await WsApiHandleReception('serverNotificationNewMessage', WsNewMessageNotificationHandler);

            WsApiEmitSomething('ping', 'Data sent from client to server');  // Not necessary to await here

        }
        didMount();  // If we want useEffect to be asynchronous, we have to define didMount as async and call it right after
        return async function didUnmount() { // Do not change the name of this function
          // Cleanup tasks
          if (PARAM_LOGGING_LEVEL>=1) { LogMe('useEffect of PrivateChat cleanup');  }
          await MyWebsocketDisconnect();
        };
    }, [props]);  // Put [] if the useEffect code does not need to access props or parameters, or set to [props.state1] or to [props] otherwise



    const WsPongHandler = async (someserverdata) => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: WsPongHandler()');  } 
        if (PARAM_LOGGING_LEVEL>=2) { LogMe('   with data: #' + JSON.stringify(someserverdata) + '#');  } 
    }

    const WsErrorHandler = async (someserverdata) => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: WsErrorHandler()');  } 
        if (PARAM_LOGGING_LEVEL>=2) { LogMe('   with data: #' + JSON.stringify(someserverdata) + '#');  } 
        ErrorAlert(someserverdata);
    }

    const WsNewMessageNotificationHandler = async (someserverdata) => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: WsNewMessageNotificationHandler()');  } 
        if (PARAM_LOGGING_LEVEL>=2) { LogMe('   with data: #' + JSON.stringify(someserverdata) + '#');  } 
        
        // If the user sending the notification coincides with our open PrivateChat, refresh it with new messages from server
        if(props.remoteUsername == someserverdata.fromUser) {
            setMessageProcessingStatusIcon(messageProcessingIconBusy);
            await UpdateListOfMessages(K_ONLY_SERVER_QUEUE);
            setMessageProcessingStatusIcon(messageProcessingIconIdle);
        }
        
    }

    
    const WebsocketOnOpenEventPC = () => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: WebsocketOnOpenEventPC');  }
        setWsConnectionStatusIcon(
            <TouchableOpacity onPress={() => InfoMessage('Connection status','Connected to the server. The chat will be updated automatically with new messages.')}>
                <Icon
                    size={24}
                    type="font-awesome"
                    name="link"
                    color="green"
                />
            </TouchableOpacity>        
        );    
    }

    const WebsocketOnCloseEventPC = () => {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('WS: WebsocketOnCloseEventPC');  }
        setWsConnectionStatusIcon(
            <TouchableOpacity onPress={() => InfoMessage('Connection status','Connected to the server. The chat will be updated automatically with new messages.')}>
                <Icon
                    size={24}
                    type="font-awesome"
                    name="unlink"
                    color="red"
                />
            </TouchableOpacity>        
        );    
    }




    async function UpdateListOfMessages(mode) {
    // mode:
    //    K_FROM_SCRATCH        --> Updates both the local history and the enqueued server messages. To be called only once when loading the component
    //    K_ONLY_SERVER_QUEUE   --> Only updates with the enqueued server messages appending any new messages onto the current component

        if (PARAM_LOGGING_LEVEL>=1) { LogMe('UpdateListOfMessages()'); }       
        if (PARAM_LOGGING_LEVEL>=2) { LogMe('messagesGC is:');}
        if (PARAM_LOGGING_LEVEL>=2) { LogMe('#'+JSON.stringify(messagesGC)+'#');}

        let localSavedMessages = [];

        let serverMessagesBuffer = [];

        let totalBuffer = [];

        // Retrieve local saved message history
        localSavedMessages = await GetLocalSavedHistory();
        if (localSavedMessages === false) {
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('The local history is empty'); }                      
        } else {
            if (PARAM_LOGGING_LEVEL>=2) { LogMe('Loaded local history is:'); LogMe('#'+JSON.stringify(localSavedMessages)+'#');  }           
            totalBuffer = localSavedMessages;
        }


        // Retrieve messages queued in the server
        let areThereNewMessagesOnServer = true;
        while (areThereNewMessagesOnServer!==false) {
            areThereNewMessagesOnServer = await FetchNewMessageFromServer();
            if (areThereNewMessagesOnServer!==false) {
                serverMessagesBuffer = GiftedChat.append(serverMessagesBuffer, areThereNewMessagesOnServer);
                totalBuffer = GiftedChat.append(totalBuffer, areThereNewMessagesOnServer);
            }
        }
        if (areThereNewMessagesOnServer === true) {
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('No new messages on the server'); }  
        } else {
            if (PARAM_LOGGING_LEVEL>=2) { LogMe('Downloaded server messages:'); LogMe('#'+JSON.stringify(serverMessagesBuffer)+'#');  }           
        }
        

        // Save the updated list of messages (which includes the messages from the server) to local storage
        try {
            await storage.save({
                key: 'messageData' + props.remoteUsername, // Note: Do not use underscore("_") in key!
                data: {
                    'messageHistory': totalBuffer,
                },
            })                                    
        } catch(error) { 
            ErrorAlert(error.message, error);  // Storage error
        } 
            
        // Finally, update the UI at once
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('Updating the UI with our messagesGC'); }                       
        if ([K_FROM_SCRATCH].indexOf(mode) > -1) {
            setMessagesGC(totalBuffer);  // We can only do this at the startup!!!
        } else if ([K_ONLY_SERVER_QUEUE].indexOf(mode) > -1) {
            setMessagesGC(previousMessages =>
                GiftedChat.append(previousMessages, serverMessagesBuffer),
            )
        }


    }

    async function GetLocalSavedHistory() {
        try {
            let retHistory = await storage.load({
                syncInBackground: false,        
                key: 'messageData' + props.remoteUsername,
            });

            return retHistory.messageHistory;

        } catch(error) {
            // any exception including data not found goes to catch()
            switch (error.name) {
              case 'NotFoundError':
                //No previous history, ok
                break;
              case 'ExpiredError':
                //No previous history, ok
                break;
              default:
                ErrorAlert(error.message, error);  // Storage error
            }
        }
        return false;
    }


    async function FetchNewMessageFromServer() {
    // Returns a new message if new message is received from the server queue, otherwise it returns false
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('FetchNewMessageFromServer()'); };

        try {
            let resReceiveMessage = await ApiReceiveMessage(props.AccountData.cookie);
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('FetchNewMessageFromServer(): ApiReceiveMessage finished');  };

            if (!resReceiveMessage.isSuccessful) {
                ErrorAlert(resReceiveMessage.resultMessage);  // Server-side error
                setCurrentScreenInMainComponent('Init');                                    
                return false;
            } else {
                if (!resReceiveMessage.wasNewMessageFound) {
                    return false;
                } else {
                    // new message exists

                    // If it is an image, it needs preprocessing: convert from expanded-contents to local-reference
                    // Otherwise, the 'image' field of the JSON message object is very large and we get a SQLite error of 'disk full' when saving to storage key-pairs
                    if (resReceiveMessage.messageContainer.message[0].image) {
                        // Expected format: "image": "data:image/jpeg;base64,/9j/4TLERXhpZgAATU0AKgAAAAgACwEQAAIAAAAO...EQGSSpA64HQNk/dpxjztBeLT7H//2Q=="
                        // This is the actual data        -->                ***************************************************************************
                        
                        const imageRegex = /^data:image\/([0-9a-zA-Z]+);base64,(.+)$/;

                        let extractedData = imageRegex.exec(resReceiveMessage.messageContainer.message[0].image);
                        if (PARAM_LOGGING_LEVEL>=1) { LogMe('FetchNewMessageFromServer(): regex data extraction finished');  };
                        // Returns an array where the [0] is the initial string and the subsequent []'s are the classes enclosed within (), or else null if the match fails. In our case [1] is the extension and [2] is the image contents
                        if (extractedData == null) {
                            ErrorAlert('Incorrect image format received.');
                            return false;
                        } else {
                        
                            if (!IsValidImageExtensionAndContentType (extractedData[1])) {
                                ErrorAlert('Image content-type is not valid.');                                               
                                return false;                            
                            } else {
                                let imagefilename = uuid.v4() + '.' + extractedData[1];
                                let fullpathimagefilename = FileSystem.documentDirectory + PARAM_IMAGES_DIRNAME + '/' + imagefilename;
                                if (PARAM_LOGGING_LEVEL>=1) { LogMe('   Expanded content size is: ' + extractedData[2].length + ' bytes'); }

                                try {
                                    // Save image to our file workspace
                                    let resFileWrite = await FileSystem.writeAsStringAsync(fullpathimagefilename, extractedData[2], {encoding: 'base64'});
                                    if (PARAM_LOGGING_LEVEL>=1) {
                                        let fileproperties = await FileSystem.getInfoAsync(fullpathimagefilename, {size: true});
                                        LogMe('Downloaded file saved: ' + fullpathimagefilename); 
                                        LogMe('   ' + fileproperties.size + ' bytes');
                                        LogMe('   ' + 'with extension: ' + extractedData[1]);
                                    }   
             
            
                                    if (PARAM_LOGGING_LEVEL>=1) { LogMe('FetchNewMessageFromServer(): file writing finished');  };

                                    resReceiveMessage.messageContainer.message[0].image = fullpathimagefilename;
                                    
                                    if (PARAM_LOGGING_LEVEL>=2) { LogMe('Completed reception of message: #' + JSON.stringify(resReceiveMessage.messageContainer.message[0])+'#');  };

                                } catch(error) { 
                                    ErrorAlert(error.message, error);  // File write error
                                    return false;
                                }          
                            
                            }
                        }
                    } 

                    // Revert id, so that the received message is displayed as received in GiftedChat (left side of the chat history)
                    resReceiveMessage.messageContainer.message[0].user._id = 2;
                    
                    // Deliver it
                    return resReceiveMessage.messageContainer.message;
                }
            }
                
        } catch(error) {
            ErrorAlert(error.message, error);  // Network error
            return false;
        }             
    }

    
    const renderSend = (props) => {
        return (
            <View style={styles.leftcenter}>

              <Text>   </Text>

              <TouchableOpacity onPress={sendRegularImage}>
                <View style={styles.leftleft}>
                    <Icon
                      type="font-awesome"
                      name="file-picture-o"
                      size={25}
                      color='green'
                    />
                </View>
              </TouchableOpacity>

              <Text>   </Text>

              <Send {...props} containerStyle={styles.leftcenter}>{/* Because of the {...props}, it inherits the onSend property  */}
                  <Icon
                    type="font-awesome"
                    name="send"
                    size={25}
                    color='brown'
                  />
              </Send>

             <Text>    </Text>

            </View>            
        );
    };

    async function pickImage() {
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('pickImage() called'); }                       
        const statusPhotoGallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const statusCamera = await ImagePicker.requestCameraPermissionsAsync();

        let imgURI = null;
        const hasPermissionGranted = (statusPhotoGallery.granted & statusCamera.granted);
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('statusPhotoGallery is: ' + statusPhotoGallery.granted); }                       
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('statusCamera is: ' + statusCamera.granted); }                       

        if(!hasPermissionGranted) {
            ErrorAlert('Permissions not granted');
            return null;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: PARAM_IMAGE_PICKER_QUALITY,
        });

        if (!result.canceled) {
            if (PARAM_LOGGING_LEVEL>=1) { LogMe('pickImage() cancelled'); }                       
            imgURI = result.assets;
        }

        return imgURI;
    };


    async function sendRegularImage() { // Send image function
    // ToDo: Be able to send a picture with a text, all within one message object.
    // Messages are an array of objects (which can contain a group of pictures, a picture with a comment, etc.)
    // but we currently only support messages with single items (1 pic, or 1 text)
        if (PARAM_LOGGING_LEVEL>=1) { LogMe('sendRegularImage() called'); }                       

        setMessageProcessingStatusIcon(messageProcessingIconBusy);

        try {
            let resAssets = await pickImage();  // We get a pointer to the image in the system gallery
            if (resAssets!=null) { 
            
                // If the user selected more than one picture, we pick only one
                // ToDo: handle multiple picture selection
                try {
                    let resFileRead = await FileSystem.readAsStringAsync(resAssets[0].uri, {encoding: 'base64'}); // Read image contents
                    if (PARAM_LOGGING_LEVEL>=1) {
                        let fileproperties = await FileSystem.getInfoAsync(resAssets[0].uri, {size: true});
                        LogMe('Asset file: ' + resAssets[0].uri); 
                        LogMe('   ' + fileproperties.size + ' bytes');
                    }   

                    // We assume that the extension coincides with the ISO content-type
                    let fileExt = resAssets[0].uri.split('.').pop();
                    if (!IsValidImageExtensionAndContentType(fileExt)) {
                        throw Error('Image URI extension is not valid.');                   
                    }

                    let imagefilename = uuid.v4() + '.' + fileExt;
                    let fullpathimagefilename = FileSystem.documentDirectory + PARAM_IMAGES_DIRNAME + '/' + imagefilename;
                    if (PARAM_LOGGING_LEVEL>=1) { LogMe('   Expanded content size is: ' + resFileRead.length + ' bytes'); }

                    try {
                        // Save image to our file workspace
                        let resFileWrite = await FileSystem.writeAsStringAsync(fullpathimagefilename, resFileRead, {encoding: 'base64'});
                        if (PARAM_LOGGING_LEVEL>=1) {
                            let fileproperties = await FileSystem.getInfoAsync(fullpathimagefilename, {size: true});
                            LogMe('Local file saved to workspace: ' + fullpathimagefilename); 
                            LogMe('   ' + fileproperties.size + ' bytes');
                            LogMe('   ' + 'with extension: ' + fileExt);
                        }   

                        let creationdate = new Date();

                    if (PARAM_LOGGING_LEVEL>=1) { LogMe('calling sendMessage() for the selected image'); }                       
        
                        sendMessage(
                            [{
                                _id: uuid.v4(),
                                createdAt: creationdate,
                                user: {
                                  _id: 1,  // 1=me,  2=the remote party
                                },
                                image: fullpathimagefilename,
                            }],
                            [{
                                _id: uuid.v4(),
                                createdAt: creationdate,
                                user: {
                                  _id: 1,  // 1=me,  2=the remote party
                                },
                                image: 'data:image/' + fileExt + ';base64,' + resFileRead,
                            }],
                        );

                    } catch(error) { 
                        ErrorAlert(error.message, error);  // File write error
                    }          
                
                } catch(error) { 
                    ErrorAlert(error.message, error);  // File read error
                }          
                                                              
            } else {
                // User canceled; nothing to be done
            }
        } catch(error) {
            ErrorAlert(error.message, error);  // Error picking an image
        }
        setMessageProcessingStatusIcon(messageProcessingIconIdle);        
    }




    async function sendMessage (newMessageLocalReference, newMessageContentsExpanded) { // Entry point for tasks involved in sending a message
    // newMessageLocalReference and newMessageContentsExpanded must be something like [{contents}]
    // In case of image, newMessageLocalReference has a pointer to a local file, and newMessageContentsExpanded has the embedded file in base64
    // In case of text newMessageLocalReference must be the same as newMessageContentsExpanded
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('sendMessage() called (text/image)'); }                       
        
        //send message to server
        try {
            let resSendMessage = await ApiSendMessage(props.AccountData.cookie, props.remoteUsername, newMessageContentsExpanded);

            if (!resSendMessage.isSuccessful) {
                ErrorAlert(resSendMessage.resultMessage);  // Server-side error
                setCurrentScreenInMainComponent('Init');                                    
            } else {

                // Use GiftedChat interface to update its internal list of messages
                let newlistofmessages = [];
                let currentlySavedMessages = await GetLocalSavedHistory();
                if (currentlySavedMessages===false) {
                    // There are no saved messages
                    newlistofmessages = newMessageLocalReference;
                } else {
                    newlistofmessages = GiftedChat.append(currentlySavedMessages, newMessageLocalReference);
                }
            
                
                // Save message to local storage
                try {
                    await storage.save({
                        key: 'messageData' + props.remoteUsername, // Note: Do not use underscore("_") in key!
                        data: {
                            'messageHistory': newlistofmessages,
                        },
                    })
                    
                    if (PARAM_LOGGING_LEVEL>=2) { LogMe('Completing sendMessage() for this message [local ref]:'); LogMe('#'+JSON.stringify(newMessageLocalReference)+'#'); }

                    /*
                    Caveat: Do not rely on reading messagesGC after this call. It does not get immediately updated with the last appended message!
                    */
                    // Append the message to GiftedChat.
                    // NOTE: The GiftedChat.append function does not do any UI. The magic is done by updating the state variable messagesGC
                    setMessagesGC(previousMessages =>
                        GiftedChat.append(previousMessages, newMessageLocalReference),
                    )
                    
                    // Immediately notify recipient via websocket so as to make it refresh
                    WsApiEmitSomething('clientNotificationNewMessage', {emitterCookie: props.AccountData.cookie, receiverUsername: props.remoteUsername});  // No await here
                    
                } catch(error) { 
                    ErrorAlert(error.message, error);  // Storage error
                }    

            }         
        } catch(error) {
            ErrorAlert(error.message);  // Network error
        }          
    }



    const sendTextMessageCB = useCallback((newMessage = []) => {  // For text only, call-back function for the Send button
        /*
            setMessages(previousMessages =>
                GiftedChat.append(previousMessages, messages),
            )
        */
        sendMessage(newMessage, newMessage)    
    }, [])
      


    // Initialisation
    ComponentRefresh();


    return (
        <View style={styles.centercenterflex1}>
        
            <View style={styles.headertitlewithback}>

                <View style={styles.headertitleleftcenter}>
                    <Text style={styles.large}>  </Text>
                    <TouchableOpacity onPress={() => setCurrentScreenInMainComponent('Chats')}>
                        <Icon
                          size={35}
                          type="font-awesome"
                          name="arrow-left"
                        />
                    </TouchableOpacity>                        
                 
                </View>
                
                <View style={styles.headertitlecentercenterflex1}>
                  <Text style={styles.large}>💬 {props.remoteUsername}</Text>
                
                </View>

                <View style={styles.headertitleleftcenter}>    
                    {MessageProcessingStatusIcon}
                    <Text style={styles.large}>  </Text>
                    {WsConnectionStatusIcon}
                    <Text style={styles.large}>  </Text>
                 
                </View>
                
            </View>          
            
            <View style={styles.container1}>
                <GiftedChat
                  messages={messagesGC}
                  alwaysShowSend
                  onSend={newMessage => sendTextMessageCB(newMessage)}
                  user={{
                    _id: 1,
                  }}
                  renderSend={renderSend}
                  scrollToBottom
                  scrollToBottomComponent={ ()=> { return (<FontAwesome name="angle-double-down" size={22} color="#333"/>); } }         
                />
            </View>      
        </View>
    )
}

