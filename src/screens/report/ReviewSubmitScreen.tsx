import React, { useState, useCallback } from "react"; // Added useCallback
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
  // Import StyleProp and TextStyle if used by helpers you keep
  StyleProp,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { COLORS } from "../../../styles/colors"; // Adjust path
import { useAuth } from "@clerk/clerk-expo";
// Ensure necessary types are imported correctly from your types file
import type { RootStackParamList, CombinedFormsData, SubmissionPayload, ReportIncidentState, MedicalHistoryState } from "../../navigators/types"; // Adjust path

type ReviewSubmitNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ReviewSubmit"
>;
type ReviewSubmitRouteProp = RouteProp<RootStackParamList, "ReviewSubmit">;

// --- Helper Components ---
// Review Row Helper (Assuming definition exists or is similar)
interface ReviewRowProps { label: string; value: string | undefined | null | boolean; }
const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  if (displayValue.trim() === '') return null;
  return ( <View style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{displayValue}</Text></View> );
};
// Checkbox Helper (Assuming definition exists or is similar)
interface CheckboxProps { label: string; checked: boolean; onPress: () => void; style?: object; }
const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onPress, style }) => (
    <TouchableOpacity style={[styles.checkboxTouchable, style]} onPress={onPress} activeOpacity={0.7}>
        <Feather name={checked ? "check-square" : "square"} size={20} color={checked ? COLORS.secondary : COLORS.textLight} style={styles.checkboxIcon}/>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- NEW Section Header with Edit Button ---
interface SectionHeaderProps {
  title: string;
  onEditPress: () => void; // Callback for edit button press
}
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onEditPress }) => (
    <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Feather name="edit-2" size={16} color={COLORS.secondary} />
            <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
    </View>
);
// --- End Helper Components ---


const ReviewSubmitScreen: React.FC = () => {
  const navigation = useNavigation<ReviewSubmitNavigationProp>();
  const route = useRoute<ReviewSubmitRouteProp>();
  // Receive the combined data correctly based on RootStackParamList
  const { combinedData } = route.params;
  const { problemAndProductData, patientAndReporterData } = combinedData;

  // --- GET USER ID FROM CLERK ---
  const { userId, isLoaded } = useAuth(); // Get userId from Clerk hook
  
  // State for OTP and Submission Flow (from your provided code)
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAttested, setIsAttested] = useState<boolean>(false);

  // Navigation Handlers
  const goBack = () => { navigation.goBack(); };

  // --- Edit Handlers ---
  const handleEditProblemProduct = useCallback(() => {
      console.log("Navigating to edit ReportIncident with:", problemAndProductData);
      // Navigate back to ReportIncident, passing its data as initialData
      navigation.navigate('ReportIncident', { initialData: problemAndProductData });
  }, [navigation, problemAndProductData]);

  const handleEditPatientReporter = useCallback(() => {
      console.log("Navigating to edit MedicalHistory with:", patientAndReporterData);
      // Navigate back to MedicalHistory, passing BOTH the required problemAndProductData
      // AND the initialData for the patient/reporter section
      navigation.navigate('MedicalHistory', {
          problemAndProductData: problemAndProductData, // Required by MedicalHistory route
          initialData: patientAndReporterData          // Data for pre-filling this section
      });
  }, [navigation, problemAndProductData, patientAndReporterData]);
  // --- End Edit Handlers ---


  // Backend URLs (from your provided code - remember to update IP)
  const TWILIO_BACKEND_BASE_URL: string = 'https://urrecalls-server-chi.vercel.app';
  const LOCAL_AUTOMATION_BACKEND_URL: string = 'http://192.168.1.121:3000'; // !! UPDATE IP !!
  const YOUR_BACKEND_SEND_OTP_URL: string = `${TWILIO_BACKEND_BASE_URL}/api/send-twilio-otp`;
  const YOUR_BACKEND_CHECK_OTP_URL: string = `${TWILIO_BACKEND_BASE_URL}/api/check-twilio-otp`;
  const YOUR_BACKEND_TRIGGER_AUTOMATION_URL: string = `${LOCAL_AUTOMATION_BACKEND_URL}/api/start-fda-automation`;

  // --- OTP Handlers --- (Exactly as you provided)
  const handleSendOtp = async (): Promise<void> => {
      const formattedPhoneNumber = phoneNumber.replace(/[\s()-]/g, '');
      if (!formattedPhoneNumber.startsWith('+') || formattedPhoneNumber.length < 11) {
          setVerificationError("Please use format +1XXXXXXXXXX."); return;
      }
      setVerificationError(null); setIsVerificationLoading(true);
      try {
          console.log(`Requesting OTP for ${formattedPhoneNumber} from ${YOUR_BACKEND_SEND_OTP_URL}...`);
          const response = await fetch(YOUR_BACKEND_SEND_OTP_URL, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: formattedPhoneNumber }),
          });
          if (!response.ok) {
              let errorMsg = `Failed to send OTP. Status: ${response.status}`;
              try { const errData = await response.json(); errorMsg = errData.error || errData.message || errorMsg; } catch (e) {}
              throw new Error(errorMsg);
          }
          const responseData = await response.json();
          if (!responseData.success) throw new Error(responseData.error || 'Failed to send OTP');
          setIsOtpSent(true); Alert.alert('Code Sent', 'An OTP should arrive shortly.');
      } catch (error: any) {
          console.error("Send OTP Error:", error);
          setVerificationError(error.message || 'An error occurred sending the code.');
          Alert.alert('Error', error.message || 'An error occurred sending the code.');
      } finally { setIsVerificationLoading(false); }
  };

  const handleVerifyOtp = async (): Promise<void> => {
      const formattedPhoneNumber = phoneNumber.replace(/[\s()-]/g, '');
      if (!otpCode || otpCode.length < 4) { setVerificationError("Please enter the received OTP code."); return; }
      setVerificationError(null); setIsVerificationLoading(true);
      try {
          console.log(`Verifying OTP ${otpCode} for ${formattedPhoneNumber} via ${YOUR_BACKEND_CHECK_OTP_URL}...`);
          const response = await fetch(YOUR_BACKEND_CHECK_OTP_URL, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: formattedPhoneNumber, otpCode: otpCode }),
          });
           if (!response.ok) {
                let errorMsg = `Failed to verify OTP. Status: ${response.status}`;
                try { const errData = await response.json(); errorMsg = errData.error || errData.message || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
           }
           const responseData = await response.json();
           if (!responseData.success || responseData.status !== 'approved') {
               throw new Error(responseData.error || 'Invalid or expired OTP code.');
           }
          console.log('OTP Verified successfully.'); setIsOtpVerified(true);
          Alert.alert('Success', 'Phone number verified successfully!');
      } catch (error: any) {
          console.error("Verify OTP Error:", error);
          setVerificationError(error.message || 'An error occurred during verification.');
          Alert.alert('Error', error.message || 'An error occurred during verification.');
      } finally { setIsVerificationLoading(false); }
  };
  // --- End OTP Handlers ---


  // --- Final Submit Handler --- (Exactly as you provided)
  const handleFinalSubmit = async (): Promise<void> => {
    if (!isOtpVerified) { Alert.alert("Verification Required", "Please complete phone number verification first."); return; }
    if (!isAttested) { Alert.alert("Attestation Required", "Please check the box to attest that the information provided is accurate and truthful."); return; }

    setIsSubmitting(true);

    // Create Final Payload based on SubmissionPayload type
    const finalPayload: SubmissionPayload = {
        problemDescription: problemAndProductData.problemDescription,
        problemDate: problemAndProductData.problemDate,
        problemCause: problemAndProductData.problemCause,
        productPurchaseLocation: problemAndProductData.productPurchaseLocation,
        reportIsAbout: problemAndProductData.reportIsAbout,
        productName: problemAndProductData.productName,
        productExpirationDate: problemAndProductData.productExpirationDate,
        patientInitials: patientAndReporterData.patientInitials,
        patientSex: patientAndReporterData.patientSex,
        patientKnownMedicalConditionsOrAllergies: patientAndReporterData.patientKnownMedicalConditionsOrAllergies,
        //identifier: problemAndProductData.identifier, 
        //category: problemAndProductData.category, 
        specifications: problemAndProductData.specifications, 
        reporterFirstName: patientAndReporterData.reporterFirstName,
        reporterLastName: patientAndReporterData.reporterLastName,
        reporterEmail: patientAndReporterData.reporterEmail,
        userId: userId ?? null, // Add the user ID
        phoneNumberVerified: phoneNumber.replace(/[\s()-]/g, ''),
        attested: isAttested,
        submittedAt: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(finalPayload, null, 2);
    console.log("--- Submitting Final Payload to Local Backend ---");
    console.log(`URL: ${YOUR_BACKEND_TRIGGER_AUTOMATION_URL}`);
    // console.log(jsonData);
    console.log("---------------------------------------------");

    try {
      const response = await fetch(YOUR_BACKEND_TRIGGER_AUTOMATION_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: jsonData,
      });
      if (!response.ok) {
        let errorMsg = `Local backend request failed. Status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; }
        catch (e) { try { const errorText = await response.text(); errorMsg += `. ${errorText.substring(0,100)}`; } catch (e2) {} }
        console.error("Local Backend Error Response:", errorMsg); throw new Error(errorMsg);
      }
      const responseData = await response.json();
      console.log("Local Backend Success Response:", responseData);
      Alert.alert('Automation Started', responseData.message || 'Your local automation script has been triggered.');
      // navigation.navigate('Home');

    } catch (error: any) {
      console.error('Local backend submission error:', error);
      let displayError = error.message || 'Something went wrong while triggering local automation.';
      if (error.message?.includes('Network request failed')) { displayError = 'Network request failed. Ensure the local backend server is running and accessible (check IP, port, firewall, Wi-Fi).'; }
      else if (error.message?.includes('JSON Parse error')) { displayError = 'Received an invalid response from the local backend server.'; }
      Alert.alert('Error', displayError);
    } finally { setIsSubmitting(false); }
  };

  const canSubmit: boolean = isOtpVerified && isAttested && !isSubmitting;

  // --- Render JSX ---
  return (
    <SafeAreaView style={styles.page} edges={["top", "left", "right"]}>
      {/* Header */}
       <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review & Submit</Text>
            <View style={{ width: 40 }} />
       </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Problem & Product with Edit Button */}
        {/* Use SectionHeader component */}
        <SectionHeader title="Problem & Product Summary" onEditPress={handleEditProblemProduct} />
        <View style={styles.sectionContent}>
          <ReviewRow label="Problem Description" value={problemAndProductData.problemDescription} />
          <ReviewRow label="Problem Date" value={problemAndProductData.problemDate} />
          <ReviewRow label="Purchase Location" value={problemAndProductData.productPurchaseLocation} />
          <ReviewRow label="Problem Cause (Defaulted)" value={problemAndProductData.problemCause} />
          <ReviewRow label="Report Is About" value={problemAndProductData.reportIsAbout} />
          <ReviewRow label="Product Name" value={problemAndProductData.productName} />
          <ReviewRow label="Expiration Date" value={problemAndProductData.productExpirationDate} />
          <ReviewRow label="Specifications/Brand" value={problemAndProductData.specifications} />
        </View>

        {/* Section 2: Patient & Reporter with Edit Button */}
        {/* Use SectionHeader component */}
        <SectionHeader title="Patient & Reporter Summary" onEditPress={handleEditPatientReporter} />
        <View style={styles.sectionContent}>
           <ReviewRow label="Patient Initials" value={patientAndReporterData.patientInitials} />
           <ReviewRow label="Patient Gender" value={patientAndReporterData.patientSex} />
           <ReviewRow label="Patient Known Conditions/Allergies" value={patientAndReporterData.patientKnownMedicalConditionsOrAllergies} />
           <ReviewRow label="Sought Medical Attention" value={patientAndReporterData.patientSoughtMedicalAttention} />
           <ReviewRow label="Reporter First Name" value={patientAndReporterData.reporterFirstName} />
           <ReviewRow label="Reporter Last Name" value={patientAndReporterData.reporterLastName} />
           <ReviewRow label="Reporter Email" value={patientAndReporterData.reporterEmail} />
        </View>


        {/* Phone Verification Section (Exactly as you provided) */}
        <View style={styles.verificationSection}>
             <Text style={styles.sectionTitle}>Phone Verification</Text>
             <Text style={styles.verificationSubtitle}>
                 {isOtpVerified ? "Your phone number has been verified." : "A code will be sent via SMS to verify this submission."}
             </Text>
             {/* OTP UI Logic */}
             {!isOtpVerified ? ( <> {!isOtpSent ? ( <View style={styles.inputBlock}>
                             <Text style={styles.label}>Phone Number (e.g., +14155552671)</Text>
                             <View style={[styles.inputContainer, styles.phoneInputContainer]}>
                                 <TextInput style={[styles.input, styles.phoneInput]} placeholder="+1XXXXXXXXXX" placeholderTextColor={COLORS.placeholder}
                                     value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" textContentType="telephoneNumber"
                                     editable={!isVerificationLoading} autoComplete="tel" />
                                 <TouchableOpacity style={[styles.sendOtpButton, (isVerificationLoading || !phoneNumber || phoneNumber.length < 11) && styles.buttonDisabled]}
                                     onPress={handleSendOtp} disabled={isVerificationLoading || !phoneNumber || phoneNumber.length < 11} activeOpacity={0.7} >
                                     {isVerificationLoading ? (<ActivityIndicator size="small" color={COLORS.primary} />) : (<Text style={styles.sendOtpButtonText}>Send Code</Text>)}
                                 </TouchableOpacity>
                             </View>
                         </View> ) : ( <View style={styles.inputBlock}>
                             <Text style={styles.label}>Enter OTP Code Sent to {phoneNumber}</Text>
                             <View style={styles.inputContainer}>
                                 <TextInput style={styles.input} placeholder="Enter code" placeholderTextColor={COLORS.placeholder} value={otpCode}
                                     onChangeText={setOtpCode} keyboardType="number-pad" maxLength={10} editable={!isVerificationLoading} textContentType="oneTimeCode" />
                             </View>
                             <TouchableOpacity style={[styles.verifyOtpButton, (isVerificationLoading || !otpCode || otpCode.length < 4) && styles.buttonDisabled]}
                                 onPress={handleVerifyOtp} disabled={isVerificationLoading || !otpCode || otpCode.length < 4} activeOpacity={0.7} >
                                 {isVerificationLoading ? (<ActivityIndicator size="small" color={COLORS.primary} />) : (<Text style={styles.verifyOtpButtonText}>Verify Code</Text>)}
                             </TouchableOpacity>
                             <TouchableOpacity style={[styles.resendButton, isVerificationLoading && styles.buttonDisabled]} onPress={handleSendOtp} disabled={isVerificationLoading}>
                                 <Text style={styles.resendButtonText}>Resend Code?</Text>
                             </TouchableOpacity>
                         </View> )}
                     {verificationError && (<Text style={styles.errorText}>{verificationError}</Text>)}
                 </> ) : ( <View style={styles.verifiedContainer}>
                     <Feather name="check-circle" size={24} color="green" />
                     <Text style={styles.verifiedText}>Phone Number Verified</Text>
                 </View> )}
        </View>


        {/* Attestation Checkbox Section (Exactly as you provided) */}
        <View style={styles.attestationContainer}>
          <Text style={styles.sectionTitle}>Final Attestation</Text>
          <Checkbox
            label="I attest that the information provided in this report is accurate and truthful. *"
            checked={isAttested}
            onPress={() => setIsAttested(!isAttested)}
          />
        </View>

      </ScrollView>

      {/* Footer (Exactly as you provided) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.buttonDisabled]}
          onPress={handleFinalSubmit}
          activeOpacity={canSubmit ? 0.8 : 1}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                SUBMIT FINAL REPORT
              </Text>
              <Feather name="send" size={18} color={!canSubmit ? COLORS.textMuted : COLORS.primary} style={{ marginLeft: 8 }}/>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- (Added styles for SectionHeader and EditButton)
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12, backgroundColor: COLORS.primary, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle, minHeight: 50 },
  backButton: { padding: 8, justifyContent: "center", alignItems: "center", width: 40, height: 40 },
  headerTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600", textAlign: "center" },
  scrollContent: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 150 },
  // Updated Section Title Area
  sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20, // Added margin top
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderSubtle,
  },
  sectionTitle: { color: COLORS.textLight, fontSize: 18, fontWeight: "600" }, // Style for title within header AND for OTP/Attestation sections
  editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.backgroundSubtle, // Example style
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 6,
  },
  editButtonText: { color: COLORS.secondary, fontSize: 13, fontWeight: '500', marginLeft: 5 },
  sectionContent: { backgroundColor: COLORS.backgroundSubtle, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 5, marginBottom: 25 },
  reviewRow: { flexDirection: "column", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
  reviewLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: "500", marginBottom: 4 },
  reviewValue: { color: COLORS.textLight, fontSize: 15, fontWeight: "400", lineHeight: 21 },
  verificationSection: { marginTop: 10, marginBottom: 15, paddingHorizontal: 5 }, // Contains OTP elements
  verificationSubtitle: { color: COLORS.textMuted, fontSize: 14, marginBottom: 15, lineHeight: 20 },
  inputBlock: { marginBottom: 15 }, // Used within OTP section
  label: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8, fontWeight: "500" }, // Used within OTP section
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBackground, borderRadius: 10, borderWidth: 1, borderColor: "#d0d0d0", minHeight: 50 }, // Used within OTP section
  phoneInputContainer: { /* Specific styles if needed */ }, // Used within OTP section
  input: { flex: 1, paddingVertical: Platform.OS === "ios" ? 14 : 12, paddingHorizontal: 16, fontSize: 16, color: COLORS.textDark }, // Used within OTP section
  phoneInput: { flexGrow: 1, flexShrink: 1 }, // Used within OTP section
  sendOtpButton: { backgroundColor: COLORS.secondary, paddingHorizontal: 15, height: 50, marginLeft: 8, justifyContent: "center", alignItems: "center", borderTopRightRadius: 9, borderBottomRightRadius: 9, minWidth: 100 }, // Used within OTP section
  sendOtpButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 }, // Used within OTP section
  verifyOtpButton: { backgroundColor: COLORS.secondary, paddingVertical: 14, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 10 }, // Used within OTP section
  verifyOtpButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 15 }, // Used within OTP section
  resendButton: { marginTop: 15, alignItems: "center" }, // Used within OTP section
  resendButtonText: { color: COLORS.secondary, fontSize: 14, textDecorationLine: "underline" }, // Used within OTP section
  verifiedContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, backgroundColor: 'rgba(0, 255, 0, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'green' }, // Used within OTP section
  verifiedText: { color: 'green', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }, // Used within OTP section
  errorText: { color: '#FF6B6B', fontSize: 14, marginTop: 8, textAlign: 'center' }, // Used within OTP section
  attestationContainer: { marginTop: 15, marginBottom: 20, paddingHorizontal: 5 },
  checkboxTouchable: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  checkboxIcon: { marginRight: 12 },
  checkboxLabel: { flex: 1, color: COLORS.textLight, fontSize: 15, lineHeight: 20, fontWeight: '500' },
  footer: { paddingVertical: 15, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20, backgroundColor: COLORS.primary, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  submitButton: { flexDirection: "row", backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 10, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 4 },
  submitText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16, textAlign: "center" },
  submitTextDisabled: { color: COLORS.textMuted },
  buttonDisabled: { opacity: 0.5, backgroundColor: '#cccccc' },
});

export default ReviewSubmitScreen;
