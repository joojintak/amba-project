import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View, Pressable, StyleSheet } from 'react-native';

export default function App() {
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [goal, setGoal] = useState('피로 관리');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onAnalyze = async () => {
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(age),
          gender,
          height_cm: Number(height),
          weight_kg: Number(weight),
          activity_level: 'low',
          sleep_hours: 5,
          diet_type: 'balanced',
          smoking: false,
          drinking: false,
          conditions: ['고혈압'],
          medications: [],
          goal,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('백엔드 연결에 실패했습니다. PC에서 테스트 중이면 휴대폰 대신 에뮬레이터 또는 같은 네트워크 설정이 필요할 수 있습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AMBA 영양제 추천 앱</Text>
        <Text style={styles.subtitle}>모바일 데모 화면</Text>

        <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="나이" keyboardType="numeric" />
        <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="키(cm)" keyboardType="numeric" />
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="몸무게(kg)" keyboardType="numeric" />
        <TextInput style={styles.input} value={goal} onChangeText={setGoal} placeholder="건강 목표" />

        <Pressable style={styles.button} onPress={onAnalyze}>
          <Text style={styles.buttonText}>분석하기</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result && (
          <View style={styles.card}>
            <Text style={styles.resultTitle}>BMI {result.bmi} ({result.bmi_category})</Text>
            {result.recommendations.map((item) => (
              <View key={item.nutrient} style={styles.item}>
                <Text style={styles.nutrient}>{item.nutrient}</Text>
                <Text>{item.reason}</Text>
                <Text>식품 예시: {item.food_sources.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#d0d8e2' },
  button: { backgroundColor: '#2a6df4', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#c62828', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14 },
  resultTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  item: { marginBottom: 12 },
  nutrient: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
