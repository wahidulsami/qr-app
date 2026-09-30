import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AppProvider, useApp } from '@/context/app-context';
import { ToastProvider } from '@/context/toast-context';
import { AppDock } from '@/components/navigation/app-dock';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootTabsLayout() {
  const { activeTheme, isReady } = useApp();

  React.useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  return (
    <>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        tabBar={(props) => <AppDock {...(props as any)} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
          }}
        />
        <Tabs.Screen
          name="generate"
          options={{
            title: 'Generate',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        {/* Hide deprecated explore screen from tab bar if still present in dir */}
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <ToastProvider>
        <RootTabsLayout />
      </ToastProvider>
    </AppProvider>
  );
}
