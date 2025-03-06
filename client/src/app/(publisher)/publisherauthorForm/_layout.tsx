import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherAuthorLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publisheauthorForm]' options={{ headerShown: true,
                title: 'Publish as an Author',
                headerStyle: { backgroundColor: 'black' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold'}
             }} />
        </Stack>
        </View>
    )

}

export default PublisherAuthorLayout