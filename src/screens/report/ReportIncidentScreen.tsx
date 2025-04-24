import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  // Import StyleProp and TextStyle for FormInputProps
  StyleProp,
  TextStyle,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
// Added useRoute and RouteProp
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../../styles/colors"; // Adjust path as needed
import type { RootStackParamList } from "../../navigators/types"; // Adjust path
// Removed ProductTypes import as it's no longer directly used in state
import type { ReportIncidentState } from "../../navigators/types"; // Adjust path
import ScannerModal from "../../components/ScannerModal";
import type { ScanResultData } from "../../components/ScannerModal"; // Adjust path if needed

// Define route prop type for this screen to access params
type ReportIncidentRouteProp = RouteProp<RootStackParamList, "ReportIncident">;

type ReportIncidentNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ReportIncident"
>;

// --- Helper Components ---
// Radio Button Helper
interface RadioButtonProps { label: string; selected: boolean; onPress: () => void; style?: object; }
const RadioButton: React.FC<RadioButtonProps> = ({ label, selected, onPress, style }) => (
    <TouchableOpacity style={[styles.radioTouchable, style]} onPress={onPress} activeOpacity={0.7}>
        <Feather name={selected ? "check-circle" : "circle"} size={20} color={selected ? COLORS.secondary : COLORS.textLight} style={styles.radioIcon}/>
        <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
);
// Checkbox Helper (Kept in case needed later)
interface CheckboxProps { label: string; checked: boolean; onPress: () => void; style?: object; }
const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onPress, style }) => (
    <TouchableOpacity style={[styles.checkboxTouchable, style]} onPress={onPress} activeOpacity={0.7}>
        <Feather name={checked ? "check-square" : "square"} size={20} color={checked ? COLORS.secondary : COLORS.textLight} style={styles.checkboxIcon}/>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);
// Form Input Helper
// Updated FormInputProps to include style
interface FormInputProps extends Omit<React.ComponentProps<typeof TextInput>, 'style' | 'onChangeText' | 'value'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  rightIcon?: React.ReactNode;
  editable?: boolean; // Keep editable prop if used
  pointerEvents?: 'none' | 'box-none' | 'box-only' | 'auto'; // Keep pointerEvents if used
  style?: StyleProp<TextStyle>;
}
const FormInput: React.FC<FormInputProps> = ({ label, rightIcon, style, ...props }) => (
     <View style={styles.inputBlock}>
       <Text style={styles.label}>{label}</Text>
       <View style={styles.inputContainer}>
         <TextInput
             // Apply passed style along with default styles
             style={[styles.input, props.multiline && styles.multilineInput, style]}
             placeholderTextColor={COLORS.placeholder}
             {...props} // Spread remaining props like value, onChangeText, etc.
         />
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
       </View>
     </View>
);
// --- End Helper Components ---

// Helper to safely parse MM/DD/YYYY string to Date, handling potential invalid formats
const parseDateString = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  // Basic check for MM/DD/YYYY format
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) return null;
  // Attempt parsing. Note: new Date(string) can be unreliable with formats other than YYYY-MM-DD.
  // A more robust library like date-fns or moment.js would be better for production.
  // For MM/DD/YYYY, splitting might be safer:
  const parts = dateString.split('/');
  if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year) && year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
           // Create date in UTC to avoid timezone shifts from just MM/DD/YYYY string
           const date = new Date(Date.UTC(year, month - 1, day));
           // Basic validation if the created date matches the input parts
           if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
               return date;
           }
      }
  }
  // Fallback or if parsing fails
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Helper to format Date object to MM/DD/YYYY string
const formatDateToString = (date: Date | null): string => {
  if (!date) return '';
  try {
      const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return date.toLocaleDateString('en-US', formatOptions); // MM/DD/YYYY
  } catch (e) {
      console.error("Error formatting date:", e);
      return ''; // Return empty string on error
  }
};

const ReportIncidentScreen = () => {
  const navigation = useNavigation<ReportIncidentNavigationProp>();
  // Get route object to access params
  const route = useRoute<ReportIncidentRouteProp>();
  // Check for initialData passed via route params for editing
  const initialData = route.params?.initialData;

  // Initialize state using initialData if present, otherwise use defaults
  const [form, setForm] = useState<ReportIncidentState>(initialData || {
    problemDescription: "",
    problemDate: "",
    problemCause: null, // Defaulted later if still null
    reportIsAbout: null,
    productName: "",
    productExpirationDate: "",
    productPurchaseLocation: "",
    // Re-add other fields if scanner populates them
    //identifier: "",
    //category: "",
    specifications: "",
  });

  // Initialize date picker states based on initialData as well
  const [isProblemDatePickerVisible, setProblemDatePickerVisibility] = useState(false);
  const [selectedProblemDate, setSelectedProblemDate] = useState<Date | null>(
      // Attempt to parse date string back to Date object for picker
      initialData?.problemDate ? new Date(initialData.problemDate) : null
  );
  const [isExpirationDatePickerVisible, setExpirationDatePickerVisibility] = useState(false);
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<Date | null>(
      initialData?.productExpirationDate ? new Date(initialData.productExpirationDate) : null
  );
   // State for Scanner Modal
   const [isScannerVisible, setIsScannerVisible] = useState(false);


  // --- useEffect to load initialData when component receives it ---
  // This handles cases where the screen might re-render with new params without remounting
  useEffect(() => {
      if (initialData) {
          console.log("Received initialData in ReportIncidentScreen, setting form state...");
          // Ensure all fields defined in ReportIncidentState are set
          setForm({
              problemDescription: initialData.problemDescription || "",
              problemDate: initialData.problemDate || "",
              problemCause: initialData.problemCause || null,
              productPurchaseLocation: initialData.productPurchaseLocation || "", // Ensure this exists if added back to type
              reportIsAbout: initialData.reportIsAbout || null,
              productName: initialData.productName || "",
              productExpirationDate: initialData.productExpirationDate || "",
              //identifier: initialData.identifier || "", // Handle re-added fields
              //category: initialData.category || "", // Handle re-added fields
              specifications: initialData.specifications || "", // Handle re-added fields
          });
          // Also update the Date objects used by the pickers if initialData exists
          setSelectedProblemDate(initialData.problemDate ? new Date(initialData.problemDate) : null);
          setSelectedExpirationDate(initialData.productExpirationDate ? new Date(initialData.productExpirationDate) : null);
      }
  }, [initialData]); // Dependency array ensures this runs when initialData changes


  // Updated handleChange
  const handleChange = useCallback((key: keyof ReportIncidentState, value: any) => {
     setForm((prevForm) => ({ ...prevForm, [key]: value }));
  }, []);

  // --- Date Picker Handlers ---
  const showProblemDatePicker = () => setProblemDatePickerVisibility(true);
  const hideProblemDatePicker = () => setProblemDatePickerVisibility(false);
  const handleConfirmProblemDate = (date: Date) => {
      const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = date.toLocaleDateString('en-US', formatOptions); // MM/DD/YYYY
      setSelectedProblemDate(date); // Keep Date object for picker state
      handleChange("problemDate", formattedDate); // Update form state with string
      hideProblemDatePicker();
  };

  const showExpirationDatePicker = () => setExpirationDatePickerVisibility(true);
  const hideExpirationDatePicker = () => setExpirationDatePickerVisibility(false);
  const handleConfirmExpirationDate = (date: Date) => {
      const formatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = date.toLocaleDateString('en-US', formatOptions); // MM/DD/YYYY
      setSelectedExpirationDate(date); // Keep Date object for picker state
      handleChange("productExpirationDate", formattedDate); // Update form state with string
      hideExpirationDatePicker();
  };
  // --- End Date Picker Handlers ---

   // --- Scanner Handlers ---
   const handleScanPress = () => {
       console.log("Scan button pressed");
       setIsScannerVisible(true);
   };

   const handleScanSuccess = (scanData: ScanResultData) => {
       console.log("Scan success:", scanData);
       setForm((prevForm) => ({
           ...prevForm,
           //identifier: scanData.identifier || prevForm.identifier,
           productName: scanData.name || prevForm.productName,
           //category: scanData.category || prevForm.category,
           specifications: scanData.specifications || prevForm.specifications,
       }));
       setIsScannerVisible(false);
       Alert.alert( "Scan Success", `Populated details for ${scanData.name || 'scanned item'}. Please verify.` );
   };

   const handleScanError = (message: string) => {
       console.log("Scan error:", message);
       setIsScannerVisible(false);
       Alert.alert("Scan Error", message || "Could not process barcode or find product.");
   };
   // --- End Scanner Handlers ---


  const handleNext = (): void => {
    // --- Validation ---
    if (!form.problemDescription.trim()) { Alert.alert("Missing Info", "Please describe what happened."); return; }
    const finalProblemCause = form.problemCause ?? 'ProductRelated'; // Default if null
     // Add back validation for purchase location if it's still required
     // if (!form.productPurchaseLocation.trim()) { Alert.alert("Missing Info", "Please enter where product was purchased."); return; }
     if (form.reportIsAbout === null) { Alert.alert("Missing Info", "Please select what the report is about."); return; }
     if (!form.productName.trim()) { Alert.alert("Missing Info", "Please enter the product name."); return; }

    // Ensure all fields are included when passing data
    const dataToPass: ReportIncidentState = { ...form, problemCause: finalProblemCause };
    console.log("Report Incident Data:", dataToPass);
    navigation.navigate("MedicalHistory", { problemAndProductData: dataToPass });
  };

  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        {/* Header with conditional Back button */}
        <View style={styles.header}>
          {navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Feather name="arrow-left" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
          ) : (
              <View style={{ width: 40 }} /> // Spacer if no back button
          )}
          <Text style={styles.headerTitle}>Report Issue (1/2)</Text>
          <View style={{ width: 40 }} />{/* Right Spacer */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Form content uses 'form' state which is initialized/updated from initialData */}
          {/* --- About Problem Section --- */}
          <Text style={styles.sectionTitle}>About the Problem</Text>
          <FormInput
            label="Tell us what happened and how it happened *"
            value={form.problemDescription}
            onChangeText={(v: string) => handleChange("problemDescription", v)}
            placeholder="Include as many details as possible..."
            multiline numberOfLines={6} maxLength={4000}
          />
          {/* Problem Date Picker */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Date the problem occurred (mm/dd/yyyy)</Text>
            <TouchableOpacity onPress={showProblemDatePicker} style={styles.inputContainer} activeOpacity={0.7}>
              <TextInput style={[styles.input, { flex: 1, color: form.problemDate ? COLORS.textDark : COLORS.placeholder }]}
                placeholder="Select Date" placeholderTextColor={COLORS.placeholder}
                value={form.problemDate} editable={false} pointerEvents="none" />
              <View style={styles.iconContainer}> <Feather name="calendar" size={20} color={COLORS.textDark} /> </View>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal isVisible={isProblemDatePickerVisible} mode="date" date={selectedProblemDate || new Date()}
            onConfirm={handleConfirmProblemDate} onCancel={hideProblemDatePicker} maximumDate={new Date()} />

          {/* Purchase Location Input - Uncomment if needed */}
          {/* <FormInput
              label="Where did you purchase the product? *"
              value={form.productPurchaseLocation}
              onChangeText={(v: string) => handleChange("productPurchaseLocation", v)}
              placeholder="e.g., Store name, Website, City/State"
              autoCapitalize="sentences"
          /> */}

          {/* Problem Cause UI Removed */}
          {/*<Text style={styles.infoText}>Note: Problem cause will be defaulted to 'Product Related'.</Text>*/}


          {/* --- About Product Section --- */}
          <Text style={styles.sectionTitle}>About the Product</Text>
          <View style={styles.inputBlock}>
             <Text style={styles.label}>This report is about: *</Text>
             <View style={styles.radioGroupContainer}>
                 <RadioButton label="Cosmetic" selected={form.reportIsAbout === 'Cosmetic'} onPress={() => handleChange('reportIsAbout', 'Cosmetic')}/>
                 <RadioButton label="Dietary Supplement" selected={form.reportIsAbout === 'DietarySupplement'} onPress={() => handleChange('reportIsAbout', 'DietarySupplement')}/>
                 <RadioButton label="Food / Medical Food" selected={form.reportIsAbout === 'FoodMedicalFood'} onPress={() => handleChange('reportIsAbout', 'FoodMedicalFood')}/>
                 <RadioButton label="Other" selected={form.reportIsAbout === 'Other'} onPress={() => handleChange('reportIsAbout', 'Other')}/>
             </View>
          </View>

          {/* Product Name with Scanner Icon */}
           <FormInput
            label="Name(s) of the product as it appears on the box, bottle, or package *"
            value={form.productName}
            onChangeText={(v: string) => handleChange("productName", v)}
            placeholder="Enter product name or scan barcode"
            autoCapitalize="words"
            rightIcon={ // Scanner Icon Button
                <TouchableOpacity onPress={handleScanPress} style={styles.iconButton}>
                    <Feather name="camera" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
            }
          />
          {/* Add inputs for Identifier, Category, Specifications */}
           {/*<FormInput label="Identifier (UPC/NDC/etc.)" value={form.identifier} onChangeText={(v: string) => handleChange("identifier", v)} placeholder="Populated by scan or enter manually" />*/}
           {/*<FormInput label="Category" value={form.category} onChangeText={(v: string) => handleChange("category", v)} placeholder="Populated by scan or enter manually" />*/}
           <FormInput label="Specifications/Brand" value={form.specifications} onChangeText={(v: string) => handleChange("specifications", v)} placeholder="Populated by scan or enter manually" />


          {/* Expiration Date Picker */}
           <View style={styles.inputBlock}>
            <Text style={styles.label}>Expiration Date (mm/dd/yyyy)</Text>
            <TouchableOpacity onPress={showExpirationDatePicker} style={styles.inputContainer} activeOpacity={0.7}>
              <TextInput style={[styles.input, { flex: 1, color: form.productExpirationDate ? COLORS.textDark : COLORS.placeholder }]}
                 placeholder="Select Date" placeholderTextColor={COLORS.placeholder}
                 value={form.productExpirationDate} editable={false} pointerEvents="none" />
              <View style={styles.iconContainer}> <Feather name="calendar" size={20} color={COLORS.textDark} /> </View>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal isVisible={isExpirationDatePickerVisible} mode="date" date={selectedExpirationDate || new Date()}
            onConfirm={handleConfirmExpirationDate} onCancel={hideExpirationDatePicker} maximumDate={new Date()}/>

          {/* Product Type UI Removed */}

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.submitText}>NEXT: PATIENT & REPORTER INFO</Text>
            <Feather name="arrow-right" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

       {/* Scanner Modal */}
       <ScannerModal
           isVisible={isScannerVisible}
           onClose={() => setIsScannerVisible(false)}
           onScanSuccess={handleScanSuccess}
           onError={handleScanError}
       />

    </SafeAreaView>
  );
};


// --- Styles --- (Add backButton style)
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12, backgroundColor: COLORS.primary, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle, minHeight: 50 },
  backButton: { padding: 8, justifyContent: "center", alignItems: "center", width: 40, height: 40 }, // Added
  headerTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600", textAlign: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 100 },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 15, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  inputBlock: { marginBottom: 25 },
  label: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8, fontWeight: "500" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBackground, borderRadius: 10, borderWidth: 1, borderColor: "#d0d0d0", minHeight: 50 },
  input: { flex: 1, paddingVertical: Platform.OS === "ios" ? 14 : 12, paddingHorizontal: 16, fontSize: 16, color: COLORS.textDark },
  multilineInput: { minHeight: 100, textAlignVertical: "top", paddingTop: 14 },
  iconContainer: { paddingHorizontal: 12, justifyContent: 'center' },
  iconButton: { padding: 8, }, // Added for scanner icon
  footer: { paddingVertical: 15, paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 34 : 20, backgroundColor: COLORS.primary, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  submitButton: { flexDirection: "row", backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 4 },
  submitText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16, textAlign: "center" },
  radioGroupContainer: { marginBottom: 10 },
  radioTouchable: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  radioVertical: { paddingVertical: 10 },
  radioIcon: { marginRight: 10 },
  radioLabel: { color: COLORS.textLight, fontSize: 15, flexShrink: 1 },
  checkboxTouchable: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }, // Kept for helper component
  checkboxIcon: { marginRight: 10 }, // Kept for helper component
  checkboxLabel: { color: COLORS.textLight, fontSize: 15, flexShrink: 1 }, // Kept for helper component
  infoText: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginBottom: 20, marginTop: -15 }
});

export default ReportIncidentScreen;
