import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { NormalText, TextButton, Touchable } from "~/components/generic";
import {
  getAllProducts,
  deleteProductByID,
  SavedItem,
  toggleSaveStatus,
  ProductType,
} from "~/store";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import styles, { em, get_theme_color } from "styles/main_styles";
import {
  Snackbar,
  useTheme,
  ActivityIndicator,
  Menu,
  Modal,
  Portal,
} from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import FoodIcon, { foodToUrl } from "../food/FoodIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import Page from "~/FDAtest";
import { log, error, t } from "~/utility/utility";
import {
  SifterSearchByID,
  get_recall_status,
  ProductRecallInfos,
} from "~/network/network_request";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const SavedScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  //Filter-related states
  const [nameFilterVisible, setNameFilterVisible] = useState(false);
  const [typeFilterVisible, setTypeFilterVisible] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  //data-related states
  const [data, setData] = useState<Item[]>([]);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackBarVisible, setSnackbarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // To check if the screen is focused. IT IS BEING USED.
  const isFocused = useIsFocused();

  //  To force the flat list to rerender, we use a boolean state variable
  //  that flips when a rerender is needed.
  const [rerender_list_flag, update_rerender_list_flag] = useState(false);

  //  On focus, refetch data
  useEffect(() => {
    //  When focused, needs to get the latest data.
    if (navigation.isFocused()) {
      console.log("Saved page is focused, refetching data.");
      fetchData();
    }
  }, [navigation.isFocused(), nameFilter, typeFilter]);

  type Item = {
    recall_status: any[];
  } & SavedItem;

  const fetchData = async (
    filterByName = nameFilter,
    filterByType = typeFilter
  ) => {
    try {
      setIsLoading(true);
      let rawData = await getAllProducts(sortDesc, null, 1, true);
      log("Name Filter: ", filterByName);
      log("Type Filter: ", filterByType);
      let filteredData: any[] = rawData;
      if (filterByName) {
        filteredData = filteredData.filter((item: any) => {
          if (
            item.type.toLowerCase() === "food" &&
            typeof item.name === "string"
          ) {
            return item.name.toLowerCase().includes(filterByName.toLowerCase());
          } else if (
            item.type.toLowerCase() === "drug" &&
            typeof item.description === "string"
          ) {
            return item.description
              .toLowerCase()
              .includes(filterByName.toLowerCase());
          }
          return false;
        });
      }

      if (filterByType) {
        filteredData = filteredData.filter((item: Item) =>
          item.type.toLowerCase().includes(filterByType.toLowerCase())
        );
      }

      filteredData = filteredData.map((item: Item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        image_path: item.image_path,
        recall_status: [],
      }));
      let recall_statuses: ProductRecallInfos[] = [];
      for (let i = 0; i < filteredData.length; i++) {
        const results = await SifterSearchByID(
          filteredData[i].id.replace(/f/g, "")
        );
        recall_statuses.push({
          name: results.Pinfo.name,
          upc: results.Pinfo.upc,
        });
      }
      //log("Recall Statuses history: ", recall_statuses);
      Promise.all(recall_statuses).then((recall_statuses) => {
        get_recall_status(recall_statuses)
          .then((data) => {
            setIsLoading(false);
            //log("FDA Data: ", data);
            if (data == undefined)
              throw new Error("Recall Status is undefined");
            if (data.length != recall_statuses.length)
              throw new Error(
                "Recall data length does not match Product Info length."
              );
            for (let i = 0; i < data.length; i++) {
              if (data[i].length == 0) {
                filteredData[i].recall_status = [];
                continue;
              }
              let recall_data: any[] = [];
              for (let j = 0; j < data[i].length - 1; j++) {
                recall_data.push(data[i][j]);
              }
              filteredData[i].recall_status = recall_data;
            }
            setData(filteredData);
            setIsLoading(false);
            log("Data fetched successfully.", data);
          })
          .catch((e) => {
            error(e);
          });
      });
    } catch (e) {
      error(e);
    } finally {
      update_rerender_list_flag(!rerender_list_flag);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const onDismissSnackBar = async () => {
    setSnackbarVisible(false);
    log("Snackbar dismissed.");
  };

  /**
   * Handles the deletion of an item.
   * @param item
   * @returns
   */
  const handleDelete = async (item: Item) => {
    try {
      await deleteProductByID(item.id);
      log("Deletion successful for ID:", item.id);
    } catch (e) {
      error("Failed to finalize deletion: ", e);
    }
    setDeleteItem(item); // Clear after deletion
    setSnackbarVisible(true); // Show the snackbar with the undo option
    setData((currentData) =>
      currentData.filter((currentItem) => currentItem.id !== item.id)
    ); // Remove the item from the list
  };

  /**
   * Handles the undo delete action.
   * @returns
   */
  const handleUndoDelete = async () => {
    log("Undo Delete Item: ", deleteItem);
    if (deleteItem) {
      try {
        const results = await SifterSearchByID(deleteItem.id.replace(/f/g, ""));
        toggleSaveStatus(false, deleteItem.type as ProductType, results.Pinfo)
          .then((success) => {
            if (!success) throw new Error("Failed to update product.");
          })
          .catch((e) => {
            error(e);
          });
      } catch (e) {
        error("Failed to undo delete: ", e);
      }
      setData((currentData) => [deleteItem, ...currentData]);
      setDeleteItem(null);
    } else {
      log("No item to undo delete");
    }
  };

  /**
   * Navigates to the product details screen for the given ID.
   * @param id
   * @returns
   */
  async function navigate_to_product_details(item: Item) {
    try {
      if (item.type != "food") {
        log("Item is not a food item.");
        return;
      }
      //log("Navigating to product details for ID: ", id.toString());
      const searchResult = await SifterSearchByID(item.id.replace(/f/g, ""));
      if (!searchResult.Pinfo || Object.keys(searchResult.Pinfo).length === 0) {
        log("No product found for the given ID.");
        return;
      }

      const pageResults = await Page(searchResult.Pinfo);
      //log("FDATest Success: ", pageResults);

      navigation.navigate("FoodDetails", {
        Pinfo: pageResults.Pinfo,
        recallData: item.recall_status,
      });
    } catch (e) {
      error("Failed to navigate to product details: ", e);
    }
  }

  /**
   * Renders the right actions for the swipeable.
   * @param item
   * @returns
   */
  const renderRightActions = (item: Item) => {
    return (
      <View
        style={{
          width: 5 * em,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{
            width: 50 * em,
            height: "100%",
            backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders the item in the list.
   * @param param0
   * @returns
   */
  const renderItem = ({ item }: { item: Item }) => (
    <Swipeable
      friction={2}
      rightThreshold={60}
      renderRightActions={() => renderRightActions(item)}
      dragOffsetFromRightEdge={120}
    >
      <Touchable
        onPress={
          item.type == "food"
            ? () => {
                navigate_to_product_details(item);
              }
            : undefined
        }
      >
        <View
          style={{
            backgroundColor: get_theme_color(theme, "background"),
            paddingVertical: 1.25 * em,
            paddingHorizontal: 2 * em,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignSelf: "stretch",
              justifyContent: "center",
            }}
          >
            {item.type == "food" && item.image_path ? (
              <FoodIcon url={foodToUrl(item.image_path)} />
            ) : (
              <MaterialCommunityIcons
                name={"pill"}
                color={get_theme_color(theme, "onBackground")}
                size={em * 3}
                style={{
                  width: 4 * em,
                  height: 4 * em,
                  aspectRatio: 1,
                  borderRadius: 1 * em,
                }}
              />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 1 * em }}>
            <NormalText
              numberOfLines={2}
              style={{
                color: get_theme_color(theme, "onPrimaryContainer"),
                fontWeight: "bold",
              }}
              text={item.type == "food" ? item.name : item.description}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.recall_status != undefined ? (
                <NormalText
                  style={{
                    fontWeight: "bold",
                    color: get_theme_color(
                      theme,
                      item.recall_status.length == 0
                        ? "onSecondaryContainer"
                        : "onErrorContainer"
                    ),
                  }}
                >
                  {t(
                    item.recall_status.length == 0 ? "notrecalled" : "recalled"
                  )}
                </NormalText>
              ) : (
                <View>
                  <ActivityIndicator />
                </View>
              )}
            </View>
          </View>
        </View>
      </Touchable>
    </Swipeable>
  );

  /**
   * Renders the empty list component.
   * @returns
   */
  const renderEmptyList = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: get_theme_color(theme, "background"),
      }}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <NormalText
          style={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {t("no_items_saved")}
        </NormalText>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.Page}>
      <Portal>
        <Modal
          visible={nameFilterVisible}
          dismissable={true}
          dismissableBackButton={true}
          onDismiss={() => setNameFilterVisible(false)}
        >
          <View
            style={{
              backgroundColor: get_theme_color(theme, "primaryContainer"),
              borderRadius: 20,
              padding: 35,
              maxWidth: "80%",
              alignSelf: "center",
            }}
          >
            <TextInput
              style={{
                marginBottom: 15,
                textAlign: "center",
                color: get_theme_color(theme, "onPrimaryContainer"),
              }}
              onChangeText={setNameFilter}
              onSubmitEditing={() => setNameFilterVisible(false)}
              value={nameFilter}
              placeholder="Enter name to filter"
            />
            <View style={{ flexDirection: "row", paddingLeft: em }}>
              <TextButton
                onPress={() => {
                  setNameFilter("");
                  setNameFilterVisible(false);
                }}
              >
                {t("saved_clear")}
              </TextButton>
            </View>
          </View>
        </Modal>
      </Portal>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: (1 / 2) * em,
          paddingBottom: em,
          paddingHorizontal: em,
        }}
      >
        <TextButton
          onPress={() => setNameFilterVisible(true)}
          style={{ width: em * 8 }}
        >
          <Text>{t("saved_filter_name")}</Text>
        </TextButton>
        <Menu
          visible={typeFilterVisible}
          onDismiss={() => setTypeFilterVisible(!typeFilterVisible)}
          anchor={
            <TextButton
              onPress={() => setTypeFilterVisible(true)}
              style={{ width: em * 8 }}
            >
              {t("saved_filter_type")}
            </TextButton>
          }
          contentStyle={{
            backgroundColor: get_theme_color(theme, "background"),
            borderRadius: em,
          }}
        >
          <Menu.Item
            onPress={() => {
              setTypeFilter("");
              setTypeFilterVisible(false);
            }}
            title="All"
          />
          <Menu.Item
            onPress={() => {
              setTypeFilter("food");
              setTypeFilterVisible(false);
            }}
            title="Food"
          />
          <Menu.Item
            onPress={() => {
              setTypeFilter("drug");
              setTypeFilterVisible(false);
            }}
            title="Drug"
          />
        </Menu>
        <TouchableOpacity
          onPress={() => {
            setData((prevData) => [...prevData].reverse());
            setSortDesc(!sortDesc);
          }}
        >
          <View>
            {sortDesc ? (
              <Icon
                name="chevron-up-circle"
                size={2.5 * em}
                color={get_theme_color(theme, "primary")}
              />
            ) : (
              <Icon
                name="chevron-down-circle"
                size={2.5 * em}
                color={get_theme_color(theme, "primary")}
              />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileScreen")}
          style={{ alignSelf: "stretch" }}
        >
          <View style={{ justifyContent: "flex-end" }}>
            <Icon
              name="person-circle"
              size={2.5 * em}
              color={get_theme_color(theme, "onPrimaryContainer")}
            />
          </View>
        </TouchableOpacity>
      </View>
      <NormalText style={{ paddingLeft: 2 * em, fontWeight: "bold" }}>
        {t("Saved_title")}
      </NormalText>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={data}
          extraData={[rerender_list_flag]}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Snackbar
        visible={snackBarVisible}
        duration={5000}
        onDismiss={onDismissSnackBar}
        action={{
          label: "Undo",
          onPress: () => {
            handleUndoDelete();
          },
        }}
      >
        {t("saved_undo")}
      </Snackbar>
    </SafeAreaView>
  );
};
