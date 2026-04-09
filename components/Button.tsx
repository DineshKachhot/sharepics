import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ButtonVariant = 'primary' | 'outline' | 'text';

type ButtonProps = {
  title?: string;
  loading?: boolean;
  variant?: ButtonVariant;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(({ 
  title, 
  loading,
  variant = 'primary',
  disabled,
  ...touchableProps 
}, ref) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  return (
    <TouchableOpacity 
      ref={ref} 
      {...touchableProps} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button, 
        isOutline && styles.outlineButton,
        isText && styles.textButton,
        (disabled || loading) && styles.disabled,
        touchableProps.style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isText ? '#007AFF' : '#fff'} />
      ) : (
        <Text style={[
          styles.buttonText,
          isOutline && styles.outlineText,
          isText && styles.textOnlyText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create((theme) => ({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  textButton: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    padding: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textOnlyText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
}));
