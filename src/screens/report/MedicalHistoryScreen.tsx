import React, { useState, useCallback, useEffect } from "react";
import {
  View, TextInput, ScrollView, StyleSheet, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform, Alert, StyleProp, TextStyle,
  Switch // <-- Import Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../../styles/colors"; // Adjust path as needed
// Import RootStackParamList from types.ts
import type { RootStackParamList } from "../../navigators/types"; // Adjust path
import type { MedicalHistoryState, CombinedFormsData, ReportIncidentState } from "../../navigators/types"; // Adjust path

type MedicalHistoryNavigationProp = StackNavigationProp<RootStackParamList, "MedicalHistory">;
type MedicalHistoryRouteProp = RouteProp<RootStackParamList, "MedicalHistory">;

// --- Helper Components ---
// Radio Button Helper
interface RadioButtonProps { label: string; selected: boolean; onPress: () => void; style?: object; }
const RadioButton: React.FC<RadioButtonProps> = ({ label, selected, onPress, style }) => (
    <TouchableOpacity style={[styles.radioTouchable, style]} onPress={onPress} activeOpacity={0.7}>
        <Feather name={selected ? "check-circle" : "circle"} size={20} color={selected ? COLORS.secondary : COLORS.textLight} style={styles.radioIcon}/>
        <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
);
// Form Input Helper
interface FormInputProps extends Omit<React.ComponentProps<typeof TextInput>, 'style' | 'onChangeText' | 'value'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    rightIcon?: React.ReactNode; // Keep if needed elsewhere
    style?: StyleProp<TextStyle>;
 }
const FormInput: React.FC<FormInputProps> = ({ label, rightIcon, style, ...props }) => (
     <View style={styles.inputBlock}>
       <Text style={styles.label}>{label}</Text>
       <View style={styles.inputContainer}>
         <TextInput
             style={[styles.input, props.multiline && styles.multilineInput, style]}
             placeholderTextColor={COLORS.placeholder}
             {...props} // Spread remaining props like value, onChangeText, etc.
         />
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
       </View>
     </View>
);
// --- End Helper Components ---

// Email Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MedicalHistoryScreen = () => {
  const navigation = useNavigation<MedicalHistoryNavigationProp>();
  const route = useRoute<MedicalHistoryRouteProp>();
  // Receive data correctly based on RootStackParamList definition
  const problemAndProductData = route.params.problemAndProductData;
  const initialData = route.params.initialData; // Get initial data if passed for editing

  // Initialize state including the new medical attention field
  const [form, setForm] = useState<MedicalHistoryState>(() => {
      const defaults: MedicalHistoryState = {
          patientInitials: "",
          patientSex: null,
          patientKnownMedicalConditionsOrAllergies: "",
          patientSoughtMedicalAttention: null, // <-- ADDED default
          reporterFirstName: "",
          reporterLastName: "",
          reporterEmail: "",
          reporterConfirmEmail: "",
      };
      // Merge initialData carefully
      if (initialData) {
           return {
               ...defaults,
               ...initialData,
               // Ensure boolean/null is handled correctly if initialData might miss it
               patientSoughtMedicalAttention: initialData.patientSoughtMedicalAttention === undefined ? null : initialData.patientSoughtMedicalAttention,
           };
      }
      return defaults;
  });

  const [emailError, setEmailError] = useState<string | null>(null);

   // useEffect to handle initialData updates
   useEffect(() => {
      if (initialData) {
          console.log("Received initialData in MedicalHistoryScreen, setting form state...");
          // Update the state with the passed data, ensuring all fields are covered
          setForm({
              patientInitials: initialData.patientInitials || "",
              patientSex: initialData.patientSex || null,
              patientKnownMedicalConditionsOrAllergies: initialData.patientKnownMedicalConditionsOrAllergies || "",
              patientSoughtMedicalAttention: initialData.patientSoughtMedicalAttention === undefined ? null : initialData.patientSoughtMedicalAttention, // Handle boolean/null
              reporterFirstName: initialData.reporterFirstName || "",
              reporterLastName: initialData.reporterLastName || "",
              reporterEmail: initialData.reporterEmail || "",
              reporterConfirmEmail: initialData.reporterConfirmEmail || "",
          });
      }
  }, [initialData]);

  // Update handleChange to handle boolean for the Switch
  const handleChange = useCallback((key: keyof MedicalHistoryState, value: string | boolean | null) => {
      if (key === 'reporterEmail' || key === 'reporterConfirmEmail') { setEmailError(null); }
      setForm((prevForm) => ({ ...prevForm, [key]: value }));
  }, []);

  const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

  const handleNext = (): void => {
    // --- Validation ---
    if (!form.reporterFirstName.trim() || !form.reporterLastName.trim()) { Alert.alert("Missing Info", "Please enter reporter's first and last name."); return; }
    if (!form.reporterEmail.trim() || !form.reporterConfirmEmail.trim()) { setEmailError("Please enter and confirm email."); Alert.alert("Missing Info", "Please enter and confirm email."); return; }
    if (!validateEmail(form.reporterEmail.trim())) { setEmailError("Please enter a valid email."); Alert.alert("Invalid Email", "Please enter a valid email."); return; }
    if (form.reporterEmail.trim().toLowerCase() !== form.reporterConfirmEmail.trim().toLowerCase()) { setEmailError("Emails do not match."); Alert.alert("Email Mismatch", "Emails do not match."); return; }
    // Optional: Add validation for medical attention if it should be mandatory *in the app*
    // if (form.patientSoughtMedicalAttention === null) { Alert.alert("Missing Info", "Please indicate if medical attention was sought."); return; }
    setEmailError(null);

    const combinedData: CombinedFormsData = {
        problemAndProductData: problemAndProductData,
        patientAndReporterData: form, // Contains patientSoughtMedicalAttention
    };

    console.log("Collected Patient/Reporter Data:", form);
    console.log("Combined Data for Review:", combinedData);
    navigation.navigate("ReviewSubmit", { combinedData: combinedData });
  };

  const goBack = (): void => { navigation.goBack(); };

  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Issue (2/2)</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* --- About Patient Section --- */}
          <Text style={styles.sectionTitle}>About Patient</Text>
          <FormInput
            label="Person's Initials"
            value={form.patientInitials}
            onChangeText={(v: string) => handleChange("patientInitials", v)}
            maxLength={3}
            autoCapitalize="characters"
            placeholder="e.g., JD"
          />
          <View style={styles.inputBlock}>
             <Text style={styles.label}>Gender</Text>
             <View style={styles.radioGroupContainer}>
                  <RadioButton label="Male" selected={form.patientSex === 'Male'} onPress={() => handleChange('patientSex', 'Male')} />
                  <RadioButton label="Female" selected={form.patientSex === 'Female'} onPress={() => handleChange('patientSex', 'Female')} />
             </View>
          </View>
          <FormInput
            label="List known medical conditions or allergies"
            value={form.patientKnownMedicalConditionsOrAllergies}
            onChangeText={(v: string) => handleChange("patientKnownMedicalConditionsOrAllergies", v)}
            placeholder="(Such as diabetes, high blood pressure, food/drug allergies, etc.)"
            multiline
            numberOfLines={4}
            maxLength={2000}
          />

          {/* --- Medical Attention Toggle --- */}
           <View style={styles.toggleRowContainer}>
              <Text style={styles.toggleRowLabel}>Did patient seek medical attention?</Text>
              <View style={styles.switchContainer}>
                <Text style={[ styles.switchLabel, form.patientSoughtMedicalAttention === false && styles.switchLabelActive ]}> No </Text>
                <Switch
                  value={form.patientSoughtMedicalAttention === true} // Switch expects boolean
                  onValueChange={(v: boolean) => handleChange("patientSoughtMedicalAttention", v)}
                  trackColor={{ false: COLORS.switchTrackFalse || '#767577', true: COLORS.switchTrackTrue || '#81b0ff' }}
                  thumbColor={ form.patientSoughtMedicalAttention ? (COLORS.switchThumbActive || '#f5dd4b') : (COLORS.switchThumbInactive || '#f4f3f4') }
                  ios_backgroundColor={COLORS.switchTrackFalse || "#3e3e3e"}
                  style={styles.switchControl}
                />
                <Text style={[ styles.switchLabel, form.patientSoughtMedicalAttention === true && styles.switchLabelActive ]}> Yes </Text>
              </View>
            </View>
          {/* --- End Medical Attention Toggle --- */}


          {/* --- About Reporter Section --- */}
          <Text style={styles.sectionTitle}>About Reporter</Text>
          <FormInput
            label="First Name (Given Name) *"
            value={form.reporterFirstName}
            onChangeText={(v: string) => handleChange("reporterFirstName", v)}
            placeholder="Enter your first name"
            autoCapitalize="words"
          />
          <FormInput
            label="Last Name (Family Name) *"
            value={form.reporterLastName}
            onChangeText={(v: string) => handleChange("reporterLastName", v)}
            placeholder="Enter your last name"
            autoCapitalize="words"
          />
           <FormInput
            label="Email Address *"
            value={form.reporterEmail}
            onChangeText={(v: string) => handleChange("reporterEmail", v)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
           {emailError && !validateEmail(form.reporterEmail) && <Text style={styles.errorTextSmall}>{emailError}</Text>}
           <FormInput
            label="Confirm Email *"
            value={form.reporterConfirmEmail}
            onChangeText={(v: string) => handleChange("reporterConfirmEmail", v)}
            placeholder="Re-enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
           {emailError && form.reporterEmail !== form.reporterConfirmEmail && <Text style={styles.errorTextSmall}>{emailError}</Text>}

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.submitText}>NEXT: REVIEW & SUBMIT</Text>
            <Feather name="arrow-right" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12, backgroundColor: COLORS.primary, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle, minHeight: 50 },
  backButton: { padding: 8, justifyContent: "center", alignItems: "center", width: 40, height: 40 },
  headerTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600", textAlign: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 100 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 15, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  inputBlock: { marginBottom: 25 },
  label: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8, fontWeight: "500" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBackground, borderRadius: 10, borderWidth: 1, borderColor: "#d0d0d0", minHeight: 50 },
  input: { flex: 1, paddingVertical: Platform.OS === "ios" ? 14 : 12, paddingHorizontal: 16, fontSize: 16, color: COLORS.textDark },
  multilineInput: { minHeight: 100, textAlignVertical: "top", paddingTop: 14 },
  footer: { paddingVertical: 15, paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: COLORS.primary, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  submitButton: { flexDirection: "row", backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 4 },
  submitText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16, textAlign: "center" },
  radioGroupContainer: { flexDirection: 'row', gap: 20, marginBottom: 10, flexWrap: 'wrap' },
  radioTouchable: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioIcon: { marginRight: 10 },
  radioLabel: { color: COLORS.textLight, fontSize: 15 },
  iconContainer: { paddingHorizontal: 12 },
   toggleRowContainer: {
      backgroundColor: COLORS.backgroundSubtle, borderRadius: 10, paddingVertical: 15, paddingHorizontal: 15, marginBottom: 25, borderWidth: 1, borderColor: COLORS.borderSubtle, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
  },
  toggleRowLabel: { color: COLORS.textLight, fontSize: 16, fontWeight: "500", flexShrink: 1, marginRight: 15 },
  switchContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  switchLabel: { color: COLORS.textMuted, fontSize: 15, fontWeight: "500" },
  switchLabelActive: { color: COLORS.secondary, fontWeight: "bold" },
  switchControl: {},
  errorTextSmall: { color: '#FF6B6B', fontSize: 12, marginTop: -15, marginBottom: 10, marginLeft: 5 },
});

export default MedicalHistoryScreen;
