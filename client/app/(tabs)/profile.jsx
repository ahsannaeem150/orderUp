import React, {useContext, useEffect, useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {AuthContext} from "../context/authContext";
import {images} from "../../constants";
import EmailCard from "../components/ProfileInfoCard";
import UploadImageButton from "../components/UploadImageButton";
import axios from "axios";
import base64 from "react-native-base64";
import {Buffer} from "buffer";
import ProfileInfoCard from "../components/ProfileInfoCard";
import colors from "../../constants/colors";

const Profile = () => {
    const {state, setState, updateState, API_URL} = useContext(AuthContext);
    const [imageUri, setImageUri] = useState(null);

    const logout = async () => {
        setTimeout(() => {
            setState({user: undefined, token: ""});
            updateState({user: undefined, token: ""});
        }, 500);
        router.replace("../(auth)/sign-in");
    };

    console.log("Profile lg state=>", state);
    useEffect(() => {
        const getProfilePicture = async () => {
            console.log("REQUEST INITITATED");
            try {
                const profilePicture = await axios.get(
                    `/${state.user?._id}/profile/image`,
                    {
                        params: {
                            profilePicture: state.user?.profilePicture,
                        },
                        responseType: "arraybuffer",
                    }
                );

                if (profilePicture) {
                    const base64Data = Buffer.from(
                        profilePicture.data,
                        "binary"
                    ).toString("base64");

                    const mimeType = profilePicture.headers["content-type"];
                    setImageUri(`data:${mimeType};base64,${base64Data}`);
                    console.log("PROFILE PICTURE RECEIVED :");
                }
            } catch (error) {
                console.log(
                    "Image Fetching Error",
                    error.response?.data?.message || error
                );
            }
        };
        getProfilePicture();
    }, []);
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
            <View style={{
                flex: 1,
                alignItems: "center",
                marginTop: 50,
                padding: 16,
                marginBottom: 50,
                backgroundColor: colors.background,
            }}>

                <View style={styles.profileImageContainer}>
                    <Image source={{uri: imageUri}} style={styles.profileImage}/>
                    <UploadImageButton style={styles.uploadButton}/>
                </View>
                <Text style={styles.name}>{`${state.user?.name}`}</Text>
                <Text style={styles.email}>{state.user?.email}</Text>
                <TouchableOpacity
                    onPress={() => router.push("/profile-edit-form")}
                    style={{alignSelf: "flex-end", marginBottom: 5, marginEnd: 5}}
                >
                    <Text style={{fontFamily: "Poppins-SemiBold"}}>Edit Info</Text>
                </TouchableOpacity>
                <ProfileInfoCard
                    icon={"user"}
                    title="Username"
                    titleValue={state.user?.name}
                />
                <ProfileInfoCard
                    icon={"mail"}
                    title="Email"
                    titleValue={state.user?.email}
                />
                <ProfileInfoCard
                    icon={"phone"}
                    title="Phone"
                    titleValue={state.user?.phone}
                />
                <ProfileInfoCard
                    icon={"infocirlceo"}
                    title="Address"
                    titleValue={state.user?.address?.city}
                />
                <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        marginBottom: 50,
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    uploadButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: "gray",
        marginBottom: 30,
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
});
