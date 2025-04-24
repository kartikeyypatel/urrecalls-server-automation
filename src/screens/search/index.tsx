import { useNavigation } from "@react-navigation/native";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Keyboard, View } from "react-native";
import {
  ActivityIndicator,
  Modal,
  Portal,
  Snackbar,
  TextInput,
  useTheme,
} from "react-native-paper";
import styles, { em, get_theme_color } from "styles/main_styles";
import {
  FTextInput,
  NormalText,
  PageViewNoScroll,
  Touchable,
} from "~/components/generic";
import { info, t } from "~/utility/utility";

/**
 * Props of the Search Screen.
 */
export type SearchScreenProps = {
  /**
   * Text for the search hint.
   * Example: Search for a drug product.
   */
  search_text: string;

  /**
   * Text that is used in the label of the search text input.
   * Example: Search drugs.
   */
  search_label: string;

  /**
   * Text that is used for the issues.
   * Changing it from Required to Optional for Removing it in some Pages
   */
  issue_text?: string;

  /**
   * Optional React component that is inserted into the
   * search text input's right slot.
   */
  search_input_right?: React.ReactNode;

  /**
   * Callback that is invoked when the searching starts.
   * @param search_query
   * @returns
   */
  search_try_start_callback: (search_query: string) => void;

  /**
   * Optional React component that represents an image of the the screen.
   */
  search_image?: React.ReactNode;

  /**
   * The list of data that will be rendered in the search screen.
   */
  data_list: React.ReactNode;
};

/**
 * Generic component for building search screens. Passes a forwardRef so that parents can
 * invoke functions on the Search Screen.
 * @returns
 */
export const SearchScreen = forwardRef((props: SearchScreenProps, ref) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const snackbar_duration = 5000;
  const [is_searching, set_is_searching] = useState<boolean>(false);
  const [successfully_searched, set_successfully_searched] =
    useState<boolean>(false);
  const [search_query, set_search_query] = useState<string>("");
  const [search_error, set_search_error] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    /**
     * Invoke to tell the search screen that searching has begun.
     */
    search_start() {
      info("Querying:", search_query);
      Keyboard.dismiss();
      set_is_searching(true);
    },

    /**
     * Invoke to tell the search screen that a successful search has been made.
     */
    search_success() {
      set_successfully_searched(true);
    },

    /**
     * Invoke to tell the search screen that the search has ended.
     */
    search_end() {
      set_is_searching(false);
    },

    /**
     * Invoke to tell the search screen that no results have been found in the search.
     */
    search_no_results() {
      set_search_error(true);
    },
  }));

  return (
    <PageViewNoScroll>
      <Portal>
        <Modal
          visible={is_searching}
          dismissableBackButton={false}
          contentContainerStyle={{
            ...styles.h_centered_container,
            ...styles.Container,
            backgroundColor: get_theme_color(theme, "surface"),
            paddingVertical: 1 * em,
            flexGrow: 0,
          }}
        >
          <ActivityIndicator />
        </Modal>
      </Portal>
      {!successfully_searched && props.search_image}
      <View style={{ flexGrow: 1 }}>
        {!successfully_searched && (
          <NormalText
            style={{ alignSelf: "center" }}
            text={props.search_text}
          />
        )}
        <FTextInput
          left={<TextInput.Icon icon={"magnify"} />}
          right={props.search_input_right}
          label={props.search_label}
          value={search_query}
          onChangeText={(text) => {
            set_search_query(text);
          }}
          returnKeyType="search"
          onSubmitEditing={() => {
            props.search_try_start_callback(search_query);
          }}
          blurOnSubmit={false}
        />
      </View>
      {props.data_list}
      {/* Will include the Issue Text only if Prompted/Required */}
      {props.issue_text && (
        <View
          style={{ marginBottom: em, display: "flex", justifyContent: "center" }}
        >
          <NormalText style={{ alignSelf: "center" }} text={t("needhelp")} />
          <Touchable
            style={{ alignSelf: "center" }}
            onPress={() => navigation.navigate("Issue")}
          >
            <NormalText
              style={{
                color: get_theme_color(theme, "primary"),
                fontWeight: "bold",
              }}
              text={props.issue_text}
            />
          </Touchable>
        </View>
      )}
      <Snackbar
        visible={search_error}
        duration={snackbar_duration}
        onDismiss={() => {
          set_search_error(false);
        }}
        style={{ backgroundColor: get_theme_color(theme, "surface") }}
      >
        <NormalText style={{ color: get_theme_color(theme, "onSurface") }}>
          {t("searchfail", { query: search_query })}
        </NormalText>
      </Snackbar>
    </PageViewNoScroll>
  );
});
