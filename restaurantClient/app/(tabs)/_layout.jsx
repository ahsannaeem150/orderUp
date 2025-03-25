import {View, Text} from "react-native";
import React from "react";
import {Tabs} from "expo-router";
import {icons} from "../../constants";
import TabIcon from "../components/TabIcon";
import TabBar from "../components/TabBar";

const TabLayout = () => {
    return (
        <Tabs tabBar={(props) => <TabBar {...props} />}>
            <Tabs.Screen
                name="(home)"
                options={{title: "Home", headerShown: false}}
            />
            <Tabs.Screen
                name="(orders)"
                options={{title: "Orders", headerShown: false}}
            />
            <Tabs.Screen
                name="profile"
                options={{title: "Profile", headerShown: false}}
            />
        </Tabs>
    );
};

export default TabLayout;
