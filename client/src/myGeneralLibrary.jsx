//import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Button, Text, TextInput, View, SafeAreaView, Alert } from 'react-native';

import Storage from 'react-native-storage';
//import AsyncStorage from '@react-native-async-storage/async-storage';

import * as FileSystem from 'expo-file-system';


import { PARAM_IMAGES_DIRNAME, PARAM_LOGGING_LEVEL } from './parameters.js';

import storage from './storage/storageApi.js';



// NOTE: When changes are made to files that do not contain components, these changes are not pulled to running apps in real time. You need tore-launch the app to force a re-download.


let LogMeUsername = false;
<<<<<<< HEAD
const startDate = Date.now();
=======

>>>>>>> f2d05ec (Initial commit)


export function UpdateLogMeUsername (theusername) {
    LogMeUsername = theusername;
}

<<<<<<< HEAD
export function LogSys(libname, level, message) {
    LogMe (level, libname+' '+message);
}

export function LogMe(level, message) {
    if (level <= PARAM_LOGGING_LEVEL) {
        let usernameHeader = '';
        if (! LogMeUsername === false) {
            usernameHeader = '['+LogMeUsername+']: ';
        }
        let HRspan = FromTimeSpanToHumanReadableMs(Date.now() - startDate);
        const difflen = 3 - HRspan.length;
        if (difflen>0) {
          HRspan = ' '.repeat(difflen) + HRspan;
        }
        console.log(HRspan + ' (msmclient) '+usernameHeader + message);
    }
}

export const AsyncAlert = async (message) => new Promise((resolve) => {
    Alert.alert(
      '',
      message,
      [
        {
          text: 'Ok',
          onPress: () => {
            resolve('YES');
          },
        },
      ],
      { cancelable: false },
    );
});

export function ErrorAlert(message, errorObject) {
    LogMe(1, '* * * * * * ERROR * * * * * *  ' + message);
    if (errorObject!=undefined) { LogMe(1, errorObject.stack); }
=======

export function LogMe(message) {
    let usernameHeader = '';
    if (! LogMeUsername === false) {
        usernameHeader = '['+LogMeUsername+']: ';
    }
    console.log(usernameHeader + message);
}


export function ErrorAlert(message, errorObject) {
    if (PARAM_LOGGING_LEVEL>=1) { LogMe('* * * * * * ERROR * * * * * *  ' + message); }
    if (PARAM_LOGGING_LEVEL>=1 & errorObject!=undefined) { console.log(errorObject.stack); }
>>>>>>> f2d05ec (Initial commit)
    Alert.alert(
      'Error',
      message,
      [
        { text: 'Ok' },
      ],
      { cancelable: false }
    );
}

export function InfoMessage(title, message) {
<<<<<<< HEAD
    LogMe(2, 'INFO provided to the user: ' + title + ': ' + message);
=======
    if (PARAM_LOGGING_LEVEL>=2) {  LogMe('INFO provided to the user: ' + title + ': ' + message);  }
>>>>>>> f2d05ec (Initial commit)
    Alert.alert(
      title,
      message,
      [
        { text: 'Ok' },
      ],
      { cancelable: false }
    );
}

export async function InitialisationActions() {
<<<<<<< HEAD
    LogMe(1, 'InitialisationActions()');
=======
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('InitialisationActions()'); }
>>>>>>> f2d05ec (Initial commit)

    LogMeUsername = false;

    // Create images dir, if it does not exist
    try {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + PARAM_IMAGES_DIRNAME);
        return;
    }
    // Ignored -- Directory already exists
    // We can't distinguish between 'directory already exists' and other types of errors
    catch(error) { 
        return;
    }
}

<<<<<<< HEAD
export function FromTimeSpanToHumanReadableMs(lapseMs) {
    const unitspart = Math.floor(lapseMs/1000);
    const decimalpart = lapseMs - unitspart*1000;
    const numofleadingzeros = 3;
    const paddeddecimalpart = "0".repeat(numofleadingzeros).substring(0, numofleadingzeros - decimalpart.toString().length) + decimalpart;
    return (unitspart + '.' + paddeddecimalpart);
}

export async function  EraseLocalData() {
    LogMe(1, 'EraseLocalData()');
=======


export async function  EraseLocalData() {
    if (PARAM_LOGGING_LEVEL>=1) {  LogMe('EraseLocalData()');  }
>>>>>>> f2d05ec (Initial commit)
    // delete images folder
    try {
        await FileSystem.deleteAsync(FileSystem.documentDirectory + PARAM_IMAGES_DIRNAME, {idempotent: true})  // Because idempotent is set to true, it does not throw error if directory does not exist
        // Also delete key-value pairs from storage
        //await AsyncStorage.clear();
<<<<<<< HEAD
        await storage.clearMap();
        await storage.clearAll();  // Undocumented function but necessary, otherwise old data reappears
=======
        storage.clearMap();
        storage.clearAll();  // Undocumented function but necessary, otherwise old data reappears
>>>>>>> f2d05ec (Initial commit)
        await InitialisationActions();
    }
    catch(error) {
        //console.error(error);
        ErrorAlert(error.message, error);  // Some error
    };    
}


export function IsValidImageExtensionAndContentType (myextension) {
    // We assume that there is an equivalence between image extension and image content-type
    return myextension.match(/^[0-9a-zA-Z]+$/);
}


