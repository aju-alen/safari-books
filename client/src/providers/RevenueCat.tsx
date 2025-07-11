import { createContext, useContext, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { CustomerInfo } from 'react-native-purchases';

// Use keys from you RevenueCat API Keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
};

interface RevenueCatProps {
  isPro: boolean;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const init = async () => {
       console.log(APIKeys.apple,'api apple key');
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple });
      }
      setIsReady(true);

      // Use more logging during debug if want!
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      // Listen for customer updates
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInformation(info);
      });
    };
    init();
  }, []);

  // Update user state based on previous purchases
  const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
    if (customerInfo?.entitlements.active['SB_Sub_Entitlement'] !== undefined) {
      setIsPro(true);
    }
  };

  const value = {
    isPro,
  };

  // Return empty fragment if provider is not ready (Purchase not yet initialised)
  if (!isReady) return <View></View>;

  return (
  <RevenueCatContext.Provider value={value}>
    {children}
  </RevenueCatContext.Provider>
  )
};

// Export context for easy usage
export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  console.log(context, 'context');
  
  return useContext(RevenueCatContext) as RevenueCatProps;
};