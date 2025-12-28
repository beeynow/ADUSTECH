import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { profileAPI, UserProfile } from '../../services/profileApi';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [level, setLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await profileAPI.getProfile();
    if (result.success && result.data.user) {
      const userData = result.data.user;
      setProfile(userData);
      setName(userData.name || '');
      setBio(userData.bio || '');
      setLevel(userData.level || '');
      setDepartment(userData.department || '');
      setFaculty(userData.faculty || '');
      setPhone(userData.phone || '');
      setGender(userData.gender || '');
      setAddress(userData.address || '');
      setCountry(userData.country || '');
      setProfileImage(userData.profileImage || '');
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Image);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    const result = await profileAPI.updateProfile({
      name,
      bio,
      level,
      department,
      faculty,
      phone,
      gender,
      address,
      country,
      profileImage,
    });
    setSaving(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      loadProfile();
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
        <ActivityIndicator size="large" color={isDark ? '#42A5F5' : '#1976D2'} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0A1929' : '#E6F4FE' }]}>
      <View style={styles.content}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={editing ? pickImage : undefined}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, isDark ? styles.placeholderDark : styles.placeholderLight]}>
                <Text style={styles.placeholderText}>
                  {name.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {editing && (
              <View style={[styles.editBadge, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}>
                <Text style={styles.editBadgeText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Email (Non-editable) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Email</Text>
          <View style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? '#1A2332' : '#F5F5F5' }]}>
            <Text style={[styles.disabledText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
              {profile?.email}
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Name *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Enter your name"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Bio</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={bio}
            onChangeText={setBio}
            editable={editing}
            placeholder="Tell us about yourself"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Level */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Level</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={level}
            onChangeText={setLevel}
            editable={editing}
            placeholder="e.g., 100, 200, 300"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Department */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Department</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={department}
            onChangeText={setDepartment}
            editable={editing}
            placeholder="e.g., Computer Science"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Faculty */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Faculty</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={faculty}
            onChangeText={setFaculty}
            editable={editing}
            placeholder="e.g., Science"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Phone</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            placeholder="+1234567890"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
            keyboardType="phone-pad"
          />
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Gender</Text>
          {editing ? (
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    { borderColor: isDark ? '#42A5F5' : '#1976D2' },
                    gender === g && { backgroundColor: isDark ? '#42A5F5' : '#1976D2' },
                  ]}
                  onPress={() => setGender(g as any)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      { color: gender === g ? '#FFFFFF' : isDark ? '#42A5F5' : '#1976D2' },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? '#1A2332' : '#F5F5F5' }]}>
              <Text style={[styles.disabledText, { color: isDark ? '#90CAF9' : '#546E7A' }]}>
                {gender || 'Not specified'}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Address</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={address}
            onChangeText={setAddress}
            editable={editing}
            placeholder="Your address"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Country */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#90CAF9' : '#546E7A' }]}>Country</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0A1929' },
              !editing && styles.disabledInput,
            ]}
            value={country}
            onChangeText={setCountry}
            editable={editing}
            placeholder="Your country"
            placeholderTextColor={isDark ? '#90CAF9' : '#546E7A'}
          />
        </View>

        {/* Action Buttons */}
        {editing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: isDark ? '#EF4444' : '#DC2626' }]}
              onPress={() => {
                setEditing(false);
                loadProfile();
              }}
              disabled={saving}
            >
              <Text style={[styles.cancelButtonText, { color: isDark ? '#EF4444' : '#DC2626' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            {/* Change Password */}
            <TouchableOpacity
              style={[styles.button, styles.editButton, { backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD' }]}
              onPress={() => router.push('/change-password')}
            >
              <Text style={[styles.editButtonText, { color: isDark ? '#FFFFFF' : '#1976D2' }]}>Change Password</Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.button, styles.logoutButton, { backgroundColor: isDark ? '#DC2626' : '#EF4444' }]}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: async () => {
                        await logout();
                        router.replace('/login');
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLight: {
    backgroundColor: '#1976D2',
  },
  placeholderDark: {
    backgroundColor: '#42A5F5',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editBadgeText: {
    fontSize: 18,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.7,
  },
  disabledText: {
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: '100%',
    marginTop: 24,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
