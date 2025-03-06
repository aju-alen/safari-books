import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';

const PublisherLayout = () =>{

    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publisherDetailsData]' options={{ 
                headerShown: true,
                title: 'Your Books',
                headerStyle: { backgroundColor: 'black' },
                headerTintColor: 'white',
                headerTitleStyle: { fontWeight: 'bold' },
                 }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout