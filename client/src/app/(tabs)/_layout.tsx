import { Tabs } from 'expo-router';

const TabsLaout = () =>{

    return(
        <Tabs>
            <Tabs.Screen
        name="home"
        options={{ headerShown: false, tabBarLabel: "Home" }}
      />
        </Tabs>
    )

}

export default TabsLaout