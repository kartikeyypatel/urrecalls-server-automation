import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, View } from "react-native";
import {
  SifterSearch,
  get_recall_status,
  get_sifter_token,
  ProductRecallInfos,
} from "~/network/network_request";
import { error, global, info, log, t } from "~/utility/utility";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NormalText, Touchable } from "~/components/generic";
import styles, { em, get_theme_color } from "styles/main_styles";
import {
  ActivityIndicator,
  MD3Theme,
  TextInput,
  useTheme,
} from "react-native-paper";
import FoodIcon, { foodToUrl } from "./FoodIcon";
import {
  FlatList,
  RefreshControl,
  Swipeable
} from "react-native-gesture-handler";
import {
  does_saved_product_match_item,
  getAllProducts,
  toggleSaveStatus,
} from "~/store";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from '~/navigators/main_navigator';
import { SearchScreen } from "../search";
import search_styles from "styles/search_styles";
import { interpolateColor } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type FoodsNavigationProps = StackNavigationProp<
  MainStackParamList,
  "Search"
>;

// Adding Types for Product and Recall Info via Search
type ProductInfo = {
  id: number;
  name: string;
  upc: string;
  primary_image: { image_path: string };
  [key: string]: any;
};

type RecallData = {
  recall_number: string;
  reason_for_recall: string;
  [key: string]: any;
};

type SearchResultType = {
  product_info: ProductInfo;
  recall_data?: RecallData[];
};


function FlatListSwipeAction(
  theme: MD3Theme,
  is_saved: boolean | undefined,
  progress: Animated.AnimatedInterpolation<string | number>
) {
  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [
      get_theme_color(theme, "surfaceVariant"),
      is_saved
        ? get_theme_color(theme, "errorContainer")
        : get_theme_color(theme, "secondaryContainer"),
      is_saved
        ? get_theme_color(theme, "error")
        : get_theme_color(theme, "primary"),
    ],
    extrapolate: "clamp",
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 1.2],
    extrapolate: "clamp",
  });

  const iconName = is_saved ? "bookmark-remove" : "bookmark-plus";

  return (
    <Animated.View
      style={{
        backgroundColor,
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 1.5 * em,
      }}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
        <MaterialCommunityIcons
          name={iconName}
          size={26}
          color={get_theme_color(theme, "onPrimary")}
        />
        <NormalText
          style={{
            color: get_theme_color(theme, "onPrimary"),
            fontWeight: "bold",
            fontSize: 1.1 * em,
          }}
        >
          {is_saved ? "Unsave" : "Save"}
        </NormalText>
      </Animated.View>
    </Animated.View>
  );
}


/**
 * Component representing the initial page to search for Food.
 * @returns
 */
export default function Foods() {
  const theme = useTheme();
  const navigation = useNavigation<FoodsNavigationProps>();
  const search_screen = useRef();

  //  To connect with sifter solutions api
  const [hasToken, set_has_token] = useState(global.token != undefined);

  //  The products the user saved in their history
  const saved_products = useRef<any[]>([]);

  //  The results of the Sifter Solutions query.
  const [results, setResults] = useState<SearchResultType[]>([]);

  const swipeable_refs = useRef<any[]>([]);

  /**
   * To handle infinite scrolling, the page number is tracked.
   */
  const [page_number, set_page_number] = useState(1);
  /**
   * The query that was used to search.
   */
  const [previous_query, set_previous_query] = useState("");

  /**
   * True if searching to add to the results.
   */
  const [is_paginating, set_is_paginating] = useState(false);
  /**
   * True as long as search results can be found through pagination.
   */
  const [can_paginate, set_can_paginate] = useState(true);

  //  When the user refreshes the search.
  const [refreshing, set_refreshing] = useState(false);

  //  Variables to force a rerender so the saved products are always accurate.
  const [flatlist_update, set_flatlist_update] = useState(false);
  const isFocused = useIsFocused();

  /**
   * Returns true if the saved products has a product with a specific id.
   * @param id
   * @returns
   */
  function saved_products_has_item(item: any) {
    if (!saved_products) return false;
    for (let i = 0; i < saved_products.current.length; i++) {
      if (
        does_saved_product_match_item(saved_products.current[i], "food", item)
      )
        return true;
    }

    return false;
  }

  /**
   * Fetches product data.
   */
  function get_all_data() {
    //  Also, fetch all data from storage to determine if products should be saved/unsaved
    getAllProducts(false, { type: "food", status: null }, 1, true).then(
      (data) => {
        let data_array: any[] = [];
        for (let i = 0; i < data.length; i++) {
          data_array.push(data[i]);
        }
        saved_products.current = data_array;
        //  Force the flatlist to rerender
        set_flatlist_update(!flatlist_update);
        log("Saved products", saved_products.current);
      }
    );
  }

  /**
   * Passes the product data to the details screen.
   * @param Pdata
   */
  function navigate_to_product_details(product_info: any, recall_data: any) {
    if (product_info == undefined && recall_data == undefined) {
      log("Trying to navigate with invalid data.");
      return;
    }
    //  Try a single search for data
    if (recall_data == undefined) {
      log(
        "Recall data hasn't been fetched yet, so try another fetch for just this data."
      );
      get_recall_status([
        {
          name: product_info.name,
          upc: product_info.upc,
        },
      ])
        .then((data) => {
          if (data == undefined) throw new Error("Recall Status is undefined");
          if (data.length != 1)
            throw new Error(
              "Recall data length does not match Product Info length."
            );

          recall_data = [];
          for (let i = 0; i < data[0].length - 1; i++) {
            recall_data.push(data[0][i]);
          }
          log("Fetched recall data:", recall_data);
          navigation.navigate("FoodDetails", {
            Pinfo: product_info,
            recallData: recall_data,
          });
        })
        .catch((e) => {
          error(e);
        });
    } else {
      navigation.navigate("FoodDetails", {
        Pinfo: product_info,
        recallData: recall_data,
      });
    }
  }

  /**
   * Search for food results.
   * @returns
   */
  function search_for_product(search_query: string, page_number: number) {
    if (search_query.trim() === "") {
      return;
    } else {
      set_previous_query(search_query);
      if (page_number == 1) {
        set_can_paginate(true);
      }
      //  Check if token still exists
      get_sifter_token();

      (search_screen.current as any).search_start();
      SifterSearch(search_query, "query", page_number)
        .then((results) => {
          //  Type is irrelevant ATM since we only care about Food and Drug products right now
          return {
            Pinfos: results.Pinfo,
            Type: results.Type,
            Query: search_query,
          };
        })
        .then((search_results) => {
          (search_screen.current as any).search_end();
          log("Sifter Solutions data: ", search_results.Pinfos);

          //  No Results
          if (search_results.Pinfos.length == 0) {
            //  If not paginating, then the results can be set to empty.
            if (page_number == 1) {
              setResults([]);
              (search_screen.current as any).search_no_results();
            }
            //  Otherwise if we are paginating, then setting the results to an
            //  empty array would wipe out the previously existing results
            else {
              set_can_paginate(false);
            }
            return;
          }

          let original_results: SearchResultType[] = [...results];

          //  Get the current results
          let results_array: SearchResultType[] = [];
          for (let i = 0; i < search_results.Pinfos.length; i++) {
            results_array.push({
              product_info: search_results.Pinfos[i],
            });
          }

          //  If this is the first page, just replace the all the search results
          if (page_number == 1) setResults([...results_array]);
          else setResults([...original_results, ...results_array]);

          //  Getting recall data
          let recall_statuses: ProductRecallInfos[] = [];
          for (let i = 0; i < search_results.Pinfos.length; i++) {
            recall_statuses.push({
              name: search_results.Pinfos[i].name,
              upc: search_results.Pinfos[i].upc,
            });
          }
          log("Recall status:", recall_statuses);
          get_recall_status(recall_statuses)
            .then((data) => {
              if (data == undefined)
                throw new Error("Recall Status is undefined");
              if (data.length != search_results.Pinfos.length)
                throw new Error(
                  "Recall data length does not match Product Info length."
                );
              for (let i = 0; i < data.length; i++) {
                if (data[i].length == 0) {
                  results_array[i].recall_data = [];
                  continue;
                }
                let recall_data: any[] = [];
                for (let j = 0; j < data[i].length - 1; j++) {
                  recall_data.push(data[i][j]);
                }
                results_array[i].recall_data = recall_data;
              }
              info("Sifter and FDA Results:", results_array);

              //  If this is the first page, just replace the all the search results
              if (page_number == 1) setResults([...results_array]);
              //  Otherwise add it to the array
              else setResults([...original_results, ...results_array]);
            })
            .catch((e) => {
              error(e);
            });
          log(search_results);

          (search_screen.current as any).search_end();
          (search_screen.current as any).search_success();
          set_refreshing(false);
          set_is_paginating(false);
        })
        .catch((e) => {
          (search_screen.current as any).search_end();
          set_refreshing(false);
          set_is_paginating(false);
          error(e);
          alert("Search failed");
        });
    }
  }

  // Creating a Helper Function for ToggleProduct
  function toggleProductSaveStatus(item: any) {
    const isSaved = saved_products_has_item(item);
    return toggleSaveStatus(isSaved, "food", item);
  }
  /**
   * Called when the user swipes on a product.
   */
  function on_product_swipe(index: number, item: any) {
    swipeable_refs.current[index].close();

    toggleProductSaveStatus(item)
      .then((success) => {
        if (!success) throw new Error("Failed to update product.");
        get_all_data();
      })
      .catch((e) => {
        error(e);
        get_all_data();
      });
  }

  /**
   * Component that renders for each product.
   * @param props
   * @returns
   */
  function FlatListItem(props: {
    item: SearchResultType;
    index: number;
    separators: {
      highlight: () => void;
      unhighlight: () => void;
      updateProps: (select: "leading" | "trailing", newProps: any) => void;
    };
  }): JSX.Element {
    const product_info: any = props.item.product_info;
    const recall_data: any = props.item.recall_data;

    const image_url = foodToUrl(product_info.primary_image.image_path);
    return (
      <Swipeable
        ref={(ref) => (swipeable_refs.current[props.index] = ref)}
        rightThreshold={2 * em}
        overshootRight={false}
        onSwipeableOpen={() => {
          on_product_swipe(props.index, product_info);
        }}
        renderRightActions={(progress) =>
          FlatListSwipeAction(
            theme,
            saved_products_has_item(product_info),
            progress
          )
        }
      >
        <View style={{ backgroundColor: get_theme_color(theme, "background") }}>
          <Touchable
            onPress={() => {
              navigate_to_product_details(product_info, recall_data);
            }}
          >
            <View style={{ flexDirection: "row", paddingVertical: 0.5 * em }}>
              <View
                style={{
                  flexDirection: "column",
                  alignSelf: "stretch",
                  justifyContent: "center",
                }}
              >
                <FoodIcon url={image_url} />
              </View>
              <View style={{ flex: 1, marginLeft: 1 * em }}>
                <NormalText numberOfLines={2} style={styles.bold}>
                  {product_info.name}
                </NormalText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {recall_data != undefined ? (
                    <NormalText
                      style={{
                        fontWeight: "bold",
                        color: get_theme_color(
                          theme,
                          recall_data.length == 0
                            ? "onSecondaryContainer"
                            : "onErrorContainer"
                        ),
                      }}
                    >
                      {t(
                        recall_data.length == 0
                          ? "notrecalled"
                          : "recalled"
                      )}
                    </NormalText>
                  ) : (
                    <ActivityIndicator />
                  )}
                </View>
                {/* <NormalText>{props.item.brand.name}</NormalText> */}
              </View>
            </View>
          </Touchable>
        </View>
      </Swipeable>
    );
  }

  //  When the component loads, try to get an API token from sifter search.
  //  We also get all the recall data.
  useEffect(() => {
    if (!hasToken) {
      get_sifter_token()
        .then((success) => set_has_token(success))
        .catch((error) => {
          alert(t("food_tokenerror"));
          set_has_token(error);
        });
    }
    get_all_data();
  }, []);

  useEffect(() => {
    //  When focused, needs to get the latest data.
    if (navigation.isFocused()) {
      console.log("refocusing", saved_products);
      get_all_data();
    }
  }, [isFocused]);

  //  Actual JSX
  if (!hasToken) {
    return <ActivityIndicator />;
  }
  return (
    <SearchScreen
      ref={search_screen}
      search_text={t("food_search")}
      search_label={t("food_searchlabel")}
      search_try_start_callback={(search_query: string) => {
        search_for_product(search_query, 1);
      }}
      search_input_right={
        <TextInput.Icon
          onPress={() => {
            setResults([]);
            set_page_number(1);
            set_can_paginate(true);
          }}
          icon={"close-circle"}
        />
      }
      search_image={
        <View style={{ ...styles.h_centered_container }}>
          <Image
            source={require("assets/inspi_search-prod.png")}
            style={{ ...search_styles.Image }}
          />
        </View>
      }
      data_list={
        results.length != 0 && (
          <FlatList
            data={results}
            extraData={[saved_products.current, flatlist_update]}
            renderItem={FlatListItem}
            keyExtractor={(item) => item.product_info.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  set_refreshing(true);
                  search_for_product(previous_query, 1);
                }}
              />
            }
            onEndReached={() => {
              //  Give up if a search is ongoing or no more results can be found.
              if (is_paginating || !can_paginate) {
                return;
              }
              search_for_product(previous_query, page_number + 1);

              set_is_paginating(true);
              set_page_number(page_number + 1);
            }}
            // triggers a bit earlier to avoid late loading
            onEndReachedThreshold={0.1}
          />
        )
      }
    />
  );
}
