import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { defaultStyles } from '@/styles'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { FONT } from '@/constants/tokens'
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'

const SupportPage = () => {
  const { theme } = useTheme()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqData = [
    {
      question: "How do I start listening to audiobooks?",
      answer: "To start listening, simply browse our library of audiobooks on the home page. You can explore by categories, trending books, or search for specific titles. Once you find a book you like, tap on it to view details and start listening to the sample or subscribe to access the full audiobook."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer flexible subscription plans including monthly and annual options. Our premium subscription gives you unlimited access to our entire audiobook library and exclusive content."
    },
    {
      question: "How do I track my listening progress?",
      answer: "Your listening progress is automatically saved as you listen. You can resume from where you left off by going to the 'Continue Listening' section on the home page. Your progress is synced across all your devices when you're signed in."
    },
    {
      question: "How do I manage my account settings?",
      answer: "Access your account settings by tapping the profile icon in the bottom navigation. Here you can update your personal information."
    },
    {
      question: "How do I report technical issues?",
      answer: "If you encounter any technical issues, you can report them through the 'Contact Support' option in this help section. Please include details about your device, app version, and a description of the issue for faster resolution."
    },
    {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription by going to the your App/Play Store and canceling the subscription as they are not managed by us."
    }

  ]

  const contactOptions = [
    {
      title: "Email Support",
      subtitle: "Get detailed assistance via email",
      icon: <Ionicons name="mail-outline" size={24} color={theme.primary} />,
      action: () => Linking.openURL('mailto:support@safbooks.com?subject=Publisher Support Request')
    },
    // {
    //   title: "Live Chat",
    //   subtitle: "Chat with our support team",
    //   icon: <Ionicons name="chatbubble-outline" size={24} color={theme.primary} />,
    //   action: () => Alert.alert("Live Chat", "Live chat feature coming soon! Please use email support for now.")
    // },
    // {
    //   title: "Phone Support",
    //   subtitle: "Call us during business hours",
    //   icon: <Ionicons name="call-outline" size={24} color={theme.primary} />,
    //   action: () => Linking.openURL('tel:+254700000000')
    // }
  ]

//   const resources = [
//     {
//       title: "Publishing Guidelines",
//       subtitle: "Learn about our content standards",
//       icon: <MaterialIcons name="description" size={24} color={theme.primary} />
//     },
//     {
//       title: "Audio Quality Guide",
//       subtitle: "Best practices for audio recording",
//       icon: <MaterialIcons name="audiotrack" size={24} color={theme.primary} />
//     },
//     {
//       title: "Revenue Guide",
//       subtitle: "Understanding your earnings",
//       icon: <MaterialIcons name="account-balance-wallet" size={24} color={theme.primary} />
//     }
//   ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: moderateScale(20),
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(32),
      paddingTop: verticalScale(20),
    },
    title: {
      fontSize: moderateScale(28),
      fontWeight: '700',
      color: theme.text,
      marginBottom: verticalScale(8),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: moderateScale(16),
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: moderateScale(24),
    },
    section: {
      marginBottom: verticalScale(32),
    },
    sectionTitle: {
      fontSize: moderateScale(20),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(16),
      fontFamily: FONT.RobotoMedium,
    },
    contactCard: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      marginBottom: verticalScale(12),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    contactIcon: {
      marginRight: horizontalScale(16),
    },
    contactContent: {
      flex: 1,
    },
    contactTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(4),
    },
    contactSubtitle: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
    },
    faqItem: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      marginBottom: verticalScale(12),
      overflow: 'hidden',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    faqQuestion: {
      padding: moderateScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    faqQuestionText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      marginRight: horizontalScale(12),
    },
    faqAnswer: {
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(20),
      borderTopWidth: 1,
      borderTopColor: theme.gray2,
    },
    faqAnswerText: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
      lineHeight: moderateScale(20),
    },
    resourceCard: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      marginBottom: verticalScale(12),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    resourceIcon: {
      marginRight: horizontalScale(16),
    },
    resourceContent: {
      flex: 1,
    },
    resourceTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: verticalScale(4),
    },
    resourceSubtitle: {
      fontSize: moderateScale(14),
      color: theme.textMuted,
    },
    emergencyContact: {
      backgroundColor: theme.primary,
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      alignItems: 'center',
      marginTop: verticalScale(20),
    },
    emergencyTitle: {
      fontSize: moderateScale(18),
      fontWeight: '700',
      color: theme.white,
      marginBottom: verticalScale(8),
    },
    emergencyText: {
      fontSize: moderateScale(14),
      color: theme.white,
      textAlign: 'center',
      opacity: 0.9,
    },
  })

  return (
    <SafeAreaView style={[defaultStyles.container, styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Support Center</Text>
            <Text style={styles.subtitle}>Get help with publishing, technical issues, and account management</Text>
          </View>

          {/* Contact Options Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={styles.contactIcon}>
                  {option.icon}
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqData.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Resources Section */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Helpful Resources</Text>
            {resources.map((resource, index) => (
              <View key={index} style={styles.resourceCard}>
                <View style={styles.resourceIcon}>
                  {resource.icon}
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceSubtitle}>{resource.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            ))}
          </View> */}

          {/* Emergency Contact */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SupportPage