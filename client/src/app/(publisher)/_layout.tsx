import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const PublisherLayout = () =>{
    const {theme} = useTheme()
    return(
        <View style={[defaultStyles.container, { backgroundColor: theme.background }]}>
        <Stack>
            <Stack.Screen name='publisherhome' options={{ headerShown: false }} />

            <Stack.Screen name='publisherauthorForm' options={{ headerShown: true, title: 'Publish Author', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back' }} />

            <Stack.Screen name='publishercompanyForm' options={{ headerShown: true, title: 'Publish Company', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back' }} />

            <Stack.Screen name='[publisherCommonForm]' options={{ headerShown: false }} />

            <Stack.Screen name='publisherDetails' options={{ headerShown: true, title: 'Your Books', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back' }} />

            <Stack.Screen name='publisherSingleDetail' options={{ headerShown: true, title: 'Book Details', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back' }} />

            <Stack.Screen name='settings' options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Back' }} />

            <Stack.Screen name='support' options={{ headerShown: true, title: 'Support', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text, headerTitleStyle: { fontWeight: 'bold', fontSize: 26 }, headerBackTitle: 'Settings' }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout