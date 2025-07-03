import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  COLORS, 
  DARK_COLORS, 
  NATURE_LIGHT, 
  NATURE_DARK, 
  DESERT_LIGHT, 
  DESERT_DARK, 
  OCEAN_LIGHT, 
  OCEAN_DARK, 
  PASTEL_LIGHT, 
  PASTEL_DARK 
} from '@/constants/tokens'
import * as SecureStore from 'expo-secure-store';

export type ThemeType = 'nature' | 'desert' | 'ocean' | 'pastel';

const ThemeContext = createContext({
  theme: COLORS, 
  isDarkMode: false,
  currentTheme: 'nature' as ThemeType,
  toggleTheme: () => {},
  setTheme: (theme: ThemeType) => {}
})

const ThemeProvider = ({children}:{children:React.ReactNode}) => {
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [currentTheme, setCurrentTheme] = useState<ThemeType>('nature')

    const getThemeColors = (themeType: ThemeType, dark: boolean) => {
        switch (themeType) {
            case 'nature':
                return dark ? NATURE_DARK : NATURE_LIGHT;
            case 'desert':
                return dark ? DESERT_DARK : DESERT_LIGHT;
            case 'ocean':
                return dark ? OCEAN_DARK : OCEAN_LIGHT;
            case 'pastel':
                return dark ? PASTEL_DARK : PASTEL_LIGHT;
            default:
                return dark ? NATURE_DARK : NATURE_LIGHT;
        }
    };

    useEffect(() => {
        const checkTheme = async () => {
            const savedTheme = await SecureStore.getItemAsync('theme')
            const savedThemeType = await SecureStore.getItemAsync('themeType')
            console.log(savedTheme, "storage theme");
            console.log(savedThemeType, "storage theme type");
            
            if (savedThemeType) {
                setCurrentTheme(savedThemeType as ThemeType);
            }
            setIsDarkMode(savedTheme === "DARK_COLORS" ? true : false)
        }
        checkTheme()
    }, [])
    
    const theme = getThemeColors(currentTheme, isDarkMode)

    const toggleTheme = async() => {
        setIsDarkMode(!isDarkMode)
        await SecureStore.setItemAsync('theme', !isDarkMode ? "DARK_COLORS" : "COLORS")
    }

    const setTheme = async (themeType: ThemeType) => {
        setCurrentTheme(themeType)
        await SecureStore.setItemAsync('themeType', themeType)
    }
    
  return (
    <ThemeContext.Provider value={{theme, isDarkMode, currentTheme, toggleTheme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}