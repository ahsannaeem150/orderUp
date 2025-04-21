import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    View,
    StyleSheet,

} from "react-native";

import {AuthContext} from "../../context/authContext";


const AgentHome = () => {
    const {state, API_URL} = useContext(AuthContext);


    return (
        <View>

        </View>

    );
};

export default AgentHome;

const styles = StyleSheet.create({

});
