import { Tabs } from 'expo-router';

const TabsLaout = () =>{

    return(
        <Tabs>
            <Tabs.Screen name='home' options={{ headerShown: false }} />
            <Tabs.Screen name='favoirites' options={{ headerShown: false }} />
            <Tabs.Screen name='library' options={{ headerShown: false }} />
            <Tabs.Screen name='favoirites' options={{ headerShown: false }} />
        </Tabs>
    )

}

export default TabsLaout