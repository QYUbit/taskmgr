import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Button, View } from 'react-native';

export default function App() {
  useEffect(() => {
    // Anfrage um Berechtigungen (nur iOS zwingend nötig, Android erlaubt automatisch)
    Notifications.requestPermissionsAsync();

    // Notification-Handler (legt fest, wie Notifications angezeigt werden)
    Notifications.setNotificationChannelAsync('reminders', {
        name: 'Kalender-Erinnerungen',
        importance: Notifications.AndroidImportance.MAX, // 👈 Heads-Up
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }, []);

  async function scheduleReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Termin startet gleich!",
      body: "Meeting mit Anna um 15:00",
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10 },
  });
}

  return (
    <View style={{padding: 30}}>
        <Button title="Erinnerung testen" onPress={scheduleReminder} />
    </View>
  );
}
