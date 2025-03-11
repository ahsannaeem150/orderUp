import React, {useContext, useEffect, useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {AuthContext} from "../context/authContext";
import {images} from "../../constants";
import EmailCard from "../components/ProfileInfoCard";
import axios from "axios";
import base64 from "react-native-base64";
import {Buffer} from "buffer";
import ProfileInfoCard from "../components/ProfileInfoCard";
import {useUploadImage} from "../hooks/useUploadImage";
import UploadImageButton from "../hooks/useUploadImage";
import useFetchImage from "../hooks/useFetchImage";
import {MaterialIcons} from "@expo/vector-icons";
import colors from "../../constants/colors";

const Profile = () => {
    const {state, setState} = useContext(AuthContext);
    const {uploadImage} = useUploadImage();
    const {imageUri: logoUri} = useFetchImage(
        `/restaurant/${state?.restaurant?._id}/profile/logo?logo=${state.restaurant.logo}`
    );
    const {imageUri: coverUri} = useFetchImage(
        `/restaurant/${state?.restaurant?._id}/profile/thumbnail?thumbnail=${state.restaurant.thumbnail}`
    );
    useEffect(() => {
        console.log("LOGO URI", logoUri);
    }, []);
    const logout = async () => {
        setTimeout(() => {
            setState({restaurant: undefined, token: ""});
        }, 1000);
        router.replace("/sign-in");
    };
    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, styles.activeTab]}
                >
                    <Text style={[styles.tabText, styles.activeTabText]}>
                        PROFILE
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.profileImageContainer}>
                <Image source={{uri: logoUri}} style={styles.profileImage}/>

                <UploadImageButton
                    routePath={`/restaurant/${state.restaurant._id}/profile/logo?logo=${state.restaurant.logo}`}
                    style={styles.uploadButton}
                >
                    <MaterialIcons name="add" size={20} color="black"/>
                </UploadImageButton>
            </View>
            <Text style={styles.name}>{`${state.restaurant?.name}`}</Text>
            <Text style={styles.email}>{state.restaurant?.email}</Text>
            <TouchableOpacity
                onPress={() => {
                    uploadImage(
                        `/restaurant/${state.restaurant._id}/profile/thumbnail?thumbnail=${state.restaurant.thumbnail}`
                    );
                }}
                style={styles.coverImage}
            >
                <View style={styles.coverImageContainer}>
                    {coverUri ? (
                        <Image
                            source={{uri: coverUri}}
                            resizeMode="contain"
                            style={styles.image}
                        />
                    ) : (
                        <Text style={styles.placeholderText}>Upload Cover</Text>
                    )}
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push("/profile-edit-form")}
                style={{alignSelf: "flex-end", marginBottom: 5, marginEnd: 5}}
            >
                <Text style={{fontFamily: "Poppins-SemiBold"}}>Edit Info</Text>
            </TouchableOpacity>
            <ProfileInfoCard
                icon={"user"}
                title="Name"
                titleValue={state.restaurant?.name}
            />
            <ProfileInfoCard
                icon={"mail"}
                title="Email"
                titleValue={state.restaurant?.email}
            />
            <ProfileInfoCard
                icon={"phone"}
                title="Phone"
                titleValue={state.restaurant?.phone}
            />
            <ProfileInfoCard
                icon={"infocirlceo"}
                title="Address"
                titleValue={state.restaurant?.address?.city}
            />
            <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: colors.background,
    },
    tabs: {
        flexDirection: "row",
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: colors.borders,
    },
    activeTab: {
        borderBottomColor: colors.accent,
    },
    tabText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontFamily: "Poppins-SemiBold",
    },
    profileImageContainer: {
        position: "relative",
        width: 100,
        height: 100,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
        resizeMode: "cover",
    },
    coverImage: {
        width: "90%",
        height: 150,
        borderWidth: 2,
        borderColor: "#d9d9d9",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
        backgroundColor: "#f0f0f0",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderText: {
        fontSize: 16,
        color: "#999",
    },
    uploadButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 20,
        button: {
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 20,
            backgroundColor: "blue",
        },
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: "gray",
        marginBottom: 10,
    },
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: colors.accent,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: "white",
        fontSize: 16,
    },
    coverImageContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
});
