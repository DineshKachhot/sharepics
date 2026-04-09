import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useResetPasswordMutation } from '../../hooks/useAuthQueries';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const resetMutation = useResetPasswordMutation();

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    resetMutation.mutate(email, {
      onSuccess: () => {
        Alert.alert(
          'Email Sent',
          'Check your inbox for instructions to reset your password.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      },
      onError: (error) => {
        Alert.alert('Request Failed', error.message);
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email below and we'll send you instructions to reset your password.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            loading={resetMutation.isPending}
            style={styles.submitBtn}
          />

          <Link href="/(auth)/login" asChild>
            <Button
              title="Back to Login"
              variant="text"
              style={styles.backBtn}
            />
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.margins.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.margins.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.typography,
    marginBottom: theme.margins.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.margins.xl,
  },
  submitBtn: {
    marginTop: theme.margins.md,
  },
  backBtn: {
    marginTop: theme.margins.lg,
  },
}));
