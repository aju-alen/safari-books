import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherAuthorLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publisheauthorForm]' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default PublisherAuthorLayout