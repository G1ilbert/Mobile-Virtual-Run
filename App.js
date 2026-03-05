import React, { useState } from 'react';
import { View, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';
import HomeScreen from './HomeScreen';
import RunScreen from './RunScreen';
import RankScreen from './RankScreen';
import ProfileScreen from './ProfileScreen';
import NotificationScreen from './NotificationScreen';
import EventDetailScreen from './EventDetailScreen';
import SubmitScreen from './SubmitScreen'; // นำเข้า SubmitScreen
import { COLORS, getTheme } from './GlobalStyles';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [showNoti, setShowNoti] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getTheme(isDark);

  // ฟังก์ชันสลับหน้าหลัก
  const renderMainContent = () => {
    switch (activeTab) {
      case 'Home': return <HomeScreen isDark={isDark} onSelectEvent={(item) => setSelectedEvent(item)} />;
      case 'Run': return <RunScreen isDark={isDark} />;
      case 'Rank': return <RankScreen isDark={isDark} />;
      case 'Profile': return <ProfileScreen isDark={isDark} />;
      default: return <HomeScreen isDark={isDark} onSelectEvent={(item) => setSelectedEvent(item)} />;
    }
  };

  // --- ส่วนตรวจสอบเงื่อนไขหน้าจอที่ต้องแสดงเต็มหน้า (Full Screen Overlays) ---

  // 1. หน้าแสดงรายละเอียด Event
  if (selectedEvent) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <EventDetailScreen
          item={selectedEvent}
          isDark={isDark}
          onBack={() => setSelectedEvent(null)}
        />
      </SafeAreaProvider>
    );
  }

  // 2. หน้าแจ้งเตือน
  if (showNoti) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <NotificationScreen isDark={isDark} onBack={() => setShowNoti(false)} />
      </SafeAreaProvider>
    );
  }

  // 3. หน้าส่งผลวิ่ง (เรียกจากปุ่มบวกตรงกลาง)
  if (activeTab === 'Submit') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <SubmitScreen
          isDark={isDark}
          onBack={() => setActiveTab('Home')} // เมื่อกดกลับหรือส่งเสร็จ ให้กลับไปหน้า Home
        />
      </SafeAreaProvider>
    );
  }

  // --- หน้าจอหลักพร้อม Bottom Navigation ---
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <TopNavigation
          activeTab={activeTab}
          isDark={isDark}
          onPressNoti={() => setShowNoti(true)}
        />
        <View style={{ flex: 1 }}>
          {renderMainContent()}
        </View>
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
        />
      </View>
    </SafeAreaProvider>
  );
}