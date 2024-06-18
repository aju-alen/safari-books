import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
import { eBookData } from '@/utils/flatlistData'
import { moderateScale, verticalScale } from '@/utils/responsiveSize'
import { COLORS } from '@/constants/tokens'
import TrendingRelease from '@/components/TrendingRelease'

const DiscoverPage = () => {
  const [bookData, setBookData] = useState([]);
  const [bookDataComedy, setBookDataComedy] = useState([]);

  const [bookDataEducation, setBookDataEducation] = useState([]);

  useEffect(() => {

    setBookData(eBookData.filter((book) => book.categories === 'Romance'))

    setBookDataComedy(eBookData.filter((book) => book.categories === 'Comedy'))

    setBookDataEducation(eBookData.filter((book) => book.categories === 'Education'))
  }, [])
  return (
    <SafeAreaView style={defaultStyles.container}>
<ScrollView showsVerticalScrollIndicator={false}>
    <View>
      <Text style={defaultStyles.text}>DiscoverPage</Text>

      <View>
        <Text style={defaultStyles.mainText}>Top listens across categories</Text>
      </View>

      <Text style={[defaultStyles.mainText,styles.mainHeading]}>New in Romance</Text>
        <View>
          <TrendingRelease bookData={bookData} />
        </View>

        <Text style={[defaultStyles.mainText,styles.mainHeading]}>New in Comedy</Text>
        <View>
          <TrendingRelease bookData={bookDataComedy} />
        </View>

        <Text style={[defaultStyles.mainText,styles.mainHeading]}>New in Education</Text>
        <View>
          <TrendingRelease bookData={bookDataEducation} />
        </View>
    </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default DiscoverPage

const styles = StyleSheet.create({
  homeBar: {
    height: verticalScale(60),
    backgroundColor: COLORS.tabs,
    borderEndEndRadius: moderateScale(10),
    borderBottomLeftRadius: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homebarSearch: {
    padding: moderateScale(10),
    margin: moderateScale(10),
  },
  homeBarLogo: {
    fontSize: moderateScale(20),
    color: COLORS.primary,
    fontWeight: 'bold',
    margin: moderateScale(10),
  },
  mainHeading: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    margin: moderateScale(10),
  },
  newReleaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
})