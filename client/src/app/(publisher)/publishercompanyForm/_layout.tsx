import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publishercompanyForm]' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout