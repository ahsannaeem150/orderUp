import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { AntDesign, MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { AuthContext } from "../../context/authContext";
import colors from "../../../constants/colors";
import { useUploadImage } from "../../hooks/useUploadImage";
import { LinearGradient } from "expo-linear-gradient";

const Profile = () => {
  const { API_URL, state, setState } = useContext(AuthContext);
  const { uploadImage } = useUploadImage();
  const [viewingImage, setViewingImage] = useState(null);

  const logout = async () => {
    setTimeout(() => {
      setState({ restaurant: undefined, token: "" });
    }, 500);
    router.replace("../(auth)/sign-in");
  };

  const handleCoverPress = () => {
    Alert.alert("Cover Photo", "What would you like to do?", [
      {
        text: "View Photo",
        onPress: () => setViewingImage(state.restaurant?.thumbnail),
      },
      {
        text: "Update Photo",
        onPress: () =>
          uploadImage(`/restaurant/${state.restaurant._id}/profile/thumbnail`),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cover Photo Section */}
      <View style={styles.coverContainer}>
        <TouchableOpacity onPress={handleCoverPress}>
          <Image
            source={{
              uri: state.restaurant?.thumbnail
                ? `${API_URL}/images/${state.restaurant.thumbnail}`
                : "https://via.placeholder.com/400x200/cccccc/ffffff?text=Upload+Cover",
            }}
            style={styles.coverImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={styles.coverGradient}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Image Floating - MOVED OUTSIDE COVER CONTAINER */}
      <View style={styles.profileImageContainer}>
        <Image
          source={{
            uri: state.restaurant?.logo
              ? `${API_URL}/images/${state.restaurant.logo}`
              : "https://via.placeholder.com/120/cccccc/ffffff?text=Logo",
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.editBadge}
          onPress={() =>
            uploadImage(`/restaurant/${state.restaurant._id}/profile/logo`)
          }
        >
          <Feather name="edit-2" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Info Section */}
      <View style={styles.profileInfo}>
        <Text style={styles.name}>{state.restaurant?.name}</Text>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={16} color={colors.primary} />
          <Text style={styles.location}>
            {state.restaurant?.address?.address || "No address provided"}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.push("(profile)/[settings]/profile-edit-form")}
        >
          <Feather name="edit-3" size={18} color="white" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={logout}
        >
          <Feather name="log-out" size={18} color="white" />
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <InfoCard
          icon="mail"
          title="Email"
          value={state.restaurant?.email || "Not provided"}
        />
        <InfoCard
          icon="phone"
          title="Contact"
          value={state.restaurant?.phone || "Not provided"}
        />
        <InfoCard
          icon="map-pin"
          title="City"
          value={state.restaurant?.address.city || "Not specified"}
        />
        <InfoCard
          icon="map"
          title="Address"
          value={state.restaurant?.address?.address || "Not specified"}
        />
      </View>

      {/* Image Viewer Modal */}
      <Modal visible={!!viewingImage} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setViewingImage(null)}
          >
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: `${API_URL}/images/${viewingImage}` }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoCard = ({ icon, title, value }) => (
  <View style={styles.infoCard}>
    <View style={styles.cardIconContainer}>
      <Feather name={icon} size={20} color={colors.primary} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  coverContainer: {
    height: 200,
    backgroundColor: colors.backgroundSecondary,
    overflow: "visible", // Changed from 'hidden'
  },
  profileImageContainer: {
    position: "absolute",
    top: 140, // 200 (cover height) - 60 (half profile image height)
    alignSelf: "center",
    zIndex: 2,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  coverImage: {
    width: "100%",
    height: 200,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileInfo: {
    marginTop: 72,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 28,
    fontFamily: "Poppins-SemiBold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    marginLeft: 4,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  logoutButton: {
    backgroundColor: colors.errorText,
  },
  actionButtonText: {
    color: "white",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    width: "48%",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    backgroundColor: colors.backgroundSecondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Poppins-Medium",
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: "Poppins-Regular",
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 48,
    right: 24,
    zIndex: 1,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
});

export default Profile;
