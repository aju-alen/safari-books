import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='publisherhome' options={{ headerShown: false }} />
            <Stack.Screen name='publisherauthorForm' options={{ headerShown: false }} />
            <Stack.Screen name='publishercompanyForm' options={{ headerShown: false }} />
            <Stack.Screen name='[publisherCommonForm]' options={{ headerShown: false }} />
            <Stack.Screen name='publisherDetails' options={{ headerShown: false }} />
            <Stack.Screen name='publisherSingleDetail' options={{ headerShown: false }} />
            <Stack.Screen name='settings' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout