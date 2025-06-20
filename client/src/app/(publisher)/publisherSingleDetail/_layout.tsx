import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const PublisherLayout = () =>{
    const { theme } = useTheme();
    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publisherDetailsSingle]' options={{ headerShown: true,
                title: 'Book Details',
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerTitleStyle: { fontWeight: 'bold'}
             }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout