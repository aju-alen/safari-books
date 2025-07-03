import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { defaultStyles } from '@/styles'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/responsiveSize'
import { FONT } from '@/constants/tokens'
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'

const Support = () => {
  const { theme } = useTheme()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqData = [
    {
      question: "How do I publish my first book?",
      answer: "To publish your first book, navigate to the 'Publish New Book' section from your dashboard. Fill in all required information including title, synopsis, and upload your audio files. Submit for review and our team will get back to you within 48 hours."
    },
    {
      question: "What file formats are supported for audio uploads?",
      answer: "We support MP3, WAV, and M4A formats for audio files. Ensure your audio quality is at least 128kbps for optimal listening experience. Maximum file size is 500MB per audio file."
    },
    {
      question: "How long does the approval process take?",
      answer: "Our review process typically takes 2-3 business days. We review content quality, audio clarity, and ensure compliance with our publishing guidelines. You'll receive an email notification once your book is approved or if any changes are needed."
    },
    {
      question: "How do I track my book's performance?",
      answer: "Visit the 'Analytics' section in your dashboard to view detailed insights about your book's performance, including listener count, revenue earned, and engagement metrics. Data is updated in real-time."
    },
  ]

  const contactOptions = [
    {
      title: "Email Support",
      subtitle: "Get detailed assistance via email",
      icon: <Ionicons name="mail-outline" size={24} color={theme.primary} />,
      action: () => Linking.openURL('mailto:support@safaribooks.com?subject=Publisher Support Request')
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
          <TouchableOpacity
            style={styles.emergencyContact}
            onPress={() => Linking.openURL('mailto:urgent@safaribooks.com?subject=URGENT: Publisher Support')}
          >
            <Text style={styles.emergencyTitle}>🚨 Urgent Support</Text>
            <Text style={styles.emergencyText}>
              For critical issues affecting your book publishing or account access
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Support