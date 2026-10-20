import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Vibration,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface AdminPinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({
  visible,
  onClose,
  onSuccess,
}: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetPin, setTargetPin] = useState('2026');

  useEffect(() => {
    if (visible) {
      setPin('');
      setErrorMsg('');
      loadAdminPin();
    }
  }, [visible]);

  const loadAdminPin = async () => {
    try {
      const stored = await AsyncStorage.getItem('gucci_admin_pin');
      if (stored) {
        setTargetPin(stored);
      } else {
        setTargetPin('2026');
      }
    } catch {
      setTargetPin('2026');
    }
  };

  const handlePressDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const verifyPin = (codeToVerify?: string) => {
    const code = codeToVerify || pin;
    if (code.length === 0) return;

    // Check valid PINs: configured pin, or master fallbacks 2026, 1234
    if (code === targetPin || code === '2026' || code === '1234') {
      if (Platform.OS !== 'web') Vibration.vibrate(50);
      setAttempts(0);
      setPin('');
      onSuccess();
    } else {
      if (Platform.OS !== 'web') Vibration.vibrate([0, 80, 50, 80]);
      setPin('');
      setErrorMsg('Clave incorrecta. Inténtalo de nuevo.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Close button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={28} color="#FACC15" />
            </View>
            <Text style={styles.title}>Ingrese su contraseña</Text>
            <Text style={styles.subtitle}>Panel de Administración Gucci Games</Text>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isFilled && styles.dotFilled,
                  ]}
                />
              );
            })}
          </View>

          {/* Error Message */}
          <View style={styles.errorContainer}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Circular Keypad */}
          <View style={styles.keypad}>
            {/* Row 1 */}
            <View style={styles.row}>
              {['1', '2', '3'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keyBtn}
                  onPress={() => handlePressDigit(digit)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 2 */}
            <View style={styles.row}>
              {['4', '5', '6'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keyBtn}
                  onPress={() => handlePressDigit(digit)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 3 */}
            <View style={styles.row}>
              {['7', '8', '9'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keyBtn}
                  onPress={() => handlePressDigit(digit)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 4 */}
            <View style={styles.row}>
              <View style={styles.keyBtnPlaceholder} />

              <TouchableOpacity
                style={styles.keyBtn}
                onPress={() => handlePressDigit('0')}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keyBtn}
                onPress={handleDelete}
                activeOpacity={0.6}
              >
                <Ionicons name="backspace-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Enter Pill Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.enterButton, pin.length === 0 && styles.enterButtonDisabled]}
              onPress={() => verifyPin()}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.enterButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 10, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#181822',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(250, 204, 21, 0.4)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBtnPlaceholder: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSection: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FACC15',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  enterButtonDisabled: {
    opacity: 0.4,
  },
  enterButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
});
