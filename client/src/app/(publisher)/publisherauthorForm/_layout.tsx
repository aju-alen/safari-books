import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const PublisherAuthorLayout = () =>{
    const { theme } = useTheme();
    return(
        <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='[publisheauthorForm]' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default PublisherAuthorLayout