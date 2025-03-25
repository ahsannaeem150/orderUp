import {router} from "expo-router";
import {useContext, useEffect, useState} from "react";
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView,
    Platform, Pressable
} from "react-native";
import {AuthContext} from "../../../context/authContext";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import colors from "../../../../constants/colors";
import {useItems} from "../../../context/ItemContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";

const ItemDetailsPage = () => {
    const {state, API_URL} = useContext(AuthContext);
    const {currentItem, updateItem} = useItems();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [stockAmount, setStockAmount] = useState("");
    const [showStockModal, setShowStockModal] = useState(false);

    useEffect(() => {
        if (currentItem) {
            setEditedItem({...currentItem});
        }
    }, [currentItem]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const changes = Object.entries(editedItem).reduce((acc, [key, value]) => {
                if (JSON.stringify(currentItem[key]) !== JSON.stringify(value)) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            if (Object.keys(changes).length === 0) {
                setIsEditing(false);
                return;
            }

            const response = await axios.patch(
                `${API_URL}/restaurant/${state.restaurant._id}/items/${currentItem._id}`,
                {operation: 'general', ...changes}
            );

            updateItem(response.data.item);
            setIsEditing(false);
        } catch (error) {
            Alert.alert("Update failed", error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled) {
                setLoading(true);
                const formData = new FormData();
                formData.append('operation', 'image');
                formData.append('image', {
                    uri: result.assets[0].uri,
                    name: 'image.jpg',
                    type: 'image/jpeg'
                });

                const response = await axios.patch(
                    `${API_URL}/restaurant/${state.restaurant._id}/items/${currentItem._id}`,
                    formData,
                    {headers: {'Content-Type': 'multipart/form-data'}}
                );

                updateItem(response.data.item);
            }
        } catch (error) {
            Alert.alert("Image update failed", error.response?.data?.message || "Couldn't upload image");
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (operationType) => {
        try {
            setLoading(true);
            const response = await axios.patch(
                `${API_URL}/restaurant/${state.restaurant._id}/items/${currentItem._id}`,
                {
                    operation: 'stock',
                    type: operationType,
                    amount: Number(stockAmount)
                }
            );

            updateItem(response.data.item);
            setShowStockModal(false);
            setStockAmount("");
        } catch (error) {
            Alert.alert("Stock update failed", error.response?.data?.message || "Invalid amount");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            setLoading(true);
            const response = await axios.patch(
                `${API_URL}/restaurant/${state.restaurant._id}/items/${currentItem._id}`,
                {operation: 'availability'}
            );
            updateItem(response.data.item);
        } catch (error) {
            Alert.alert("Update failed", error.response?.data?.message || "Couldn't toggle availability");
        } finally {
            setLoading(false);
        }
    };

    const renderField = (label, field, isNumeric = false, options) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {isEditing ? (
                options ? (
                    <View style={styles.optionsRow}>
                        {options.map(option => (
                            <Pressable
                                key={option}
                                style={[styles.optionButton, editedItem[field] === option && styles.selectedOption]}
                                onPress={() => setEditedItem(prev => ({...prev, [field]: option}))}>
                                <Text style={styles.optionText}>{option}</Text>
                            </Pressable>
                        ))}
                    </View>
                ) : field === 'expiryDate' ? (
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}>
                        <Text>{new Date(editedItem.expiryDate)?.toLocaleDateString() || 'Select date'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TextInput
                        style={styles.input}
                        value={String(editedItem[field] || '')}
                        onChangeText={text => setEditedItem(prev => ({
                            ...prev,
                            [field]: isNumeric ? Number(text) : text
                        }))}
                        keyboardType={isNumeric ? 'numeric' : 'default'}
                    />
                )
            ) : (
                <Text style={styles.fieldValue}>
                    {field === 'expiryDate'
                        ? new Date(editedItem.expiryDate)?.toLocaleDateString() || 'N/A'
                        : isNumeric && (field === 'price' || field === 'costPrice')
                            ? `Rs ${editedItem[field]}`
                            : editedItem[field]}
                </Text>
            )}
        </View>
    );

    if (!currentItem || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={100}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled">

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary}/>
                    </TouchableOpacity>

                    <Text style={styles.title} numberOfLines={1}>
                        {isEditing ? "Editing Item" : currentItem.name}
                    </Text>

                    <View style={styles.headerActions}>
                        {isEditing ? (
                            <>
                                <TouchableOpacity onPress={handleSave}>
                                    <MaterialCommunityIcons name="check" size={24} color={colors.success}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsEditing(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.error}/>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <MaterialCommunityIcons name="pencil" size={24} color={colors.primary}/>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Image Section */}
                    <TouchableOpacity
                        onPress={handleImageUpdate}
                        style={styles.imageContainer}
                        disabled={!isEditing}>
                        <Image
                            source={{uri: `${API_URL}/images/${currentItem.image}`}}
                            style={styles.itemImage}
                        />
                        {isEditing && (
                            <View style={styles.imageOverlay}>
                                <MaterialCommunityIcons name="pencil" size={28} color="white"/>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Basic Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <View style={styles.grid}>
                            {renderField("Item Name", "name")}
                            {renderField("Description", "description")}
                            {renderField("Price", "price", true)}
                            {renderField("Cost Price", "costPrice", true)}
                        </View>
                    </View>

                    {/* Inventory Management */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Inventory</Text>
                        <View style={styles.grid}>
                            {renderField("Current Stock", "stock", true)}
                            {renderField("Max Stock", "maxStock", true)}
                            {renderField("Min Stock", "minStock", true)}
                            {renderField("Unit", "unit", false, ["pieces", "kg", "liters", "packets"])}
                        </View>

                        <View style={styles.stockRow}>
                            <TouchableOpacity
                                style={styles.stockButton}
                                onPress={() => setShowStockModal(true)}>
                                <MaterialCommunityIcons name="package-variant" size={20} color="white"/>
                                <Text style={styles.buttonText}>Manage Stock</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.availabilityButton,
                                    {backgroundColor: currentItem.availability ? colors.success : colors.error}
                                ]}
                                onPress={toggleAvailability}>
                                <Text style={styles.buttonText}>
                                    {currentItem.availability ? 'Available' : 'Unavailable'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Product Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.grid}>
                            {renderField("Category", "category", false,
                                ["Appetizer", "Main Course", "Dessert", "Beverage", "Ingredient"])}
                            {renderField("Preparation Time", "preparationTime", true)}
                            {renderField("Weight", "weight", true)}
                            {renderField("Expiry Date", "expiryDate")}
                        </View>
                    </View>

                    {/* Supplier Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Supplier</Text>
                        <View style={styles.grid}>
                            {renderField("Supplier Name", "supplier.name")}
                            {renderField("Supplier Contact", "supplier.contact")}
                        </View>
                    </View>

                    {/* System Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>System Info</Text>
                        <View style={styles.systemInfo}>
                            <Text style={styles.infoText}>
                                Created: {new Date(currentItem.createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={styles.infoText}>
                                Last Updated: {new Date(currentItem.updatedAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    {/* Dietary Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dietary Tags</Text>
                        <View style={styles.optionsRow}>
                            {["Vegetarian", "Vegan", "Gluten-Free", "Spicy", "Seasonal"].map(tag => (
                                <Pressable
                                    key={tag}
                                    style={[styles.tagButton, editedItem.tags?.includes(tag) && styles.selectedTag]}
                                    onPress={() => {
                                        if (!isEditing) return;
                                        const newTags = editedItem.tags?.includes(tag)
                                            ? editedItem.tags.filter(t => t !== tag)
                                            : [...(editedItem.tags || []), tag];
                                        setEditedItem(prev => ({...prev, tags: newTags}));
                                    }}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={editedItem.expiryDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setEditedItem(prev => ({...prev, expiryDate: date}));
                        }}
                    />
                )}

                {/* Stock Management Modal */}
                <Modal visible={showStockModal} transparent animationType="slide">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Update Stock Level</Text>

                            <Text style={styles.modalSubtitle}>
                                Current Stock: {currentItem.stock}
                            </Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter new stock amount"
                                keyboardType="numeric"
                                value={stockAmount}
                                onChangeText={setStockAmount}
                            />

                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowStockModal(false)}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => handleStockUpdate('adjust')}>
                                    <Text style={styles.buttonText}>Update Stock</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: colors.borders,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginHorizontal: 16,
    },
    headerActions: {
        flexDirection: "row",
        gap: 16,
    },
    content: {
        padding: 16,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    itemImage: {
        width: '100%',
        height: 200,
        backgroundColor: colors.borders,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    fieldContainer: {
        width: '48%',
        minHeight: 70,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borders,
    },
    fieldLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    fieldValue: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: colors.textPrimary,
    },
    input: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: colors.primary,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
    },
    stockRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    stockButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    availabilityButton: {
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.borders,
    },
    selectedOption: {
        backgroundColor: colors.primary,
    },
    tagButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: colors.borders,
    },
    selectedTag: {
        backgroundColor: colors.success,
    },
    tagText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: 'white',
    },
    dateInput: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
    },
    systemInfo: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 16,
        gap: 8,
    },
    infoText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: colors.textSecondary,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 16,
        color: colors.textSecondary,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontFamily: 'Poppins-Regular',
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
});

export default ItemDetailsPage;