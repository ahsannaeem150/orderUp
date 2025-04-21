import {router} from "expo-router";
import {useContext, useEffect, useState, useCallback} from "react";
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, TextInput, KeyboardAvoidingView,
    Platform, Pressable, FlatList, Animated, Modal, TouchableWithoutFeedback
} from "react-native";
import {AuthContext} from "../../../context/authContext";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import colors from "../../../../constants/colors";
import {useItems} from "../../../context/ItemContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import StarRating from "react-native-star-rating-widget";
import {useFetchReviews} from "../../../hooks/useFetchItemReviews";
import dayjs from "dayjs";
import { Keyboard } from "react-native";


const EditableField = ({
                           label,
                           field,
                           numeric = true,
                           options,
                           date,
                           isEditing,
                           editedItem,
                           setEditedItem,
                           currentItem,
                           handleRemoveTag,
                           setIsTagModalVisible,
                           setDatePickerField,
                           setShowDatePicker
                       }) => {
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    };

    const currentValue = field.includes('.')
        ? getNestedValue(editedItem, field)
        : editedItem[field];

    const isName = field === 'name';
    const isDescription = field === 'description';

    const handleTextChange = (text) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditedItem(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: numeric ? Number(text) || 0 : text
                }
            }));
        } else {
            setEditedItem(prev => ({
                ...prev,
                [field]: numeric ? Number(text) || 0 : text
            }));
        }
    };

    return (
        <View style={[styles.fieldContainer, isDescription && styles.descriptionContainer, isName && styles.nameContainer]}>
            <Text style={styles.fieldLabel}>{label}</Text>

            {isEditing ? (
                field === 'tags' ? (
                    <Pressable
                        style={styles.tagsInput}
                        onPress={() => setIsTagModalVisible(true)}
                    >
                        {editedItem.tags?.length > 0 ? (
                            <View style={styles.tagContainer}>
                                {editedItem.tags.map(tag => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={14}
                                            color={colors.textSecondary}
                                            onPress={() => handleRemoveTag(tag)}
                                        />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.placeholderText}>Add tags...</Text>
                        )}
                    </Pressable>
                ) : options ? (
                    <View style={styles.optionsRow}>
                        {options.map(option => (
                            <Pressable
                                key={option}
                                style={[
                                    styles.optionButton,
                                    currentValue === option && styles.selectedOption
                                ]}
                                onPress={() => handleTextChange(option)}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                            </Pressable>
                        ))}
                    </View>
                ) : date ? (
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => {
                            setDatePickerField(field);
                            setShowDatePicker(true);
                        }}
                    >
                        <Text>
                            {currentValue ? dayjs(currentValue).format('MMM D, YYYY') : 'Select date'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TextInput
                        style={[styles.input, isDescription && styles.descriptionInput]}
                        value={String(currentValue || '')}
                        onChangeText={handleTextChange}
                        keyboardType={numeric ? 'numeric' : 'default'}
                        autoCapitalize="none"
                        multiline={isDescription}
                        numberOfLines={isDescription ? 4 : 1}
                        textAlignVertical={isDescription ? 'top' : 'center'}
                    />
                )
            ) : field === 'tags' ? (
                <View style={styles.tagContainer}>
                    {currentItem.tags?.map(tag => (
                        <View key={tag} style={[styles.tag, styles.viewTag]}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={[styles.fieldValue, isDescription && styles.descriptionText]}>
                    {date ?
                        (editedItem[field] ? dayjs(editedItem[field]).format('MMM D, YYYY') : 'N/A') :
                        numeric && field.toLowerCase().includes('price') ?
                            `Rs ${editedItem[field]}` :
                            field.includes('.') ?
                                (() => {
                                    const [parent, child] = field.split('.');
                                    return editedItem[parent]?.[child] || 'N/A';
                                })() :
                                editedItem[field] || 'N/A'}
                </Text>
            )}
        </View>
    );
};
const ItemDetailsPage = () => {
    const {state, API_URL} = useContext(AuthContext);
    const {currentItem, updateItem} = useItems();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({...currentItem});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const {reviews, fetchReviews, reviewsLoading} = useFetchReviews(currentItem?._id);
    const [averageRating, setAverageRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [datePickerField, setDatePickerField] = useState(null);
    const [isTagModalVisible, setIsTagModalVisible] = useState(false);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (currentItem) setEditedItem({...currentItem});
        if (currentItem?._id) fetchReviews();
    }, [currentItem]);


    useEffect(() => {
        if (reviews?.length > 0) {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            setAverageRating(Math.round((total / reviews.length) * 2) / 2);
        }
    }, [reviews]);

    const stockPercentage = useCallback(() => {
        if (!currentItem?.maxStock) return 0;
        return Math.min((currentItem.stock / currentItem.maxStock) * 100, 100);
    }, [currentItem]);

    const TagModal = () => (
        <Modal
            visible={isTagModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsTagModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setIsTagModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Manage Tags</Text>
                            <TextInput
                                style={styles.tagInput}
                                placeholder="Enter new tag"
                                value={newTag}
                                onChangeText={setNewTag}
                                onSubmitEditing={handleAddTag}
                                autoFocus
                            />
                            <View style={styles.modalTagContainer}>
                                {editedItem.tags?.map(tag => (
                                    <View key={tag} style={styles.modalTag}>
                                        <Text style={styles.modalTagText}>{tag}</Text>
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={16}
                                            color={colors.error}
                                            onPress={() => handleRemoveTag(tag)}
                                        />
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsTagModalVisible(false)}
                            >
                                <Text style={styles.modalCloseText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const getStatusColor = () => {
        switch(currentItem?.status) {
            case 'available': return colors.success;
            case 'out-of-stock': return colors.warning;
            case 'discontinued': return colors.error;
            default: return colors.textSecondary;
        }
    };


    const handleSave = async () => {
        try {
            setLoading(true);
            const changes = Object.entries(editedItem).reduce((acc, [key, value]) => {
                if (JSON.stringify(currentItem[key]) !== JSON.stringify(value)) acc[key] = value;
                return acc;
            }, {});

            if (Object.keys(changes).length === 0) return setIsEditing(false);

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

    const renderReview = ({item}) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image
                    source={{uri: `${API_URL}/images/${item.userId.profilePicture}`}}
                    style={styles.avatar}
                />
                <View style={styles.reviewUser}>
                    <Text style={styles.reviewName}>{item.userId.name}</Text>
                    <StarRating
                        rating={Math.round(item.rating)}
                        starSize={16}
                        color={colors.primary}
                        enableHalfStar
                        emptyColor={colors.borders}
                    />
                </View>
                <Text style={styles.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
        </View>
    );

    const StockProgressBar = () => (
        <View style={styles.stockContainer}>
            <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>Stock Level</Text>
                <Text style={styles.percentage}>{Math.round(stockPercentage())}%</Text>
            </View>
            <View style={styles.progressContainer}>
                <Animated.View style={[
                    styles.progressBar,
                    {
                        width: `${stockPercentage()}%`,
                        backgroundColor: currentItem?.stock < currentItem?.minStock ? colors.error :
                            currentItem?.stock < (currentItem?.maxStock / 2) ? colors.highlight : colors.success
                    }
                ]}/>
            </View>
            <Text style={styles.stockText}>
                {currentItem.stock} / {currentItem.maxStock} {currentItem.unit}
            </Text>
        </View>
    );
    const handleAddTag = () => {
        if (newTag.trim() && !editedItem.tags?.includes(newTag.trim())) {
            setEditedItem(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
        }
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setEditedItem(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove)
        }));
    };


    const SalesSummary = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sales Performance</Text>
            <View style={styles.grid}>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Total Sold</Text>
                    <Text style={styles.fieldValue}>{currentItem.totalSold}</Text>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Last Sold</Text>
                    <Text style={styles.fieldValue}>
                        {currentItem.lastSoldDate ? dayjs(currentItem.lastSoldDate).format('MMM D') : 'Never'}
                    </Text>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Popularity Score</Text>
                    <Text style={styles.fieldValue}>{currentItem.popularityScore}</Text>
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Profit Margin</Text>
                    <Text style={styles.fieldValue}>{Math.round(currentItem.profitMargin)}%</Text>
                </View>
            </View>
        </View>
    );

    const DiscountDisplay = () => {
        const hasActiveDiscount = currentItem.discount > 0 &&
            new Date() < new Date(currentItem.discountEnd);

        if (!hasActiveDiscount) return null;

        return (
            <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                    {currentItem.discount}% OFF until {dayjs(currentItem.discountEnd).format('MMM D')}
                </Text>
            </View>
        );
    };

    if (!currentItem || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </View>
        );
    }
    {isEditing && (
        <View style={styles.imageOverlay}>
            <MaterialCommunityIcons name="pencil" size={28} color="white" />
        </View>
    )}
    const visibleReviews = showAllReviews ? reviews : reviews?.slice(0, 3);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={90}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                automaticallyAdjustKeyboardInsets={true}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary}/>
                    </TouchableOpacity>

                    <Text style={styles.title} numberOfLines={1}>
                        {isEditing ? "Editing Item" : currentItem.name}
                    </Text>

                    <View style={styles.headerActions}>
                        {!isEditing && (
                            <>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <MaterialCommunityIcons name="pencil" size={24} color={colors.primary}/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>{}}>
                                    <MaterialCommunityIcons name="delete" size={24} color={colors.error}/>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Image Section */}
                    <TouchableOpacity onPress={handleImageUpdate} style={styles.imageContainer}>
                        <Image
                            source={{uri: `${API_URL}/images/${currentItem.image}`}}
                            style={styles.itemImage}
                        />
                        <DiscountDisplay />
                        {isEditing && (
                            <View style={styles.imageOverlay}>
                                <MaterialCommunityIcons name="pencil" size={28} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Stock Progress Bar */}
                    <StockProgressBar/>

                    <SalesSummary />


                    {/* Basic Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <View style={styles.grid}>
                            <View style={{width: '100%'}}>

                            <EditableField label="Item Name" field="name" numeric={false} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag}
                                           currentItem/>
                            </View>

                            <View style={{width: '100%'}}>
                                <EditableField label="Description" field="description" numeric={false} isEditing={isEditing}
                                               editedItem={editedItem}
                                               setEditedItem={setEditedItem}
                                               handleRemoveTag={handleRemoveTag} currentItem/>
                            </View>

                            <EditableField label="Price" field="price" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Cost Price" field="costPrice" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Category" field="category"
                                           options={["Fast Food", "Desi", "Chinese & Asian", "Healthy & Diet Food",
                                               "Bakery & Desserts", "Beverages", "Street Food"]} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Tags" field="tags" numeric={false} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           setIsTagModalVisible={setIsTagModalVisible}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                        </View>
                    </View>


                    {/* Inventory Management */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Inventory Management</Text>
                        <View style={styles.grid}>
                            <EditableField label="Current Stock" field="stock" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Max Stock" field="maxStock" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Min Stock" field="minStock" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Unit" field="unit"
                                           options={["pieces", "kg", "liters", "packets"]} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Expiry Date" field="expiryDate" date isEditing={isEditing}
                                           editedItem={editedItem}
                                           setDatePickerField={setDatePickerField}
                                           setShowDatePicker={setShowDatePicker}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Last Restocked" field="lastRestocked" date isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           setDatePickerField={setDatePickerField}
                                           setShowDatePicker={setShowDatePicker}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                        </View>
                    </View>

                    {/* Product Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <View style={styles.grid}>
                            <EditableField label="Preparation Time" field="preparationTime" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Expiry Date" field="expiryDate" date isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           setDatePickerField={setDatePickerField}
                                           setShowDatePicker={setShowDatePicker}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Discount Settings</Text>
                        <View style={styles.grid}>
                            <EditableField label="Discount %" field="discount" isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Discount Start" field="discountStart" date isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           setDatePickerField={setDatePickerField}
                                           setShowDatePicker={setShowDatePicker}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Discount End" field="discountEnd" date isEditing={isEditing}
                                           editedItem={editedItem}
                                           setDatePickerField={setDatePickerField}
                                           setShowDatePicker={setShowDatePicker}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Supplier Details</Text>
                        <View style={styles.grid}>
                            <EditableField label="Supplier Name" field="supplier.name" numeric={false} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                            <EditableField label="Supplier Contact" field="supplier.contact" numeric={false} isEditing={isEditing}
                                           editedItem={editedItem}
                                           setEditedItem={setEditedItem}
                                           handleRemoveTag={handleRemoveTag} currentItem/>
                        </View>
                    </View>

                    {/* Updated Status Toggle */}
                    <TouchableOpacity
                        style={[styles.statusButton, {backgroundColor: getStatusColor()}]}
                        onPress={() => {
                            const statusOrder = ['available', 'out-of-stock', 'discontinued'];
                            const currentIndex = statusOrder.indexOf(currentItem.status);
                            const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                            setEditedItem(prev => ({...prev, status: nextStatus}));
                        }}>
                        <Text style={styles.buttonText}>{currentItem.status.toUpperCase()}</Text>
                    </TouchableOpacity>


                    {/* System Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>System Information</Text>
                        <View style={styles.systemInfo}>
                            <DetailRow label="Created" value={new Date(currentItem.createdAt).toLocaleDateString()}/>
                            <DetailRow label="Last Updated"
                                       value={new Date(currentItem.updatedAt).toLocaleDateString()}/>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowAllReviews(!showAllReviews)}>
                            <Text style={styles.sectionTitle}>
                                Customer Reviews ({reviews?.length || 0})
                            </Text>
                            <View style={styles.ratingContainer}>
                                {reviews?.length > 0 && (
                                    <>
                                        <Text style={styles.ratingText}>{averageRating}</Text>
                                        <MaterialCommunityIcons
                                            name="star"
                                            size={16}
                                            color={colors.warningBg}
                                        />
                                    </>
                                )}
                                <MaterialCommunityIcons
                                    name={showAllReviews ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color={colors.textSecondary}
                                />
                            </View>
                        </TouchableOpacity>

                        {reviewsLoading ? (
                            <ActivityIndicator size="small" color={colors.primary}/>
                        ) : reviews?.length > 0 ? (
                            <>
                                <FlatList
                                    data={visibleReviews}
                                    renderItem={renderReview}
                                    keyExtractor={item => item._id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.reviewsContainer}
                                />
                                {reviews.length > 3 && (
                                    <TouchableOpacity
                                        style={styles.showMoreButton}
                                        onPress={() => setShowAllReviews(!showAllReviews)}>
                                        <Text style={styles.showMoreText}>
                                            {showAllReviews ? "Show Less" : "Show All Reviews"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No reviews yet</Text>
                        )}
                    </View>
                </View>
                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(editedItem[datePickerField]) || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setEditedItem(prev => ({
                                ...prev,
                                [datePickerField]: date
                            }));
                        }}
                    />
                )}
                </ScrollView>
            {isEditing && (
                <View style={styles.floatingActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSave}
                    >
                        <MaterialCommunityIcons name="check" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => setIsEditing(false)}
                    >
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const DetailRow = ({label, value}) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        paddingBottom: 20,
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
    nameContainer:{width:"100%"},
    title: {
        flex: 1,
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        color: colors.textPrimary,
        marginHorizontal: 16,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
    },
    dateInput: {
        paddingVertical: 8,
    },

    modalTagText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: colors.textPrimary,
    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        marginBottom: 15,
        color: colors.textPrimary,
    },
    floatingActions: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    saveButton: {
        backgroundColor: colors.success,
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
    tagInput: {
        borderBottomWidth: 1,
        borderColor: colors.borders,
        paddingVertical: 8,
        marginBottom: 15,
        fontFamily: 'Poppins-Regular',
    },
    modalTagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    modalTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    modalCloseButton: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
    },
    tagsInput: {
        minHeight: 40,
        paddingVertical: 8,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    viewTag: {
        backgroundColor: colors.borders,
    },
    tagText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: colors.textPrimary,
    },
    placeholderText: {
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        fontSize: 14,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        backgroundColor: colors.backgroundLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectedOption: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    optionText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: colors.textPrimary,
    },
    headerActions: {
        flexDirection: "row",
        gap: 16,
    },
    content: {
        padding: 16,
    },
    discountBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    discountText: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
    },
    statusButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
    },

    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
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

    fieldLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },

    availabilityButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
    },
    stockContainer: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    percentage: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.textPrimary,
    },
    progressContainer: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.borders,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    stockText: {
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 8,
    },
    systemInfo: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    detailLabel: {
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontFamily: 'Poppins-Medium',
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'right',
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.borders,
    },
    reviewUser: {
        flex: 1,
        gap: 4,
    },
    reviewName: {
        fontFamily: 'Poppins-Medium',
        color: colors.textPrimary,
        fontSize: 14,
    },
    reviewDate: {
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        fontSize: 12,
    },
    reviewComment: {
        fontFamily: 'Poppins-Regular',
        color: colors.textPrimary,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyText: {
        fontFamily: 'Poppins-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: 16,
    },
    showMoreButton: {
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.borders,
    },
    showMoreText: {
        fontFamily: 'Poppins-Medium',
        color: colors.primary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingText: {
        fontFamily: 'Poppins-SemiBold',
        color: colors.textPrimary,
        fontSize: 14,
    },
    descriptionContainer: {
        width: '100%',
        minHeight: 120,
    },
    descriptionInput: {
        height: 100,
        padding: 8,
        textAlign: 'left',
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: 8,
    },
    descriptionText: {
        flex: 1,
        lineHeight: 20,
    },

    fieldContainer: {
        width: '48%',
        minHeight: 70,
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.borders,
        justifyContent: 'flex-start',
    },
    fieldValue: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: colors.textPrimary,
        flexShrink: 1,
    },
    input: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: colors.primary,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        includeFontPadding: false,
    },
});

export default ItemDetailsPage;