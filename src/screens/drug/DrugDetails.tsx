import { LoginNavigatorParamList } from "~/navigators/login_navigator";
import { StackScreenProps } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { View, GestureResponderEvent } from 'react-native'
import { getAllKeys, storeProduct, getAllProducts, removeProduct, fetchRecallStatus, deleteProductByID, toggleSaveStatus, get_product_id } from '~/store'
import { LargeText, NormalText, PageView, Touchable } from '~/components/generic'
import styles, { em, get_theme_color } from 'styles/main_styles'
import { error, i18n, info, log, t } from '~/utility/utility'
import { Card, Divider, Modal, Portal, useTheme } from 'react-native-paper'
import FoodIcon from '~/screens/food/FoodIcon'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { foodToUrl } from '~/screens/food/FoodIcon'
import { MainStackParamList } from "~/navigators/main_navigator";

/**
 * Helper function to parse recall data's initiation date into a more human readable format.
 */
function recall_data_parse_initiation_date(recall_initiation_date: string) {
    //  OpenFDA's date returns in the format YYYYMMDD
    let date = new Date(
        Number(recall_initiation_date.substring(0, 4)),     //  year
        Number(recall_initiation_date.substring(4, 6)) - 1, //  month index
        Number(recall_initiation_date.substring(6, 8)));    //  day
    try {
        let formatter = new Intl.DateTimeFormat(i18n.locale);
        return formatter.format(date);
    }
    catch {
        //  default to english US time format.
        let formatter = new Intl.DateTimeFormat("en-US");
        return formatter.format(date);
    }

}

export type DrugDetailsScreenProps = StackScreenProps<MainStackParamList, "DrugDetails">;

export default function DrugDetails({navigation, route}: DrugDetailsScreenProps) {
  //  const item = route.params.Pinfo;
  const { recallData } = route.params;
  //  Due to the weird way we handle drugs right now (we query only from openFDA)
  //  we always have recall data. So compared to foods, we need to check if status = "ongoing"
  const [isRecalled, setIsRecalled] = useState((recallData.status as string).toLowerCase() == "ongoing");
  const [modal_visible, set_modal_visible] = useState(false);
  const [modal_text, set_modal_text] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const theme = useTheme();
 
  //  On mounting, determine if the product is saved or not.
  useEffect(()=>{
    log("Trying to check if product is saved.");
    getAllProducts(undefined, {type: "drug", status: null}, 1, true)
    .then((data)=>{
      let found_match = false;
      let this_id = get_product_id(recallData, "drug");
      for(let i = 0; i < data.length; i++) {
        let food_id = (data[i] as any).id;
        if(food_id == this_id) {
          found_match = true;
          break;
        }
      }
      log(`Product is${found_match ? "" : " not"} found`);
      setIsSaved(found_match);
    })
  }, []);

  function toggleSaved() {
    toggleSaveStatus(isSaved, "drug", recallData)
    .then((success) => {
      if(!success)
        throw Error("Failed to update product's save status.");
      setIsSaved(!isSaved);
    })
    .catch((e) => {
      error(e);
    });
  }

  type RecallInformationProps = {
    title: string,
    /**
     * If content exists, content is rendered over contentString
     */
    contentString?: string
    content?: React.ReactNode
    tooltip?: string,
    onPress?: (((event: GestureResponderEvent) => void) & ((e: GestureResponderEvent) => void))
  }
  function RecallInformation({title, content, contentString, tooltip, onPress}: RecallInformationProps) {
    return (
    <Touchable onPress={onPress != undefined ? onPress : ()=>{
      set_modal_visible(true); 
      set_modal_text(tooltip != undefined ? tooltip : "")
    }}>
      <Card style={{paddingBottom: 1*em, borderRadius: 0}}>
        <Card.Title title={<LargeText style={{ fontWeight: 'bold' }}>{title}</LargeText>}/>
        <Card.Content>
          { content != undefined ? content : contentString != undefined && <NormalText>{contentString}</NormalText>}
        </Card.Content>
      </Card>
    </Touchable>
    );
  }

  return (
    <PageView contentContainerStyle={{justifyContent: "flex-start"} as any}>
      {/* The modal for showing information about recall data attributes. */}
      <Portal>
        <Modal visible={modal_visible} onDismiss={()=>{set_modal_visible(false)}} 
          contentContainerStyle={{
            ...styles.h_centered_container,
            ...styles.Container,
            backgroundColor: get_theme_color(theme, "surface"),
            paddingVertical: 1*em,
            flexGrow: 0}}>
          <NormalText style={{color: get_theme_color(theme, "onSurface")}}>{modal_text}</NormalText>
        </Modal>
      </Portal>
      {/* The food's image and product name container */}
      <View style={{ marginTop: 1*em, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <View style={{flexDirection: "column"}}>
          <MaterialCommunityIcons
            name={"pill"}
            color={get_theme_color(theme, "onBackground")}
            size={em * 3}
            style={{
              width: 4*em, height: 4*em, aspectRatio: 1, borderRadius: 1*em
            }}
          />
        </View>
        <View style={{ marginLeft: 1*em, flexDirection: "column", flexGrow: 1, flexShrink: 1}}>
          <LargeText style={{fontWeight: "bold"}}>{recallData.recalling_firm}</LargeText>
          {/* <NormalText>{recallData}</NormalText> */}
        </View>
      </View>
      <Touchable 
        onPress={()=>{toggleSaved()}} 
        style={{
          ...styles.h_centered_container, 
          marginVertical: em, 
          backgroundColor: get_theme_color(theme, isRecalled ? "errorContainer" : "primaryContainer")
        }}
      >
        <View style={{flexGrow: 1, flexDirection:"row", paddingHorizontal: 1*em, paddingVertical: 0.5*em}}>
          <MaterialCommunityIcons
            name={isSaved ? "star" : "star-plus"}
            color={get_theme_color(theme, isSaved ? "primary" : "secondary")}
            size={em * 2}
            style={{marginRight: 1*em}}
          />
          <LargeText 
            style={{
              fontWeight: "bold",
              color: get_theme_color(theme, isRecalled ? "onErrorContainer" : "onPrimaryContainer")}}>
            { 
              isRecalled ? t("detailsrecalled").toUpperCase() :
              t("detailsnotrecalled").toUpperCase()
            }
          </LargeText>
        </View>
      </Touchable>
      {/* Initiation Date */}
      <RecallInformation 
        title={t("fooddetails_initiationdate")} 
        contentString={recall_data_parse_initiation_date(recallData.recall_initiation_date)} 
        tooltip={t("fooddetails_initiationdate_tooltip")}/>
      {/* Product Description */}
      <RecallInformation 
          title={t("fooddetails_description")} 
          contentString={recallData.product_description} 
          tooltip={t("fooddetails_description_tooltip")}/>
      {/*  Recall Reason */}
      <RecallInformation 
        title={t("fooddetails_reasonrecall")} 
        contentString={recallData.reason_for_recall} 
        tooltip={t("fooddetails_reasonrecall_tooltip")}/>
      {/*  Classification of degree of health hazard  */}
      <RecallInformation 
        title={t("fooddetails_classification")} 
        contentString={recallData.classification} 
        tooltip={t("fooddetails_classification_tooltip")}/>
      {/*  Distribution Locations */}
      <RecallInformation 
        title={t("fooddetails_distributionlocations")} 
        contentString={recallData.distribution_pattern} 
        tooltip={t("fooddetails_classification_tooltip")}/>
    </PageView>
  )
}