import { Stack } from 'expo-router';

const AuthenticateLayout = () =>{

    return(
        <Stack>
            <Stack.Screen name='register' options={{ headerShown: false }} />
            {/* <Stack.Screen name='login' options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="[uploadImage]" options={{ headerShown: false }} /> */}
        </Stack>
    )

}

export default AuthenticateLayout