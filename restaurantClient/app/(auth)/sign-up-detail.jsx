import {View, Text, TouchableOpacity, Alert, ScrollView, TextInput, StyleSheet, ActivityIndicator} from "react-native";
import React, {useContext, useState} from "react";
import {AuthContext} from "../context/authContext";
import {router} from "expo-router";
import axios from "axios";
import colors from "../../constants/colors";

const SignUpDetail = () => {
    const {state, setState} = useContext(AuthContext);
    const [name, setName] = useState(state.restaurant.name);
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (!name || !phone || !city || !address) {
                Alert.alert("Error", "Please fill in all required fields");
                return;
            }

            const {data} = await axios.post("/auth/register/restaurant", {
                name: state.restaurant.name,
                email: state.restaurant.email,
                password: state.restaurant.password,
                logo: "66d1b047b588f463a39a8938",
                thumbnail: "66d22427146a2944b59386ec",
                phone,
                city,
                address,
            });

            setState({restaurant: data.restaurant, token: null});
            router.push("sign-in");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Complete Registration</Text>
                    <Text style={styles.subtitle}>Final step to create your restaurant profile</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Restaurant Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter restaurant name"
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            placeholderTextColor={colors.textSecondary}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter city"
                            placeholderTextColor={colors.textSecondary}
                            value={city}
                            onChangeText={setCity}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Address</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Enter full address"
                            placeholderTextColor={colors.textSecondary}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textInverted}/>
                        ) : (
                            <Text style={styles.buttonText}>Complete Registration</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
        paddingVertical: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: colors.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: "Poppins-Medium",
        color: colors.textPrimary,
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
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: colors.textPrimary,
        borderRadius: 8,
        padding: 18,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.textInverted,
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
    },
});

export default SignUpDetail;