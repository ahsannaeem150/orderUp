import {View, Text, TouchableOpacity, Alert, TextInput, StyleSheet, ActivityIndicator} from "react-native";
import React, {useState} from "react";
import {router} from "expo-router";
import axios from "axios";
import colors from "../../constants/colors";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async () => {
        try {
            setLoading(true);
            if (!username || !email || !password) {
                Alert.alert("Error", "Please fill in all fields");
                return;
            }

            const {data} = await axios.post("/auth/agent/register", {
                username,
                email,
                password,
                profilePicture: "66d1b047b588f463a39a8938",
            });

            if (data.success) {
                Alert.alert("Success", data.message);
                router.navigate("sign-in");
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Get started with your account</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        placeholderTextColor={colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.toggleText}>
                            {showPassword ? "Hide" : "Show"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textInverted}/>
                    ) : (
                        <Text style={styles.buttonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.navigate("sign-in")}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        paddingBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
        marginBottom: 32,
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
    toggleButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    toggleText: {
        color: colors.textSecondary,
        fontFamily: "Poppins-Medium",
        fontSize: 14,
    },
    button: {
        backgroundColor: colors.textPrimary,
        borderRadius: 8,
        padding: 18,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.textInverted,
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    footerText: {
        color: colors.textSecondary,
        fontFamily: "Poppins-Regular",
    },
    footerLink: {
        color: colors.accent,
        fontFamily: "Poppins-SemiBold",
    },
});

export default SignUp;