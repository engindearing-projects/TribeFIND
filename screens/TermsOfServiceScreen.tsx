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
const CONTACT_EMAIL = 'support@tribefind.app'

export default function TermsOfServiceScreen() {
  const navigation = useNavigation()

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`)
  }

  return (
    <SafeAreaView style={styles.container} testID="terms-of-service-screen">
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          testID="terms-back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.effectiveDate}>Effective Date: {EFFECTIVE_DATE}</Text>

        <Text style={styles.intro}>
          Welcome to TribeFind. By downloading, accessing, or using the TribeFind
          mobile application ("App"), you agree to be bound by these Terms of Service
          ("Terms"). If you do not agree to these Terms, do not use the App.
        </Text>

        <Section title="1. Eligibility">
          <Text style={styles.body}>
            You must be at least 13 years old to use TribeFind. If you are between 13
            and 18, you must have parental or guardian consent. By using the App, you
            represent that you meet these requirements.
          </Text>
        </Section>

        <Section title="2. Account Registration">
          <Text style={styles.body}>
            To use TribeFind, you must create an account using a valid email address or
            a supported third-party sign-in provider (Google, Apple, or Twitter). You are
            responsible for maintaining the security of your account credentials and for
            all activity that occurs under your account. Notify us immediately if you
            suspect unauthorized access.
          </Text>
        </Section>

        <Section title="3. Acceptable Use">
          <Text style={styles.body}>You agree not to:</Text>
          <BulletList items={[
            'Use the App for any unlawful purpose or to violate any applicable laws',
            'Harass, bully, threaten, or intimidate other users',
            'Post or transmit content that is obscene, hateful, discriminatory, or promotes violence',
            'Impersonate another person or misrepresent your identity or affiliation',
            'Upload malware, viruses, or any harmful code',
            'Attempt to gain unauthorized access to other users\' accounts or our systems',
            'Use automated scripts, bots, or scrapers to access the App',
            'Share another user\'s location, photos, or messages without their consent',
            'Use the App to stalk, track, or monitor another person without their knowledge',
          ]} />
        </Section>

        <Section title="4. User Content">
          <Text style={styles.body}>
            You retain ownership of content you create and share through TribeFind
            (photos, messages, stories, profile information). By posting content, you
            grant us a non-exclusive, worldwide, royalty-free license to display, store,
            and distribute that content as necessary to operate the App. Stories expire
            automatically after 24 hours.
          </Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            We reserve the right to remove content that violates these Terms or that we
            determine, in our sole discretion, is harmful or objectionable.
          </Text>
        </Section>

        <Section title="5. Location Services">
          <Text style={styles.body}>
            TribeFind offers location-based features to help you discover nearby users.
            Location sharing is optional and can be disabled at any time in your settings.
            You understand that sharing your location makes your approximate position
            visible to other users. Never share your precise home address with strangers.
            Use common sense and caution when meeting people discovered through the App.
          </Text>
        </Section>

        <Section title="6. Privacy">
          <Text style={styles.body}>
            Your use of the App is also governed by our Privacy Policy, which describes
            how we collect, use, and protect your information. By using TribeFind, you
            consent to the data practices described in the Privacy Policy.
          </Text>
        </Section>

        <Section title="7. Safety Guidelines">
          <BulletList items={[
            'Meet in public places when connecting with people you\'ve met through the App',
            'Tell a friend or family member about your plans when meeting someone new',
            'Trust your instincts — if something feels off, leave the situation',
            'Report suspicious or inappropriate behavior using the in-app reporting tools',
            'Do not share sensitive personal information (home address, financial details) with other users',
          ]} />
        </Section>

        <Section title="8. Intellectual Property">
          <Text style={styles.body}>
            The App, its design, features, code, and branding are owned by TribeFind and
            protected by copyright and trademark laws. You may not copy, modify, distribute,
            or reverse-engineer any part of the App without our written consent.
          </Text>
        </Section>

        <Section title="9. Termination">
          <Text style={styles.body}>
            We may suspend or terminate your account at any time, with or without notice,
            for conduct that we determine violates these Terms, is harmful to other users,
            or is otherwise objectionable. You may delete your account at any time by
            contacting us.
          </Text>
        </Section>

        <Section title="10. Disclaimers">
          <Text style={styles.body}>
            TribeFind is provided "as is" and "as available" without warranties of any
            kind, either express or implied. We do not guarantee the App will be
            uninterrupted, error-free, or secure. We are not responsible for the actions,
            content, or conduct of other users. Use the App at your own risk.
          </Text>
        </Section>

        <Section title="11. Limitation of Liability">
          <Text style={styles.body}>
            To the maximum extent permitted by law, TribeFind and its officers, employees,
            and affiliates shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or related to your use of
            the App. Our total liability shall not exceed the amount you paid us in the
            12 months preceding the claim, or $100, whichever is greater.
          </Text>
        </Section>

        <Section title="12. Dispute Resolution">
          <Text style={styles.body}>
            Any disputes arising from these Terms or your use of the App shall be resolved
            through binding arbitration in accordance with the rules of the American
            Arbitration Association, conducted in the state of California. You agree to
            waive any right to a jury trial or to participate in a class action.
          </Text>
        </Section>

        <Section title="13. Changes to These Terms">
          <Text style={styles.body}>
            We may modify these Terms at any time. We will notify you of material changes
            through the App or by email. Your continued use of the App after changes take
            effect constitutes acceptance of the revised Terms.
          </Text>
        </Section>

        <Section title="14. Contact Us">
          <Text style={styles.body}>
            If you have questions about these Terms, contact us at:
          </Text>
          <TouchableOpacity onPress={handleEmailPress} testID="terms-email-link">
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
