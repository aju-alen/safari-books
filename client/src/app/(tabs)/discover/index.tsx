import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { defaultStyles } from '@/styles'
// import { eBookData } from '@/utils/flatlistData' // Remove hardcoded data
import { moderateScale, verticalScale } from '@/utils/responsiveSize'
import { COLORS } from '@/constants/tokens'
import TrendingRelease from '@/components/TrendingRelease'
import { ipURL } from '@/utils/backendURL'
import { axiosWithAuth } from '@/utils/customAxios'

const API_URL = `${ipURL}/api/listeners/books-data`; // Update to your backend URL if needed

const DiscoverPage = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosWithAuth.get(API_URL);
        const data = response.data;
        setAllBooks(response.data.books || []);
      } catch (err) {
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Helper to filter books by category (case-insensitive)
  const filterByCategory = (category) =>
    allBooks.filter((book) =>
      (book.categories || '').toLowerCase() === category.toLowerCase()
    );

  const bookDataRomance = filterByCategory('mystery');
  const bookDataComedy = filterByCategory('science');
  const bookDataEducation = filterByCategory('education');

  return (
    <SafeAreaView style={defaultStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View>
            <Text style={defaultStyles.mainText}>Top listens across categories</Text>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading books...</Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <Text style={[defaultStyles.mainText, styles.mainHeading]}>New in Mystery</Text>
              <View>
                {bookDataRomance.length > 0 ? (
                  <TrendingRelease bookData={bookDataRomance} />
                ) : (
                  <Text style={styles.emptyText}>No Romance books found.</Text>
                )}
              </View>

              <Text style={[defaultStyles.mainText, styles.mainHeading]}>New in Science</Text>
              <View>
                {bookDataComedy.length > 0 ? (
                  <TrendingRelease bookData={bookDataComedy} />
                ) : (
                  <Text style={styles.emptyText}>No Comedy books found.</Text>
                )}
              </View>

              <Text style={[defaultStyles.mainText, styles.mainHeading]}>New in Education</Text>
              <View>
                {bookDataEducation.length > 0 ? (
                  <TrendingRelease bookData={bookDataEducation} />
                ) : (
                  <Text style={styles.emptyText}>No Education books found.</Text>
                )}
              </View>
            </>
          )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
    fontSize: moderateScale(16),
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(16),
    marginTop: 10,
  },
  emptyText: {
    color: '#888',
    fontSize: moderateScale(14),
    margin: moderateScale(10),
    textAlign: 'center',
  },
})