import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const AdminLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='home' options={{ headerShown: false }} />
            <Stack.Screen name='publisherDetails' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default AdminLayout