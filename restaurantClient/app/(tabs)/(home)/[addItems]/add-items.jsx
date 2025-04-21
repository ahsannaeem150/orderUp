import {View, Text, Alert, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput} from "react-native";
import React, {useState, useContext} from "react";
import axios from "axios";
import {Picker} from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {AuthContext} from "../../../context/authContext";
import {router} from "expo-router";
import {useUploadImage} from "../../../hooks/useSeparateUploadImage";
import colors from "../../../../constants/colors";

const AddItemDetail = () => {
    const {state} = useContext(AuthContext);
    const [newTag, setNewTag] = useState('');
    const [customTags, setCustomTags] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        costPrice: "",
        stock: "",
        maxStock: "",
        minStock: "",
        category: "Fast Food",
        tags: [],
        supplierName: "",
        supplierContact: "",
        expiryDate: new Date(),
        preparationTime: "",
        unit: "pieces",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const {selectImage, selectedImage} = useUploadImage();

    const handleAddItem = async () => {
        try {
            const requiredFields = [
                'name', 'price', 'costPrice', 'stock',
                'maxStock', 'minStock', 'preparationTime'
            ];

            const missingFields = requiredFields.filter(field => !formData[field]);
            if (missingFields.length > 0) {
                return Alert.alert("Missing fields", `Please fill in: ${missingFields.join(', ')}`);
            }

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                costPrice: parseFloat(formData.costPrice),
                stock: parseInt(formData.stock),
                maxStock: parseInt(formData.maxStock),
                minStock: parseInt(formData.minStock),
                preparationTime: parseInt(formData.preparationTime),

                tags: JSON.stringify(formData.tags),
                expiryDate: formData.expiryDate.toISOString(),
                availability: true
            };

            const formPayload = new FormData();

            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formPayload.append(key, value);
                }
            });

            if (selectedImage) {
                formPayload.append('image', {
                    uri: selectedImage.uri,
                    name: 'image.jpg',
                    type: 'image/jpeg'
                });
            }

            await axios.post(
                `/restaurant/${state.restaurant._id}/menuitems`,
                formPayload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                }
            );

            router.replace("/home");
            Alert.alert("Item added successfully!");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to add item");
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Add New Menu Item</Text>

            {/* Basic Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <Input
                    label="Item Name"
                    value={formData.name}
                    onChangeText={v => updateField('name', v)}
                />
                <Input
                    label="Description"
                    value={formData.description}
                    onChangeText={v => updateField('description', v)}
                    multiline
                />
            </View>

            {/* Pricing Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Price (Rs)"
                            value={formData.price}
                            onChangeText={v => updateField('price', v)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Cost Price (Rs)"
                            value={formData.costPrice}
                            onChangeText={v => updateField('costPrice', v)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preparation & Timing</Text>
                <Input
                    label="Preparation Time (minutes)"
                    value={formData.preparationTime}
                    onChangeText={v => updateField('preparationTime', v)}
                    keyboardType="numeric"
                    maxLength={3}
                />
            </View>
            {/* Inventory Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inventory</Text>
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Current Stock"
                            value={formData.stock}
                            onChangeText={v => updateField('stock', v)}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Max Stock"
                            value={formData.maxStock}
                            onChangeText={v => updateField('maxStock', v)}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Min Stock"
                            value={formData.minStock}
                            onChangeText={v => updateField('minStock', v)}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                    <View style={[styles.halfWidth, styles.pickerContainer]}>
                        <Text style={styles.label}>Unit</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.unit}
                                onValueChange={v => updateField('unit', v)}>
                                {["pieces", "kg", "liters", "packets"].map(unit => (
                                    <Picker.Item key={unit} label={unit} value={unit}/>
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>
            </View>


            {/* Categorization Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categorization</Text>
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Category</Text>
                        <Picker
                            selectedValue={formData.category}
                            onValueChange={v => updateField('category', v)}>
                            {["Fast Food", "Desi", "Chinese & Asian", "Healthy & Diet Food", "Bakery & Desserts", "Beverages", "Street Food"].map(cat => (
                                <Picker.Item key={cat} label={cat} value={cat}/>
                            ))}
                        </Picker>
                    </View>
                </View>

                <Text style={styles.label}>Dietary Tags</Text>

                {/* Custom Tag Input */}
                <View style={styles.customTagContainer}>
                    <TextInput
                        style={styles.customTagInput}
                        placeholder="Enter custom tag"
                        value={newTag}
                        onChangeText={setNewTag}
                        placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity
                        style={styles.addTagButton}
                        onPress={() => {
                            if (newTag.trim()) {
                                const trimmedTag = newTag.trim();
                                if (![...customTags, ...["Vegetarian", "Vegan", "Gluten-Free", "Spicy", "Seasonal"]].includes(trimmedTag)) {
                                    setCustomTags([...customTags, trimmedTag]);
                                }
                                setNewTag('');
                            }
                        }}>
                        <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Tags Display */}
                <View style={styles.tagContainer}>
                    {["Vegetarian", "Vegan", "Gluten-Free", "Spicy", "Seasonal"]
                        .concat(customTags)
                        .map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tagButton,
                                    formData.tags.includes(tag) && styles.selectedTag
                                ]}
                                onPress={() => toggleTag(tag)}>
                                <Text style={[
                                    styles.tagText,
                                    formData.tags.includes(tag) && styles.selectedTagText
                                ]}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                </View>
            </View>

            {/* Supplier & Expiry */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Supplier Information</Text>
                <Input
                    label="Supplier Name"
                    value={formData.supplierName}
                    onChangeText={v => updateField('supplierName', v)}
                />
                <Input
                    label="Supplier Contact"
                    value={formData.supplierContact}
                    onChangeText={v => updateField('supplierContact', v)}
                    keyboardType="phone-pad"
                />

                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>
                        Expiry Date: {formData.expiryDate.toDateString()}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={formData.expiryDate}
                        mode="date"
                        display="default"
                        onChange={(_, date) => {
                            setShowDatePicker(false);
                            date && updateField('expiryDate', date);
                        }}
                    />
                )}
            </View>

            {/* Image Upload */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Media</Text>
                <TouchableOpacity
                    style={styles.imageUpload}
                    onPress={selectImage}>
                    {selectedImage ? (
                        <Image
                            source={{uri: selectedImage.uri}}
                            style={styles.imagePreview}
                        />
                    ) : (
                        <Text style={styles.uploadText}>Tap to upload image</Text>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddItem}>
                <Text style={styles.submitText}>Add Menu Item</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const Input = ({label, value, onChangeText, style, ...props}) => (
    <View style={[styles.inputGroup, style]}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, props.multiline && styles.multilineInput]}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={colors.textSecondary}
            {...props}
        />
    </View>
);


const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: colors.background,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        overflow: 'hidden',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
    },
    halfWidth: {
        flex: 1,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    header: {
        fontSize: 24,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginBottom: 24,
    },
    customTagContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    customTagInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 12,
        fontFamily: 'Poppins-Regular',
        color: colors.textPrimary,
    },
    addTagButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTagButtonText: {
        color: colors.textInverted,
        fontFamily: 'Poppins-Medium',
    },
    section: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 12,
    },

    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },

    tagContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagButton: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    selectedTag: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tagText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: colors.textSecondary,
    },
    selectedTagText: {
        color: colors.textInverted,
    },
    imageUpload: {
        height: 150,
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    uploadText: {
        fontFamily: "Poppins-Medium",
        color: colors.textSecondary,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 18,
        alignItems: "center",
        marginVertical: 24,
    },
    submitText: {
        color: colors.textInverted,
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
    },
    dateText: {
        fontFamily: "Poppins-Regular",
        color: colors.textPrimary,
    },
});

export default AddItemDetail;