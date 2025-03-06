import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publishercompanyForm]' options={{ headerShown: true,
                title: 'Publish as a Company',
                headerStyle: { backgroundColor: 'black' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold'}
             }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout