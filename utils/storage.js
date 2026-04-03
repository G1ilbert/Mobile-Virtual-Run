import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'firebase_id_token';
const USER_KEY = 'user_data';

export async function saveToken(token) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to save token:', e);
  }
}

export async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to get token:', e);
    return null;
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('Failed to clear token:', e);
  }
}

export async function saveUserData(data) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save user data:', e);
  }
}

export async function getUserData() {
  try {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.warn('Failed to get user data:', e);
    return null;
  }
}
