//import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Button, Text, TextInput, View } from 'react-native';

import { styles } from './myVisualsLibrary.jsx';
import { ErrorAlert, LogMe } from '../myGeneralLibrary.jsx';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters.js';
>>>>>>> f2d05ec (Initial commit)


export const TabsComponent = props => {

    async function ComponentRefresh() {    
<<<<<<< HEAD
        LogMe(1, 'Refreshing Tabs Component');
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Refreshing Tabs Component');  }
>>>>>>> f2d05ec (Initial commit)
    }


    ComponentRefresh();
    

    return (
            
            <View style={styles.headertitle}>
            {/*
                <View style={styles.space}>
                    <Text style={styles.medium}></Text>
                </View>
            */}
                <View style={styles.tabselector}>
                    <Button {... (props.activeTab!='Chats') ? {color:'gray'} : {}} title='Chats' onPress={() => props.setCurrentScreenInTabsComponent('Chats')} />
                    <Button {... (props.activeTab!='Settings') ? {color:'gray'} : {}} title='Settings' onPress={() => props.setCurrentScreenInTabsComponent('Settings')} />
                </View>
            </View>
            
    );
};



