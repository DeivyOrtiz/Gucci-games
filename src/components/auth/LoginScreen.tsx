import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { signIn, signUp, sendResetOtp, verifyResetOtp, updatePassword, signOut, isRecoveryMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 6-digit OTP Password Recovery states
  const [forgotStep, setForgotStep] = useState<'requestOtp' | 'verifyOtp' | 'newPassword'>('requestOtp');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Ingresa tu usuario o correo electrónico.');
      return;
    }
    if (!password) {
      setErrorMessage('Ingresa tu contraseña.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const { error } = await signIn(identifier.trim(), password);
    setLoading(false);

    if (error) {
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_grant')
      ) {
        setErrorMessage('Usuario, correo o contraseña incorrectos.');
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!registerUsername.trim()) {
      setErrorMessage('Ingresa un nombre de usuario.');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const { error } = await signUp(
      registerUsername.trim(),
      registerEmail.trim(),
      password
    );
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              setMode('login');
              setIdentifier(registerUsername.trim());
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (isRecoveryMode) {
      setMode('forgot');
      setForgotStep('newPassword');
    }
  }, [isRecoveryMode]);

  const handleSendOtp = async () => {
    if (!recoveryIdentifier.trim()) {
      setErrorMessage('Ingresa tu nombre de usuario o correo.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const { email, error } = await sendResetOtp(recoveryIdentifier.trim());
    setLoading(false);

    if (error || !email) {
      setErrorMessage(error?.message || 'No se pudo enviar el código. Verifica tus datos.');
      return;
    }

    setResolvedEmail(email);
    setForgotStep('verifyOtp');
    setCountdown(60);
    Alert.alert(
      'Código Enviado',
      `Hemos enviado un código de 6 dígitos a:\n${email}\nRevisa tu bandeja de entrada o carpeta de spam.`
    );
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      setErrorMessage('Ingresa el código completo de 6 dígitos.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const { error } = await verifyResetOtp(resolvedEmail, cleanOtp);
    setLoading(false);

    if (error) {
      setErrorMessage('Código inválido o expirado. Revisa tu correo o solicita uno nuevo.');
      return;
    }

    setForgotStep('newPassword');
  };

  const handleSetNewPassword = async () => {
    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error al actualizar la contraseña.');
      return;
    }

    await signOut();

    Alert.alert(
      '¡Contraseña Actualizada!',
      'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      [
        {
          text: 'Iniciar Sesión',
          onPress: () => {
            setIdentifier(resolvedEmail);
            setPassword('');
            setForgotStep('requestOtp');
            setRecoveryIdentifier('');
            setResolvedEmail('');
            setOtpCode('');
            setNewPassword('');
            setConfirmNewPassword('');
            setMode('login');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Main Logo with ambient golden glow */}
          <View style={styles.logoOuterWrapper}>
            {/* Ambient golden glow circle */}
            <View style={styles.ambientGlow} />

            {/* Logo box */}
            <View style={styles.logoCard}>
              <Image
                source={require('@/assets/images/gucci-logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Error notification banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#FF4D4D" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Content */}
          <View style={styles.formContainer}>
            {mode === 'login' && (
              <>
                {/* Username / Email Field */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Usuario o Correo"
                    placeholderTextColor="#75757C"
                    value={identifier}
                    onChangeText={(t) => {
                      setIdentifier(t);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Contraseña"
                    placeholderTextColor="#75757C"
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => {
                    setErrorMessage(null);
                    setMode('forgot');
                  }}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}>
                  {loading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>

                {/* Separator "o" */}
                <Text style={styles.separatorText}>o</Text>

                {/* Register Button */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setErrorMessage(null);
                    setMode('register');
                  }}
                  activeOpacity={0.8}>
                  <Text style={styles.secondaryButtonText}>Registrarse</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'register' && (
              <>
                {/* Username */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de Usuario"
                    placeholderTextColor="#75757C"
                    value={registerUsername}
                    onChangeText={setRegisterUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Email */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico"
                    placeholderTextColor="#75757C"
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Contraseña"
                    placeholderTextColor="#75757C"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="#75757C"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>

                {/* Submit Register */}
                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 12 }, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}>
                  {loading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                  style={[styles.secondaryButton, { marginTop: 14 }]}
                  onPress={() => {
                    setErrorMessage(null);
                    setMode('login');
                  }}
                  activeOpacity={0.8}>
                  <Text style={styles.secondaryButtonText}>Volver a Iniciar Sesión</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'forgot' && (
              <>
                {forgotStep === 'requestOtp' && (
                  <>
                    <Text style={styles.forgotHeaderTitle}>Recuperar Contraseña</Text>
                    <Text style={styles.forgotDescription}>
                      Ingresa tu usuario o correo registrado. Te enviaremos un código de seguridad de 6 dígitos a tu bandeja de entrada.
                    </Text>

                    {/* Identifier */}
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Usuario o Correo Electrónico"
                        placeholderTextColor="#75757C"
                        value={recoveryIdentifier}
                        onChangeText={(t) => {
                          setRecoveryIdentifier(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, { marginTop: 14 }, loading && styles.buttonDisabled]}
                      onPress={handleSendOtp}
                      disabled={loading}
                      activeOpacity={0.85}>
                      {loading ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Enviar Código OTP</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryButton, { marginTop: 14 }]}
                      onPress={() => {
                        setErrorMessage(null);
                        setMode('login');
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.secondaryButtonText}>Volver a Iniciar Sesión</Text>
                    </TouchableOpacity>
                  </>
                )}

                {forgotStep === 'verifyOtp' && (
                  <>
                    <Text style={styles.forgotHeaderTitle}>Código de Seguridad</Text>
                    <Text style={styles.forgotDescription}>
                      Ingresa el código de 6 dígitos que enviamos a:{'\n'}
                      <Text style={{ color: '#F5A623', fontWeight: '700' }}>{resolvedEmail}</Text>
                    </Text>

                    {/* OTP 6 digits input */}
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="• • • • • •"
                        placeholderTextColor="#52525B"
                        value={otpCode}
                        onChangeText={(t) => {
                          setOtpCode(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    {/* Resend OTP button */}
                    <View style={styles.resendContainer}>
                      {countdown > 0 ? (
                        <Text style={styles.resendCountdownText}>
                          Reenviar código en {countdown}s
                        </Text>
                      ) : (
                        <TouchableOpacity
                          onPress={handleSendOtp}
                          disabled={loading}
                          activeOpacity={0.8}>
                          <Text style={styles.resendActiveText}>
                            ¿No recibiste el código? Reenviar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, { marginTop: 12 }, loading && styles.buttonDisabled]}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                      activeOpacity={0.85}>
                      {loading ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Verificar Código</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryButton, { marginTop: 14 }]}
                      onPress={() => {
                        setErrorMessage(null);
                        setForgotStep('requestOtp');
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.secondaryButtonText}>Cambiar Correo / Volver</Text>
                    </TouchableOpacity>
                  </>
                )}

                {forgotStep === 'newPassword' && (
                  <>
                    <Text style={styles.forgotHeaderTitle}>Nueva Contraseña</Text>
                    <Text style={styles.forgotDescription}>
                      ¡Código verificado exitosamente! Escribe tu nueva contraseña segura.
                    </Text>

                    {/* New Password */}
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, { paddingRight: 48 }]}
                        placeholder="Nueva Contraseña"
                        placeholderTextColor="#75757C"
                        value={newPassword}
                        onChangeText={(t) => {
                          setNewPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons
                          name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="#8E8E93"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Confirm New Password */}
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, { paddingRight: 48 }]}
                        placeholder="Confirmar Nueva Contraseña"
                        placeholderTextColor="#75757C"
                        value={confirmNewPassword}
                        onChangeText={(t) => {
                          setConfirmNewPassword(t);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        secureTextEntry={!showConfirmNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons
                          name={showConfirmNewPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="#8E8E93"
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, { marginTop: 14 }, loading && styles.buttonDisabled]}
                      onPress={handleSetNewPassword}
                      disabled={loading}
                      activeOpacity={0.85}>
                      {loading ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Guardar Nueva Contraseña</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryButton, { marginTop: 14 }]}
                      onPress={async () => {
                        setErrorMessage(null);
                        await signOut();
                        setForgotStep('requestOtp');
                        setMode('login');
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.secondaryButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    backgroundColor: '#0E0E10',
  },
  logoOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    position: 'relative',
    width: 220,
    height: 180,
  },
  ambientGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F5A623',
    opacity: 0.28,
    transform: [{ scale: 1.25 }],
  },
  logoCard: {
    width: 130,
    height: 130,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#F5A623',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 195, 50, 0.4)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
    maxWidth: 360,
  },
  errorText: {
    color: '#FF7B7B',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#202024',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    borderWidth: 1,
    borderColor: '#2A2A30',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#7E7E84',
    fontSize: 13,
    fontWeight: '400',
  },
  primaryButton: {
    backgroundColor: '#F5A623',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  separatorText: {
    color: '#7E7E84',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#F5A623',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotDescription: {
    color: '#9E9EA6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#F5A623',
    borderColor: '#F5A623',
    backgroundColor: '#16161A',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  resendCountdownText: {
    color: '#7E7E84',
    fontSize: 13,
  },
  resendActiveText: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
