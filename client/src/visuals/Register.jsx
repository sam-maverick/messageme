//import { StatusBar } from 'expo-status-bar';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import { StyleSheet, Button, Text, TextInput, View, Alert } from 'react-native';

//import Storage from 'react-native-storage';
//import AsyncStorage from '@react-native-async-storage/async-storage';


import { styles } from './myVisualsLibrary.jsx';
import { ErrorAlert, LogMe, UpdateLogMeUsername } from '../myGeneralLibrary.jsx';
import { TabsComponent } from './Tabs.jsx';

import { ApiCreateAccount } from '../network/networkApi.js';

import storage from '../storage/storageApi.js';
<<<<<<< HEAD
import { PARAM_SERVER_API_URL } from '../parameters.js';
=======
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
>>>>>>> f2d05ec (Initial commit)




export const RegisterComponent = props => {

    const [newAccount, setNewAccount] = useState('');
    const [initStatus, setInitStatus] = useState({ key: 'init' });

    useEffect( () => {  // This is executed when the app is launched
        async function didMount() { // Do not change the name of this function
            // Do stuff
<<<<<<< HEAD
            LogMe(1, 'useEffect of Register invocation');           
=======
            if (PARAM_LOGGING_LEVEL>=1) {  LogMe('useEffect of Register invocation');  }           
>>>>>>> f2d05ec (Initial commit)
        }
        didMount();  // If we want useEffect to be asynchronous, we have to define didMount as async and call it right after
        return async function didUnmount() { // Do not change the name of this function
          // Cleanup tasks
<<<<<<< HEAD
          LogMe(1, 'useEffect of Register cleanup');
=======
          if (PARAM_LOGGING_LEVEL>=1) {  LogMe('useEffect of Register cleanup');  }
>>>>>>> f2d05ec (Initial commit)
        };
    }, []);  // App.js does not have props


    async function ComponentRefresh() {  // Invoked every time this screen is loaded
<<<<<<< HEAD
        LogMe(1, 'Refreshing Register Component');
        if (initStatus.key === 'init') {
            LogMe(1, 'Initialising Register Component');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Refreshing Register Component');  }
        if (initStatus.key === 'init') {
            if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Initialising Register Component');  }
>>>>>>> f2d05ec (Initial commit)
            initStatus.key = 'updated'; //update without rendering
            //initStatus({ key:'updated'}); //update with rendering
            // This will reach only on the first time the scren is loaded
        }
    }


    function setCurrentScreenInMainComponent(newState) {
        props.setCurrentScreenInCurrentComponent(newState);
    }
    function setAccountDataInMainComponent(newData) {
        props.setAccountDataInCurrentComponent(newData);
    }
    
    async function CreateAccount(username) {
        try {
            let resApi = await ApiCreateAccount(username);
            if (!resApi.isSuccessful) {
                ErrorAlert(resApi.resultMessage);  // Server-side error
            } else {
                try {
<<<<<<< HEAD
                    await storage.save({
=======
                    storage.save({
>>>>>>> f2d05ec (Initial commit)
                        key: 'accountData', // Note: Do not use underscore("_") in key!
                        data: {
                            'username': username,
                            'cookie': resApi.user.cookie,
                        },
                    });
                } catch(error) { 
                    ErrorAlert(error.message, error);  // Storage error
                }           
                setAccountDataInMainComponent({'username': username, 'cookie' : resApi.user.cookie});
                UpdateLogMeUsername(username);
                setCurrentScreenInMainComponent('Chats');
            }
        } catch(error) {
            //console.error(error);
<<<<<<< HEAD
            ErrorAlert(error.message + '(' + PARAM_SERVER_API_URL + ')', error);  // Network error
=======
            ErrorAlert(error.message, error);  // Network error
>>>>>>> f2d05ec (Initial commit)
        }
    }    


    ComponentRefresh();


    return (
        <View style={styles.centercenterflex1}>
            <View style={styles.headertitle}>
                <Text style={styles.large}>Registration</Text>
            </View>
            <View style={styles.centercenterflex1}>
                <Text style={styles.medium}> </Text>
                <Text style={styles.medium}>Choose a username:</Text>
                <TextInput
                    style={styles.textfield}
                    onChangeText={newText => setNewAccount(newText)}
                    defaultValue={newAccount}
                />
                <Text style={styles.medium}> </Text>
                <Text style={styles.medium}> </Text>
                <Button title='Submit' onPress={() => CreateAccount(newAccount)} />
            </View>
        </View>
    );
};



