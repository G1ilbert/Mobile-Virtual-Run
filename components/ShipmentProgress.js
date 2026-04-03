import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/GlobalStyles';

const STAGES = ['preparing', 'print_label', 'ready_to_ship', 'shipped', 'delivered'];
const STAGE_LABELS = ['Preparing', 'Label', 'Ready', 'Shipped', 'Delivered'];

export default function ShipmentProgress({ status, theme }) {
  const currentIdx = STAGES.indexOf(status);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {STAGES.map((stage, i) => {
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <React.Fragment key={stage}>
              {i > 0 && (
                <View style={[styles.line, { backgroundColor: i <= currentIdx ? COLORS.PRIMARY_YELLOW : theme.border }]} />
              )}
              <View style={styles.stageCol}>
                <View style={[
                  styles.dot,
                  {
                    backgroundColor: isCompleted ? COLORS.PRIMARY_YELLOW : 'transparent',
                    borderColor: isCompleted ? COLORS.PRIMARY_YELLOW : theme.border,
                  },
                  isCurrent && styles.dotCurrent,
                ]} />
                <Text style={[
                  styles.label,
                  { color: isCompleted ? COLORS.PRIMARY_YELLOW : COLORS.GRAY_400 },
                  isCurrent && { fontWeight: '700' },
                ]}>
                  {STAGE_LABELS[i]}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  line: { height: 2, flex: 1, marginTop: 9, borderRadius: 1 },
  stageCol: { alignItems: 'center', width: 52 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, marginBottom: 6 },
  dotCurrent: { width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  label: { fontSize: 9, textAlign: 'center' },
});
