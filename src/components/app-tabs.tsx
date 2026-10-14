import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#0B0B0E"
      indicatorColor="rgba(245, 166, 35, 0.22)"
      rippleColor="rgba(245, 166, 35, 0.15)"
      tintColor="#F5A623"
      iconColor={{
        default: '#71717A',
        selected: '#F5A623',
      }}
      labelStyle={{
        default: { color: '#71717A', fontWeight: '600' },
        selected: { color: '#F5A623', fontWeight: '800' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Tienda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Mi Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
