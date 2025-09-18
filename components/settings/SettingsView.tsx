import { Colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  theme: Colors;
}

const SettingRow = ({ title, description, children, theme }: SettingsRowProps) => (
  <View style={[styles.rowContainer, { borderBottomColor: theme.semiSoft }]}>
    <View style={styles.rowLeft}>
      <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.rowDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      )}
    </View>
    <View style={styles.rowRight}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  rowRight: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
});

export default SettingRow;
