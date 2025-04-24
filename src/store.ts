/*
The DB stores everything as a key-value pair.
Both keys and values are stored as strings.
We decided to use numbers as keys (even though its stored as strings)
since its easier to increment the keys

We store the most recently generated key in the DB with key set to "latest-key"
{"latest-key": <most-recently-generated-key>}
ex: {"latest-key": "274"}

When we have to increment the key, instead of going through all the keys,
finding the largest value and then incrementing it by 1
We can just read the value stored in "latest-key" and increment it by 1

Storing:
    1. Generate new key
    2. Store item in DB with new key
    3. Set value of "latest-key" to new key

@author Arjun, Daniel
*/

import AsyncStorage from "@react-native-async-storage/async-storage";
import { error, log } from "./utility/utility";

export type SavedItem = {
  id: string;
  description?: string;
  name?: string;
  type: string;
  image_path?: string;
};

const LATEST_KEY: string = "latest-key";
//  4/7/2024 - James, I have now made it 1000 😢
const PER_PAGE_LIMIT: number = 1000;
const CACHE_TTL: number = 10;

export type ProductType = "food" | "drug";

interface filterInterface {
  type: ProductType | null; // product type
  status: string | null; // recall status
}

// ---------------------- CRUD WRAPPERS ----------------------
/* CRUD Wrappers
In the event we change to another DB, replace the contents of the below functions
*/

async function writeDB(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error("writeDB: " + e);
  }
}

// TODO remove export
async function readDB(key: string): Promise<any | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("readDB: " + e);
    return null;
  }
}

async function deleteDB(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("deleteDB: " + e);
    return false;
  }
}

// ---------------------- KEYS RELATED ----------------------

export async function getLatestKey(): Promise<string> {
  let val: string | null = await readDB(LATEST_KEY);
  if (val == null) {
    return "0";
  }
  return val;
}

async function generateLatestKey(): Promise<string> {
  let updatedValue: string = (Number(await getLatestKey()) + 1).toString();
  return updatedValue;
}

export async function getAllKeys(onlyIDs: boolean = false): Promise<string[]> {
  // onlyIDs (true|false): If true, returns only numeric keys
  // In the event you require only the keys of the data stored
  // and not keys under which metadata is stored

  let keys: string[] = [];
  try {
    let dbKeys: readonly string[] = await AsyncStorage.getAllKeys();
    // TODO Any better way to assign readonly string[] to mutable?
    keys = dbKeys.slice();

    // Filter out only numeric values
    if (onlyIDs) {
      keys = keys.filter((value) => !isNaN(Number(value)));
    }
  } catch (e) {
    console.error("Error: getAllKeys: " + e);
  }
  return keys;
}

// * ProductType List Related

async function getProductTypeList(productType: ProductType): Promise<string[]> {
  let searchKey: string = productType + "-ids";
  let result: string[] | null = await readDB(searchKey);

  if (result == null) {
    let emptyList: string[] = [];
    console.log("getProductTypeList: Creating list for " + productType);
    await writeDB(searchKey, JSON.stringify(emptyList));
    return emptyList;
  } else {
    console.log("getProductTypeList: " + result);
    return result;
  }
}

async function addToProductTypeList(
  productType: ProductType,
  productKey: string
) {
  let productKeys: string[] = await getProductTypeList(productType);
  productKeys.push(productKey);
  let key: string = productType + "-ids";
  let jsonValue: string = JSON.stringify(productKeys);
  await writeDB(key, jsonValue);
}

async function removeFromProductTypeList(
  productType: ProductType,
  productKey: string
) {
  let productKeys: string[] = await getProductTypeList(productType);

  // ! Eww. anything simpler? @james
  // Basically remove element (productKey) from a list (productKeys)
  let i: number;
  for (i = 0; i < productKeys.length; i++) {
    if (productKeys[i] == productKey) {
      break;
    }
  }

  if (i != productKeys.length) {
    productKeys.splice(i, 1);
  }
}

// * Product Related

/**
 * Given a non saved product object, get what it's ID is supposed to be.
 * @param product
 * @param product_type
 * @returns
 */
export function get_product_id(
  product: any,
  product_type: ProductType
): string {
  switch (product_type) {
    case "food":
      return `f${product.id}`;
    case "drug":
      return `d${product.event_id + product.recall_number}`;
  }
}

/**
 * Given a saved product object, returns true if it matches a givem item.
 * @param product
 * @param product_type
 * @param id
 */
export function does_saved_product_match_item(
  product: any,
  product_type: ProductType,
  item: any
): boolean {
  switch (product_type) {
    case "food":
      return product.id == `f${item.id}`;
    case "drug":
      return product.id == `d${item.event_id + item.recall_number}`;
  }
}

export async function storeProduct(
  productType: ProductType,
  value: any,
  recallStatus: string | null
): Promise<boolean> {
  try {
    // set to true if you want to store minimal data as it makes testing easier
    let storeMinimal: boolean = true;
    switch (productType) {
      case "food":
        //  Key is not an actual field of data
        //  value = { key: key, id: value.id, type: productType, image_path: value.primary_image.image_path }
        value = {
          id: get_product_id(value, productType),
          image_path: value.primary_image.image_path,
          name: value.name,
        };
        break;
      case "drug":
        value = {
          id: get_product_id(value, productType),
          description: value.product_description,
        };
        break;
    }
    value["type"] = productType;

    //  Not necessary because both food and products
    //  because users need to refetch recall status
    //  to be accurate and up to date

    if (recallStatus != null) {
      value["recall_status"] = recallStatus;
    }

    let newKey: string = await generateLatestKey();
    const jsonValue = JSON.stringify(value);

    // idk, we may need this
    value["key"] = newKey;
    await writeDB(newKey, jsonValue);
    await writeDB(LATEST_KEY, newKey);
    await addToProductTypeList(productType, newKey);
  } catch (e) {
    console.error("Error: storeProduct: " + e);
    return false;
  }
  return true;
}

/**
 * Removes product from DB
 * @param productType (food|drug): Type of product
 * @param key: The DB key under which the data is stored
 * @returns
 */
export async function removeProduct(productType: ProductType, key: string) {
  let success: boolean = await deleteDB(key);
  if (success) {
    // Removes the key from the associated product list
    await removeFromProductTypeList(productType, key);
  }
}

export async function getProduct(key: string) {
  return await readDB(key);
}

export async function removeAllProducts(): Promise<boolean> {
  const keys = await getAllKeys();
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    console.error("Error: removeAllKeys: " + e);
    return false;
  }
  return true;
}

function customSort(a: string, b: string, desc: boolean = true): number {
  if (desc) {
    return parseInt(b) - parseInt(a);
  } else {
    return parseInt(a) - parseInt(b);
  }
}

// * ---------------- Bookmarks related ---------------------

// TODO Use this in cron job
export function fetchRecallStatus(object: any): any {
  // Get the recall status by making an API call to OpenFDA
  // TODO Add API call
  // getRecallStatusFromOpenFDA(product_id)
  let recallData: any = {};
  if (recallData.length == 0) {
    // TODO Set template to match that of Open FDA
    return { status: "not_recalled" };
  } else {
    return recallData;
  }
}

export function getProductRecallStatus(object: any): string {
  let lastUpdated: number = object["recall_status"]["last_updated"];
  let currentTime: number = Date.now();
  let timeMinutes: number = Math.round((currentTime - lastUpdated) / 60000);
  if (timeMinutes >= CACHE_TTL) {
    return fetchRecallStatus(object);
  }
  return object["recall_status"]["status"];
}

export function checkFilter(object: any, filter: filterInterface): boolean {
  if (object.recall_status == undefined) return true;

  let status: string = getProductRecallStatus(object);
  if (status != filter.status) {
    return false;
  }
  return true;
}

/**
 * Returns all the data from storage
 * @param sortDesc (true|false) : Sorts the keys in DESC order if true, else ASC
 * @param filter
    - filter.type (food | drug): Filters based on product type
    - filter.status (not_recalled | ongoing | recalled): Filters based on recall status
 * @param page (1|2|...|999): Gets the nth set of items
 * @param fetch_all true if all data is wanted
 * @returns 
 */
export async function getAllProducts(
  sortDesc: boolean = true,
  filter: filterInterface | null,
  page: number = 1,
  fetch_all: boolean = false
): Promise<string[]> {
  let keys: string[];

  if (filter != null && filter.type != null) {
    // BUG There is some bug where getting products by filtered type is not working properly.
    keys = await getProductTypeList(filter.type);
  } else {
    keys = await getAllKeys(true);
  }

  keys.sort((a, b) => customSort(a, b, sortDesc));
  //   if (filter != null && filter.status != null) {}
  let results: string[] = [];
  let count: number = 0;
  let i: number = (page - 1) * PER_PAGE_LIMIT;
  let object: any | null;
  let matches_filter: boolean = true;

  while (i < keys.length && (count < PER_PAGE_LIMIT || fetch_all)) {
    object = await readDB(keys[i]);
    if (object != null) {
      matches_filter = true;
      if (filter != null) {
        matches_filter = checkFilter(object, filter);
      }

      if (matches_filter == true) {
        results.push(object);
        count++;
      }
    }

    i++;
  }
  return results;
}

/**
 * Given a list of keys, delete the first instance of a product with that id.
 * @param keys
 * @param id
 * @returns a promise that will evaluate to true if a product was deleted and false otherwise.
 */
async function deleteProductByKeyFromKeyList(
  keys: string[],
  id: string | number
): Promise<boolean> {
  console.log("deleteProductByKeyFromKeyList:");
  for (let i = 0; i < keys.length; i++) {
    let product = await readDB(keys[i]);
    if (product.id == id) {
      removeProduct(product.type, keys[i]);
      return true;
    }
  }
  return false;
}

/**
 * Deletes a product by its id.
 * @param id
 * @returns a promise that evaluates to true if a product was deleted successfully.
 */
export async function deleteProductByID(id: string): Promise<Boolean> {
  return getAllKeys()
    .then((keys) => deleteProductByKeyFromKeyList(keys, id))
    .then((success) => success) //  why is this line here?
    .catch((e) => {
      error(e);
      return false;
    });
}

/**
 * Given a product and it's save status (whether the user has saved it to their tracked products or not)
 * it will be appropriately saved if it isn't tracked and unsaved if it is tracked.
 * @param is_saved the save status
 * @param item the product
 * @param recallData whether the product was recalled or not
 * @returns a promise that evaluates to true if a product was saved/deleted successfully.
 */
export async function toggleSaveStatus(
  is_saved: boolean,
  type: ProductType,
  item: any
): Promise<Boolean> {
  if (is_saved) {
    log("Trying to remove item from saved products.");
    return deleteProductByID(get_product_id(item, type))
      .then((success) => {
        if (!success) throw Error("Failed to delete item.");
        return true;
      })
      .catch((e) => {
        error(e);
        return false;
      });
  } else {
    log("Trying to add item to saved products.");
    return storeProduct(type, item, null)
      .then((success) => {
        if (!success) throw Error("Failed to save item.");
        return true;
      })
      .catch((e) => {
        error(e);
        return false;
      });
  }
}
