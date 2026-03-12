import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const EFFECTIVE_DATE = 'March 12, 2026'
const CONTACT_EMAIL = 'privacy@tribefind.app'

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation()

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`)
  }

  return (
    <SafeAreaView style={styles.container} testID="privacy-policy-screen">
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          testID="privacy-back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.effectiveDate}>Effective Date: {EFFECTIVE_DATE}</Text>

        <Text style={styles.intro}>
          TribeFind ("we," "us," or "our") operates the TribeFind mobile application
          (the "App"). This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our App.
        </Text>

        <Section title="1. Information We Collect">
          <SubSection title="Account Information">
            <Text style={styles.body}>
              When you create an account, we collect your email address, display name,
              username, and profile photo. If you sign in with Google, Apple, or Twitter,
              we receive basic profile information from those services (name, email, and
              profile image).
            </Text>
          </SubSection>

          <SubSection title="Location Data">
            <Text style={styles.body}>
              TribeFind uses your device's location to help you discover nearby users
              who share your interests. We collect precise location data only when you
              grant permission and the App is in use. You can adjust location sharing
              in Settings {'>'} Location Settings at any time. We never sell your
              location data to third parties.
            </Text>
          </SubSection>

          <SubSection title="Photos and Media">
            <Text style={styles.body}>
              Photos and videos you capture or upload through the App are stored on our
              servers (hosted by Supabase). Media shared in chats or stories is accessible
              to the intended recipients. Stories automatically expire after 24 hours.
            </Text>
          </SubSection>

          <SubSection title="Messages">
            <Text style={styles.body}>
              Chat messages are stored to enable conversation history. Messages are only
              visible to the participants of each conversation.
            </Text>
          </SubSection>

          <SubSection title="Usage Data">
            <Text style={styles.body}>
              We collect anonymous analytics data including screen views, feature usage
              frequency, and crash reports via Sentry. This helps us improve the App
              experience. Analytics data does not include message content or precise
              location coordinates.
            </Text>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <BulletList items={[
            'Provide and maintain the App\'s core features (discovery, messaging, stories)',
            'Show you nearby users based on shared activities and interests',
            'Send push notifications you\'ve opted into (messages, friend requests, nearby activity)',
            'Detect and prevent fraud, abuse, and security incidents',
            'Improve App performance and fix bugs using crash reports',
            'Comply with legal obligations',
          ]} />
        </Section>

        <Section title="3. How We Share Your Information">
          <Text style={styles.body}>
            We do not sell your personal information. We may share information in these
            limited circumstances:
          </Text>
          <BulletList items={[
            'With other users: Your profile, username, activities, and approximate location (when enabled) are visible to other TribeFind users.',
            'Service providers: We use Supabase for data storage and authentication, Sentry for error tracking, and Expo for push notifications. These providers process data on our behalf under strict agreements.',
            'Legal requirements: We may disclose information if required by law, court order, or to protect the safety of our users.',
          ]} />
        </Section>

        <Section title="4. Data Storage and Security">
          <Text style={styles.body}>
            Your data is stored on Supabase's cloud infrastructure with encryption at
            rest and in transit. We implement industry-standard security measures including
            secure authentication tokens, row-level security policies, and encrypted
            connections. However, no method of electronic transmission or storage is
            100% secure.
          </Text>
        </Section>

        <Section title="5. Your Rights and Choices">
          <BulletList items={[
            'Location sharing: Toggle location visibility in Location Settings. You can use the App without sharing your location, though discovery features will be limited.',
            'Push notifications: Manage notification preferences in your device settings or within the App.',
            'Account deletion: You may request deletion of your account and all associated data by contacting us at ' + CONTACT_EMAIL + '.',
            'Data export: You may request a copy of your personal data by emailing us.',
            'Profile visibility: Control what information is visible on your profile.',
          ]} />
        </Section>

        <Section title="6. Children's Privacy">
          <Text style={styles.body}>
            TribeFind is not intended for users under 13 years of age. We do not
            knowingly collect personal information from children under 13. If you
            believe a child under 13 has provided us with personal information, please
            contact us immediately and we will delete it.
          </Text>
        </Section>

        <Section title="7. Third-Party Links">
          <Text style={styles.body}>
            The App may contain links to third-party websites or services (e.g., linked
            Twitter profiles). We are not responsible for the privacy practices of those
            third parties. We encourage you to review their privacy policies.
          </Text>
        </Section>

        <Section title="8. Changes to This Policy">
          <Text style={styles.body}>
            We may update this Privacy Policy from time to time. We will notify you of
            material changes through the App or via email. Your continued use of the
            App after changes are posted constitutes acceptance of the updated policy.
          </Text>
        </Section>

        <Section title="9. Contact Us">
          <Text style={styles.body}>
            If you have questions or concerns about this Privacy Policy or your data,
            contact us at:
          </Text>
          <TouchableOpacity onPress={handleEmailPress} testID="privacy-email-link">
            <Text style={styles.emailLink}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </Section>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 10,
  },
  subSection: {
    marginBottom: 12,
    marginLeft: 8,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4338ca',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  bullet: {
    fontSize: 14,
    color: '#6366f1',
    marginRight: 8,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  emailLink: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 40,
  },
})
