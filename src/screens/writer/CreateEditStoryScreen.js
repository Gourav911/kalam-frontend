// screens/writer/CreateEditStoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import apiservice from '../../services/apiService';
import { API_BASE_URL } from '../../constants/api';
const CreateEditStoryScreen = ({ route, navigation }) => {
  const { story: editStory } = route.params || {};
  const isEditing = !!editStory;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft',
    price: '5.00',
    cover_image: null,
    is_featured: false,
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    if (isEditing && editStory) {
      populateFormData(editStory);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      // console.log(response)
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const populateFormData = (story) => {
    setFormData({
      title: story.title || '',
      content: story.content || '',
      excerpt: story.excerpt || '',
      category_id: story.category_id?.toString() || '',
      status: story.status || 'draft',
      price: story.price?.toString() || '5.00',
      cover_image: story.cover_image_url ? { uri: story.cover_image_url } : null,
      is_featured: story.is_featured || false,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 500) {
      newErrors.content = 'Content must be at least 500 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price < 1 || price > 50) {
      newErrors.price = 'Price must be between ₹1 and ₹50';
    }

    return newErrors;
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          cover_image: result.assets[0]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async (isDraft = false) => {
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('excerpt', formData.excerpt.trim());
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('status', isDraft ? 'draft' : formData.status);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_featured', formData.is_featured.toString());

      // Add cover image if selected and it's a new file
      if (formData.cover_image && formData.cover_image.uri && !formData.cover_image.uri.startsWith('http')) {
        formDataToSend.append('cover_image', {
          uri: formData.cover_image.uri,
          type: 'image/jpeg',
          name: 'cover.jpg',
        });
      }

      let result;
      if (isEditing) {
        result = await apiservice.updateStory(editStory.id, formDataToSend);
      } else {
        result = await apiservice.createStory(formDataToSend);
      }

      if (result.success) {
        Alert.alert(
          'Success',
          `Story ${isDraft ? 'saved as draft' : (isEditing ? 'updated' : 'created')} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        if (result.error.details) {
          setErrors(result.error.details);
        } else {
          Alert.alert('Error', result.error.message || 'Failed to save story');
        }
      }
    } catch (error) { 
      console.error('Error saving story:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getWordCount = () => {
    return formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = () => {
    return formData.content.length;
  };

  if (isCategoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Story' : 'New Story'}
            </Text>
            <TouchableOpacity
              onPress={() => handleSave(true)}
              disabled={isLoading}
              style={styles.draftButton}
            >
              <Text style={styles.draftButtonText}>Save Draft</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Cover Image */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cover Image</Text>
              <TouchableOpacity
                style={styles.imagePickerContainer}
                onPress={handleImagePicker}
              >
                {formData.cover_image ? (
                  <Image
                    source={{ uri: formData.cover_image.uri }}
                    style={styles.coverImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                    <Text style={styles.imagePlaceholderSubtext}>Tap to add cover</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.titleInput, errors.title ? styles.inputError : null]}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Enter your story title"
                placeholderTextColor="#999"
                maxLength={255}
              />
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <View style={[styles.pickerContainer, errors.category_id ? styles.inputError : null]}>
                <Picker
                  selectedValue={formData.category_id}
                  onValueChange={(value) => updateFormData('category_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories.map((category) => (
                    <Picker.Item
                      key={category.id}
                      label={category.name}
                      value={category.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
              {errors.category_id ? <Text style={styles.errorText}>{errors.category_id}</Text> : null}
            </View>

            {/* Price */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : null]}
                value={formData.price}
                onChangeText={(text) => updateFormData('price', text)}
                placeholder="5.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            {/* Content */}
            <View style={styles.inputContainer}>
              <View style={styles.contentHeader}>
                <Text style={styles.label}>Story Content *</Text>
                <View style={styles.contentStats}>
                  <Text style={styles.statText}>{getWordCount()} words</Text>
                  <Text style={styles.statText}>{getCharacterCount()} chars</Text>
                </View>
              </View>
              <TextInput
                style={[styles.contentInput, errors.content ? styles.inputError : null]}
                value={formData.content}
                onChangeText={(text) => updateFormData('content', text)}
                placeholder="Start writing your story here...&#10;&#10;Remember: The first 3 paragraphs will be free for readers to preview. Make them engaging!"
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
              {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}
              <Text style={styles.contentHint}>
                💡 Tip: Separate paragraphs with double line breaks. First 3 paragraphs are free preview.
              </Text>
            </View>

            {/* Excerpt */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Excerpt (Optional)</Text>
              <TextInput
                style={styles.excerptInput}
                value={formData.excerpt}
                onChangeText={(text) => updateFormData('excerpt', text)}
                placeholder="Brief description of your story (auto-generated if empty)"
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <Text style={styles.characterCount}>{formData.excerpt.length}/500</Text>
            </View>

            {/* Status */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => updateFormData('status', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Draft" value="draft" />
                  <Picker.Item label="Published" value="published" />
                </Picker>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.publishButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleSave(false)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>
                {isEditing ? 'Update Story' : 'Publish Story'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  draftButton: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  draftButtonText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 200,
  },
  excerptInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  coverImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#666',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  contentHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  publishButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default CreateEditStoryScreen;