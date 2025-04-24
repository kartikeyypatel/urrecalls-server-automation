import { StyleSheet } from "react-native";
import { em } from "./main_styles";

/**
 * The styling for the search screen.
 */
export const search_styles = StyleSheet.create({
    ImageContainer: {
        borderRadius: 12 * em,
        marginVertical: 2 * em,
    },
    /**
     * Styling for screen image.
     */
    Image: {
        width: 8 * em,
        height: 8 * em,
        margin: 1.25 * em,
    }
});
  
/**
 * The stylesheet for search screen.
 */
export default search_styles;
  