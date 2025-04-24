// src/navigators/types.ts (or your equivalent types file)

// Used in ReportIncidentState
export interface ProductTypes {
  isOTC: boolean;
  isCompounded: boolean;
  isGeneric: boolean;
  isBiosimilar: boolean;
}

// For File Uploads (Optional - Keep if needed for other features)
export interface SelectedFileInfo {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}


// --- State Definitions for Refactored Screens ---

// Data collected on ReportIncidentScreen
export interface ReportIncidentState {
  // About Problem
  problemDescription: string;
  problemDate: string; // Added (MM/DD/YYYY)
  problemCause: 'ProductRelated' | 'DeviceRelated' | null; // Will be defaulted to 'ProductRelated'
  productPurchaseLocation: string;

  // About Product
  reportIsAbout: 'Cosmetic' | 'DietarySupplement' | 'FoodMedicalFood' | 'Other' | null;
  productName: string; // Added/Emphasized
  productExpirationDate: string; // Added (MM/DD/YYYY)
  //identifier: string;
  //category: string; 
  specifications: string; 
}

// Data collected on MedicalHistoryScreen
export interface MedicalHistoryState {
   // About Patient
   patientInitials: string;
   patientSex: 'Male' | 'Female' | null; // Label changed to Gender in UI
   patientKnownMedicalConditionsOrAllergies: string; // Added combined field
   patientSoughtMedicalAttention: boolean | null;

   // About Reporter
   reporterFirstName: string;
   reporterLastName: string;
   reporterEmail: string;
   reporterConfirmEmail: string;
}


// --- Navigation & Submission Types ---

// Combined data structure passed from MedicalHistoryScreen to ReviewSubmitScreen
export interface CombinedFormsData {
    problemAndProductData: ReportIncidentState;
    patientAndReporterData: MedicalHistoryState;
}

// Final payload for backend submission - adjusted fields
export interface SubmissionPayload {
    // Problem/Product Data
    problemDescription: string;
    problemDate: string; // Added
    problemCause: ReportIncidentState['problemCause']; // Still sent, defaulted if UI removed
    reportIsAbout: ReportIncidentState['reportIsAbout'];
    productName: string; // Added
    productExpirationDate: string; // Added
    productPurchaseLocation: string;
    //identifier: string; 
    //category: string; 
    specifications: string;


    // Patient Data
    patientInitials: string;
    patientSex: MedicalHistoryState['patientSex'];
    patientKnownMedicalConditionsOrAllergies: string; // Added combined field
    // Removed: patientAgeOrDob

    // Reporter Data
    reporterFirstName: string;
    reporterLastName: string;
    reporterEmail: string;

    // Submission Meta Data
    phoneNumberVerified: string; // From OTP verification in ReviewSubmitScreen
    attested: boolean; // From attestation checkbox in ReviewSubmitScreen
    submittedAt: string; // ISO timestamp generated during submission
    userId: string | null;
}


// --- Navigator Param List ---
// Defines all screens and their parameters within the Stack Navigator ('MainNavigator')
// Ensure this matches the name you use in your createStackNavigator generic type
export type RootStackParamList = {
  ReportIncident: { initialData?: ReportIncidentState } | undefined; // Optional initial data
  MedicalHistory: {
      problemAndProductData: ReportIncidentState; // Still required
      initialData?: MedicalHistoryState; // Optional initial data for this screen
  };
  ReviewSubmit: { combinedData: CombinedFormsData };
  // Add other screens from your RootStackParamList here
  Home: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  FoodDetails: { Pinfo: any; recallData: any };
  DrugDetails: { Pinfo: any; recallData: any };
};


// --- Removed Types (Commented out - Keep if used elsewhere in your app) ---
/*
export interface Address { ... }
export interface ProblemTypes { ... } // Note: This was different from the FDA form checkboxes
export interface PatientRace { ... }
export interface PatientDemographics { ... }
export interface ReporterOptions { ... }
*/

