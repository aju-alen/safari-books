import React, { createContext, useContext, useEffect, useState } from 'react'
import { COLORS, DARK_COLORS } from '@/constants/tokens'
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext({
  theme: COLORS, 
  isDarkMode: false,
  toggleTheme: () => {}
})

const ThemeProvider = ({children}:{children:React.ReactNode}) => {
    const [isDarkMode, setIsDarkMode] = useState(false)


    useEffect(() => {
        const checkTheme = async () => {
            const theme = await SecureStore.getItemAsync('theme')
            console.log(theme,"storag theme ");
            setIsDarkMode(theme === "DARK_COLORS"?true:false)
        }
        checkTheme()
    }, [])
    
    const theme = isDarkMode ? DARK_COLORS : COLORS

    const toggleTheme = async() => {
        setIsDarkMode(!isDarkMode)
        await SecureStore.setItemAsync('theme', !isDarkMode ? "DARK_COLORS" : "COLORS")
    }
    
  return (
    <ThemeContext.Provider value={{theme, isDarkMode, toggleTheme}}>
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