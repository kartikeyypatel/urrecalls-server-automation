import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '~/utility/utility';
import type { StackScreenProps } from '@react-navigation/stack';
import { LoginNavigatorParamList } from '~/navigators/login_navigator';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '../../../styles/colors'; // Adjust path if needed

const CURRENT_DATE_STR = "April 7, 2025";

export type TermsScreenProps = StackScreenProps<LoginNavigatorParamList, 'Terms'>;

function TermsAndConditions({ navigation, route }: TermsScreenProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  function accept() {
    if (!hasScrolledToEnd) return;

    if (route.params?.acceptance_callback) {
        route.params.acceptance_callback();
    }
    navigation.navigate('Signup');
  }

  function goBack() {
    navigation.goBack();
  }

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (hasScrolledToEnd) {
      return;
    }

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;

    const isScrollEndReached =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isScrollEndReached) {
      setHasScrolledToEnd(true);
    }
  }, [hasScrolledToEnd]);


  return (
    <SafeAreaView style={[{ backgroundColor: COLORS.primary, flex: 1 }]} edges={['top', 'left', 'right']}>
        <View style={customStyles.header}>
          <TouchableOpacity onPress={goBack} style={customStyles.backButton}>
              <Feather name="arrow-left" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={customStyles.headerTitle}>{t('terms_title') || 'Terms and Conditions'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={customStyles.contentContainer}>
            <ScrollView
                contentContainerStyle={customStyles.scrollContent}
                showsVerticalScrollIndicator={true}
                onScroll={handleScroll}
                scrollEventThrottle={160}
            >
                <Text style={customStyles.lastUpdatedText}>
                    Last Updated: {CURRENT_DATE_STR}
                </Text>

                <Text style={customStyles.termsText}>{t('terms_par1') || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suspendisse potenti nullam ac tortor vitae purus faucibus ornare suspendisse. Nibh praesent tristique magna sit amet purus gravida quis. Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est.'}</Text>
                <Text style={customStyles.termsText}>{t('terms_par2') || 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Imperdiet proin fermentum leo vel orci porta non pulvinar. Amet consectetur adipiscing elit duis tristique sollicitudin nibh sit. Viverra justo nec ultrices dui sapien eget mi. Eget duis at tellus at urna condimentum mattis pellentesque.'}</Text>
                <Text style={customStyles.termsText}>{t('terms_par3') || 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Morbi tincidunt augue interdum velit euismod in pellentesque massa. Purus sit amet volutpat consequat mauris nunc congue nisi. Sed nisi lacus sed viverra tellus in hac habitasse platea. Faucibus turpis in eu mi bibendum neque egestas congue.'}</Text>
                <Text style={customStyles.termsText}>{t('terms_par4') || 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nunc sed id semper risus in hendrerit gravida. Amet justo donec enim diam vulputate ut pharetra sit amet. Sed vulputate mi sit amet mauris commodo quis imperdiet massa. Condimentum vitae sapien pellentesque habitant morbi tristique senectus et netus. Ultricies integer quis auctor elit sed vulputate mi sit. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus.'}</Text>
                <Text style={customStyles.termsText}>{t('terms_par5') || 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Nulla porttitor accumsan tincidunt. Pellentesque in ipsum id orci porta dapibus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Donec sollicitudin molestie malesuada. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.'}</Text>
                {!hasScrolledToEnd && (
                    <View style={customStyles.scrollPrompt}>
                        <Feather name="arrow-down" size={16} color={COLORS.textMuted} />
                        <Text style={customStyles.scrollPromptText}>Scroll down to agree</Text>
                    </View>
                )}

            </ScrollView>

            <View style={customStyles.footer}>
                <TouchableOpacity
                    style={[
                        customStyles.agreeButton,
                        !hasScrolledToEnd && customStyles.agreeButtonDisabled
                    ]}
                    onPress={accept}
                    activeOpacity={hasScrolledToEnd ? 0.8 : 1}
                    disabled={!hasScrolledToEnd}
                >
                    <Text style={[
                        customStyles.agreeButtonText,
                        !hasScrolledToEnd && customStyles.agreeButtonTextDisabled
                    ]}>
                        {(t('terms_accept') || 'I Agree').toUpperCase()}
                    </Text>
                    <Feather
                        name="check"
                        size={18}
                        color={!hasScrolledToEnd ? COLORS.textMuted : COLORS.primary}
                        style={{ marginLeft: 8 }}/>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}

const customStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    minHeight: 50,
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  headerTitle: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  lastUpdatedText: {
      color: COLORS.textMuted,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 25,
  },
  termsText: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 23,
    textAlign: 'justify',
  },
  scrollPrompt: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      marginTop: 10,
      opacity: 0.7,
  },
  scrollPromptText: {
      color: COLORS.textMuted,
      fontSize: 14,
      marginLeft: 8,
      fontStyle: 'italic',
  },
  footer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  agreeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.submitButtonBackground,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    opacity: 1,
  },
  agreeButtonDisabled: {
      backgroundColor: COLORS.backgroundSubtle,
      opacity: 0.6,
      elevation: 0,
      shadowOpacity: 0,
  },
  agreeButtonText: {
    color: COLORS.submitButtonText,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  agreeButtonTextDisabled: {
      color: COLORS.textMuted,
  },
});

export default TermsAndConditions;