import { defaultStyles } from '@/styles';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const PublisherLayout = () =>{
    const {theme} = useTheme()
    return(
        <View style={[defaultStyles.container, { backgroundColor: theme.background }]}>
        <Stack>
            <Stack.Screen name='[publishercompanyForm]' options={{ headerShown: false }} />
        </Stack>
        </View>
    )

}

export default PublisherLayout