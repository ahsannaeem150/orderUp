import React, {useContext, useEffect, useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import {router} from "expo-router";
import {AuthContext} from "../../context/authContext";
import {images} from "../../../constants";
import colors from "../../../constants/colors";
import UploadImageButton from "../../components/UploadImageButton";

const Index = () => {
    const {state, setState, updateState, API_URL} = useContext(AuthContext);

    const logout = async () => {
        setTimeout(() => {
            setState({agent: undefined, token: ""});
            updateState({agent: undefined, token: ""});
        }, 500);
        router.replace("../(auth)/sign-in");
    };

    console.log("Index lg state=>", state);
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={() => router.push('(profile)/[settings]/profile-edit-form')}
                    style={styles.settingsButton}
                >
                    <AntDesign name="setting" size={24} color={colors.textPrimary}/>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{
                            uri: state.agent?.profilePicture
                                ? `${API_URL}/images/${state.agent.profilePicture}`
                                : images.profilePlaceholder
                        }}
                        style={styles.profileImage}
                    />
                    <UploadImageButton style={styles.editBadge}/>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.name}>{state.agent?.username}</Text>
                    <Text style={styles.email}>{state.agent?.email}</Text>
                </View>

                <View style={styles.infoCards}>
                    <ProfileInfoCard
                        icon="user"
                        title="Username"
                        value={state.agent?.username}
                    />
                    <ProfileInfoCard
                        icon="mail"
                        title="Email"
                        value={state.agent?.email}
                    />
                    <ProfileInfoCard
                        icon="phone"
                        title="Phone"
                        value={state.agent?.phone || "Not provided"}
                    />
                    <ProfileInfoCard
                        icon="enviromento"
                        title="Location"
                        value={state.agent?.address?.city || "Not provided"}
                    />
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <AntDesign name="logout" size={18} color={colors.errorText}/>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ProfileInfoCard = ({icon, title, value}) => (
    <View style={styles.card}>
        <AntDesign name={icon} size={20} color={colors.textSecondary}/>
        <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    settingsButton: {
        padding: 8,
    },
    editBadge: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: colors.textPrimary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
    },
    content: {
        padding: 24,
        alignItems: "center",
    },
    profileImageContainer: {
        position: "relative",
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: colors.borders,
    },
    infoSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    name: {
        fontSize: 20,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
    },
    infoCards: {
        width: "100%",
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borders,
        backgroundColor: colors.background,
        gap: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
    },
    cardValue: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
        marginTop: 4,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 32,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: "Poppins-Medium",
        color: colors.errorText,
    },
});

export default Index;
