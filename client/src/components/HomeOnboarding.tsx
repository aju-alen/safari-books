import React from 'react';
import { View, StyleSheet,Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { defaultStyles } from '@/styles';
import { COLORS, FONT, FONTSIZE } from '@/constants/tokens';

const HomeOnboarding = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(100,2,2,1)', 'rgba(000,000,000,1)']}
                style={styles.oval}
            >
              <View>
                <Text style={{textAlign:'center',fontSize: FONTSIZE.xLarge,fontFamily:FONT.notoBold,color: COLORS.text,}}>Members get even more</Text>

                <View style={styles.cardContainer} >
                <Text style={defaultStyles.mainText}>Pick 1 audiobook a month</Text>

                <Text style={defaultStyles.text}>Choose any title you want from our unmatched collection—including bestsellers and new releases. This is yours to keep.</Text>
                </View>

                <View style={styles.cardContainer} >
                <Text style={defaultStyles.mainText}>Thousands of included titles</Text>

                <Text style={defaultStyles.text}>Listen all you want to thousands of included audiobooks and Originals with celebs you love and emerging talent.</Text>
                </View>

                <View style={styles.cardContainer} >
                <Text style={defaultStyles.mainText}>Deals & discounts</Text>

                <Text style={defaultStyles.text}>Get up to 30% off additional audiobooks, plus access to exclusive sales. Cancel anytime.</Text>
                </View>

              </View>
              </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
      
    },
    oval: {
        width: "100%",
        borderRadius: 10, // Half of the height to make it an oval
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
      backgroundColor: '#000',
      padding: 20,
      borderRadius: 10,
      margin: 20,
      width: 400,
      
    }
});

export default HomeOnboarding;
