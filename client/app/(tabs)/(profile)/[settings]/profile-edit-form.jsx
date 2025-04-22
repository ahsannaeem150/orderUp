import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState } from "react";
import { router } from "expo-router";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import colors from "../../../../constants/colors";
import { AuthContext } from "../../../context/authContext";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileEditForm = () => {
  const { state, setState, updateState } = useContext(AuthContext);
  const [username, setUsername] = useState(state.user?.name || "");
  const [phone, setPhone] = useState(state.user?.phone || "");
  const [city, setCity] = useState(state.user?.address?.city || "");
  const [address, setAddress] = useState(state.user?.address?.address || "");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [currentLocation, setCurrentLocation] = useState(
    state.user?.location || null
  );

  const getCurrentLocation = async () => {
    try {
      setIsFetchingLocation(true);
      setLocationStatus("Locating...");

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("Location permission required");
        throw new Error("Permission to access location was denied");
      }

      let position = await Location.getCurrentPositionAsync({});
      const updatedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        updatedAt: new Date(),
      };

      setCurrentLocation(updatedLocation);
      setLocationStatus("Location captured");
      setTimeout(() => setLocationStatus(""), 2000);

      return updatedLocation;
    } catch (error) {
      setLocationStatus("Location capture failed");
      setTimeout(() => setLocationStatus(""), 2000);
      throw error;
    } finally {
      setIsFetchingLocation(false);
    }
  };
  const handleLocationPress = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {}
  };
  const handleUpdate = async () => {
    try {
      if (!username.trim()) {
        Alert.alert("Username required", "Please enter your username");
        return;
      }

      const formData = {
        username,
        phone,
        address: { city, address },
        location: currentLocation,
      };

      const { data } = await axios.put(
        `/user/${state.user._id}/profile/update`,
        formData
      );

      if (data.success) {
        setState({ ...state, user: data.user });
        updateState({ ...state, user: data.user });
        router.back();
      }
    } catch (error) {
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
      <View style={styles.formGroup}>
        <Text style={styles.label}>Location Coordinates</Text>
        <TouchableOpacity
          style={styles.locationInput}
          onPress={handleLocationPress}
        >
          {currentLocation ? (
            <Text style={styles.locationText}>
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              Tap to get current location
            </Text>
          )}
          {isFetchingLocation ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <MaterialIcons
              name="my-location"
              size={20}
              color={colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>

      {locationStatus && (
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              locationStatus.includes("failed") && styles.errorText,
            ]}
          >
            {locationStatus}
          </Text>
        </View>
      )}

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
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borders,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
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
  locationInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: 8,
    padding: 16,
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: colors.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
  },
  statusContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.errorText,
  },
});

export default ProfileEditForm;
