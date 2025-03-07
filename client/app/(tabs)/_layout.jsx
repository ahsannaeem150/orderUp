import React from "react";
import { Tabs } from "expo-router";
import TabBar from "../components/TabBar";

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="(home)"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: "Cart", headerShown: false }}
      />
      <Tabs.Screen
        name="(orders)"
        options={{ title: "Orders", headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", headerShown: false }}
      />
    </Tabs>
  );
};

export default TabLayout;
