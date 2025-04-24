import React, { useEffect, useRef, useState } from "react";
import { Animated, View} from "react-native";
import { drug_search,} from "~/network/network_request";
import { error, log, t } from "~/utility/utility";
import { useIsFocused, useNavigation, } from "@react-navigation/native";
import { NormalText, Touchable } from "~/components/generic";
import styles, { em, get_theme_color } from "styles/main_styles";
import { MD3Theme, useTheme } from "react-native-paper";
import Page from "~/FDAtest";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { does_saved_product_match_item, getAllProducts, toggleSaveStatus } from "~/store";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainTabParamList } from "~/navigators/main_navigator";
import { SearchScreen } from "../search";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import search_styles from "styles/search_styles";
import { Image } from "react-native-elements";

export type DrugsNavigationProps = StackNavigationProp<MainTabParamList, "DrugsScreen">;

/**
 * Component that renders when the swipeable is slid to the left
 * @param id 
 * @param progress 
 * @param drag 
 * @returns 
 */
function FlatListSwipeAction(theme: MD3Theme, is_saved: boolean | undefined,
  progress: Animated.AnimatedInterpolation<string | number>
) {
  //  Full color at 40% of the width
  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.4, Number.MAX_SAFE_INTEGER],
    outputRange: [ get_theme_color(theme, "surfaceVariant"), get_theme_color(theme, "surface"), get_theme_color(theme, "surface")],
    extrapolate: "clamp"
  });
  return (
    <Animated.View style={[{ backgroundColor}]}>
      <View style={{flexGrow: 1, flexDirection: "column", justifyContent: "center", alignItems: "flex-end"}}>
        <NormalText style={{color: get_theme_color(theme, "onSurface"), fontSize: 1.5*em, alignSelf: "flex-end", marginHorizontal: 1*em}}>
          {is_saved ? "Unsave" : "Save"}
        </NormalText>
      </View>
    </Animated.View>
  );
};

/**
 * Component representing the initial page to search for Drugs.
 * @returns 
 */
export default function Drugs() {  
  const navigation = useNavigation<DrugsNavigationProps>();
  const theme = useTheme();
  const search_screen = useRef();

  const saved_products = useRef<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  //  Variables to force a rerender so the saved products are always accurate.
  let swipeable_refs: any[] = [];

  const [flatlist_update, setFlatlist_update] = useState(false);
  const isFocused = useIsFocused();
  
  /**
   * Returns true if the saved products has a product with a specific id.
   * @param item 
   * @returns 
   */
  function saved_products_has_item(item: string) {
    if(!saved_products) return false;
    for(let i = 0; i < saved_products.current.length; i++) {
      if (does_saved_product_match_item(saved_products.current[i], "drug", item)) return true;
    }
    
    return false;
  }

  function navigate_to_product_details(recall_data: any) {
    if (recall_data == undefined) {
      log("Trying to navigate with invalid data.");
      return;
    }
    navigation.navigate("DrugDetails", {
      recallData: recall_data
    });
  }

  /**
   * Fetches saved drug data.
   */
  function get_all_data() {
    //  Also, fetch all data from storage to determine if products should be saved/unsaved
    getAllProducts(false, {type: "drug", status: null}, 1, true)
    .then((data)=>{
      let data_array: any[] = [];
      for(let i = 0; i < data.length; i++) {
        data_array.push(data[i])
      }
      saved_products.current = data_array;
      //  Force the flatlist to rerender
      setFlatlist_update(!flatlist_update);
      log("Saved drugs", saved_products.current)
    })
    .catch((e) => {
      error(e);
    });
  }

  /**
   * Search for drug results.
   * @returns 
   */
  function search_for_product(search_query: string) {
    if (search_query.trim() === "") {
      return;
    }
    else {
      (search_screen.current as any).search_start();
      drug_search(search_query)
      .then((results) => {
        (search_screen.current as any).search_end();
        if(results.length == 0) {
          setResults(results);
          (search_screen.current as any).search_no_results();
          log("No results found.");
          return;
        }
        else {
          setResults(results);
          (search_screen.current as any).search_end();
          (search_screen.current as any).search_success();
          log(results);
        }
        
      })
      .catch((e) =>{
        (search_screen.current as any).search_end();
        error(e);
      });
    }
  };

  /**
   * Called when the user swipes on a product.
   */
  function on_product_swipe(index: number, item: any) {
    swipeable_refs[index].close();

    toggleSaveStatus(saved_products_has_item(item), "drug", item)
    .then((success)=>{
      if(!success)
        throw new Error("Failed to update product.");
      get_all_data();
    })
    .catch((e) => { 
      error(e);
      get_all_data();
    });
  }

  function FlatListItem(props : {
    item: any,
    index: number,
    separators: {
      highlight: () => void
      unhighlight: () => void,
      updateProps: (select: 'leading' | 'trailing', newProps: any) => void
    }
  }): JSX.Element {
    return (
      <Swipeable
        ref={ref => swipeable_refs[props.index] = ref}
        rightThreshold={2*em}
        overshootRight={false}
        onSwipeableOpen={()=>{on_product_swipe(props.index, props.item)}}
        renderRightActions={(progress)=>FlatListSwipeAction( 
          theme,
          saved_products_has_item(props.item),
          progress
        )}
      >
        <View style={{backgroundColor: get_theme_color(theme, "background")}}>
          <Touchable onPress={()=>{
            navigate_to_product_details(props.item);
          }}>
            <View style={{flexDirection: "row", paddingVertical: .5 * em}}>
              <View style={{flexDirection: "column", alignSelf: "stretch", justifyContent: "center"}}>
                <MaterialCommunityIcons
                  name={"pill"}
                  color={get_theme_color(theme, "onBackground")}
                  size={em * 3}
                  style={{
                    width: 4*em, height: 4*em, aspectRatio: 1, borderRadius: 1*em
                  }}
                />
              </View>
              <View style={{flex: 1, marginLeft: 1*em}}>
                <NormalText numberOfLines={2} style={styles.bold}>{props.item.product_description}</NormalText>
              </View>
            </View>
          </Touchable>
        </View>
      </Swipeable>
    );
  }

  useEffect(()=>{
    get_all_data();
  }, []);

  useEffect(() => {
    //  When focused, needs to get the latest data.
    if (navigation.isFocused()) {
      console.log("refocusing", saved_products)
      get_all_data();
    }
  }, [isFocused]);

  return (
    <SearchScreen
      ref={search_screen}
      search_text={t("drug_search")}
      search_label={t("drug_searchlabel")}
      issue_text={t("drug_issue")}

      search_try_start_callback={search_for_product}
      search_image={
        <View style={{...styles.h_centered_container}}>
          <Image source={require("assets/Drugs_blue.png")} style={{...search_styles.Image}}/>
        </View>
      }
      data_list={results.length != 0 &&  
        <FlatList
          data={results}
          extraData={[saved_products.current, flatlist_update]}
          renderItem={FlatListItem}
          keyExtractor={(item) => item.recall_number.toString()}
        />
      }
    />
  );
}
