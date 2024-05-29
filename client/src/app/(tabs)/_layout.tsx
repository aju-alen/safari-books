import { COLORS, FONTSIZE } from '@/constants/tokens';
import { Tabs } from 'expo-router';
import {FontAwesome5} from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
const TabsLaout = () =>{

    return(
        <Tabs screenOptions={{
            tabBarActiveTintColor:COLORS.primary,
            tabBarLabelStyle : {
                fontSize:FONTSIZE.xSmall,
                fontWeight:'500'
            },
            headerShown:false,
            tabBarStyle:{
                position:'absolute',
                borderTopLeftRadius:20,
                borderTopRightRadius:20,
                borderTopWidth:0,
                paddingTop:8,
                backgroundColor:"#1B1212",
            },
            
        }}>
            <Tabs.Screen
        name="home"
        options={{ 
            tabBarLabel: "Home",
            tabBarIcon:() => <AntDesign name="home" size={24} color={COLORS.primary}  />
        }}
      />
            <Tabs.Screen
        name="search"
        options={{ tabBarLabel: "Search",

        tabBarIcon:() => <AntDesign name="search1" size={24} color={COLORS.primary} />
         }}
      />
            <Tabs.Screen
        name="library"
        options={{ tabBarLabel: "Library",
        tabBarIcon:() => <Ionicons name="library-outline" size={24} color={COLORS.primary}  />
         }}
      />
            <Tabs.Screen
        name="profile"
        options={{ tabBarLabel: "Profile",
        tabBarIcon:() => <MaterialCommunityIcons name="face-man-profile" size={24} color={COLORS.primary} />
         }}
      />
        </Tabs>
    )

}

export default TabsLaout