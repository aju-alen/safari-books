import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const AdminPublisherDetailsLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='singleData' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default AdminPublisherDetailsLayout