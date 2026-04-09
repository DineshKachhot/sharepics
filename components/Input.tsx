import { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type InputProps = {
  label?: string;
  error?: string;
} & TextInputProps;

export const Input = forwardRef<TextInput, InputProps>(({ label, error, ...props }, ref) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[styles.input, error && styles.inputError, props.style]}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.margins.lg,
    width: '100%',
  },
  label: {
    color: theme.colors.typography,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: theme.margins.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    color: theme.colors.typography,
    fontSize: 16,
    padding: 16,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: theme.margins.sm,
  },
}));
