import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useContext, useState } from "react";
import { router } from "expo-router";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import colors from "../../../../constants/colors";
import { AuthContext } from "../../../context/authContext";
import { PermissionsAndroid } from "react-native";
import Geolocation from "react-native-geolocation-service";

const ProfileEditForm = () => {
  const { state, setState, updateState } = useContext(AuthContext);
  const [username, setUsername] = useState(state.agent?.username || "");
  const [phone, setPhone] = useState(state.agent?.phone || "");
  const [city, setCity] = useState(state.agent?.address?.city || "");
  const [address, setAddress] = useState(state.agent?.address?.address || "");
  const [location, setLocation] = useState(state.agent?.location || {});

  const getCurrentLocation = () => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Starting location permission request");
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message:
              "This app needs access to your location to update your profile.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        console.log("Permission result:", granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            (position) => {
              console.log("Position obtained:", position);
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                updatedAt: new Date(),
              });
              resolve(position);
            },
            (error) => {
              console.error("Location error:", error);
              reject(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          reject(new Error("Permission denied"));
        }
      } catch (err) {
        console.error("Location permission error:", err);
        reject(err);
      }
    });
  };

  const handleUpdate = async () => {
    try {
      if (!username.trim()) {
        Alert.alert("Username required", "Please enter your username");
        return;
      }

      console.warn("Starting location fetch");
      await getCurrentLocation();
      console.warn("Location fetch completed", location);

      const formData = {
        username,
        phone,
        address: { city, address },
        location,
      };

      console.warn("Submitting data:", formData);

      const { data } = await axios.put(
        `/agent/${state.agent._id}/profile/update`,
        formData
      );

      if (data.success) {
        setState({ ...state, agent: data.agent });
        updateState({ ...state, agent: data.agent });
        router.back();
      }
    } catch (error) {
      console.warn("Update error:", error);
      Alert.alert(
        "Update failed",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: colors.textPrimary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: colors.textInverted,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});

export default ProfileEditForm;
