import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const TermsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1E1440', '#0F0A1E']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Feather name="chevron-left" size={24} color="#fff" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Kalam! These Terms and Conditions govern your use of our platform, where writers can share their stories and readers can discover them. By accessing or using our platform, you agree to be bound by these terms.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.paragraph}>
          To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
        </Text>

        <Text style={styles.sectionTitle}>3. Content Ownership</Text>
        <Text style={styles.paragraph}>
          Writers retain full ownership of the intellectual property rights to the stories they upload. By posting content on Kalam, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the platform's services.
        </Text>

        <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to use the platform to upload any content that is illegal, defamatory, highly offensive, or violates the intellectual property rights of others. We reserve the right to remove any content that violates these guidelines without prior notice.
        </Text>

        <Text style={styles.sectionTitle}>5. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate your account if you violate these Terms and Conditions. Upon termination, your right to use the platform will immediately cease.
        </Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1440',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  lastUpdated: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E9D5FF',
    marginBottom: 10,
    marginTop: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
});

export default TermsScreen;
