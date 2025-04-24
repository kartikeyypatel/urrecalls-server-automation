import { error, global, info, log, warn } from "~/utility/utility";

const token_get_url = `https://apidev.sifter.network/connect/v1.1/token`;
const token_refresh_url = `https://apidev.sifter.network/connect/v1.1/token/refresh`;
const product_search_url = `https://apidev.sifter.network/connect/v1.1/products/search`;
const product_recall_search_url = `http://44.206.244.120:5000/allProductsRecallInfo`;
/**
 * The number of food products fetched per search.
 */
export const food_count_per_search = 10;

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type SifterSearchType = {
  Pinfo: any;
  Type: string;
};

/**
 * Updates the global variable with the access token. Returns true on a success and false otherwise.
 */
export async function get_sifter_token(): Promise<boolean> {
  let success: boolean = false;

  //  Only try to retrieve a token if there is less than a minute left.
  if (
    global.expires_in != undefined &&
    global.expires_in.getTime() - Date.now() > 60
  ) {
    info(
      `Token has not expired yet. Will expire in ${
        global.expires_in.getTime() - Date.now()
      } seconds`
    );
    return false;
  }

  //  Refresh token did not expire yet
  if (
    global.expires_in != undefined &&
    Date.now() < global.expires_in.getTime()
  ) {
    success = await refresh_token()
      .then((token_response) => {
        global.token = token_response.access_token;
        global.refresh_token = token_response.refresh_token;

        //  Converting seconds to expire to date.
        global.expires_in = new Date(
          Date.now() + token_response.expires_in * 1000
        );
        log("Token expires in", global.expires_in.getTime() - Date.now());
        return true;
      })
      .catch((e) => {
        error(e);
        return false;
      });
    if (success) return true;
  }

  //  If reached here, then the refresh token failed.
  return await access_token()
    .then((token_response) => {
      global.token = token_response.access_token;
      global.refresh_token = token_response.refresh_token;

      //  Converting seconds to expire to date.
      global.expires_in = new Date(
        Date.now() + token_response.expires_in * 1000
      );
      log(
        "Token expires in",
        (global.expires_in.getTime() - Date.now()) / 1000,
        "seconds"
      );
      return true;
    })
    .catch((e) => {
      error(e);
      return false;
    });
}

/**
 * Returns a Promise that may contain the Sifter Connect access token.
 * @returns
 */
function access_token(): Promise<TokenResponse> {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key":
        "5yuLmXk4hQu6fvJSnxcn5vEAJid7rkh2Cf4kRWMyYzbir2QAuqXbdNjMY73T58QN",
    },
  };
  return fetch(token_get_url, options)
    .then((response) => {
      if (response.status == 200) return response.json();
      else {
        error("Status code:", response.status, response.statusText);
        throw new Error("Failed to fetch token: " + response.statusText);
      }
    })
    .then((data) => {
      info("Retrieved new access token. Expiring in", data.expires_in);
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      } as TokenResponse;
    });
}

/**
 * Returns a Promise that may contain Sifter Connect access token using a refresh token.
 * @returns
 */
function refresh_token(): Promise<TokenResponse> {
  const options = {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      refresh_token: global.refresh_token,
    }),
  };

  return fetch(token_refresh_url, options)
    .then((response) => {
      if (response.status == 200) return response.json();
      else {
        error("Status code:", response.status, response.statusText);
        throw new Error("Failed to fetch token: " + response.statusText);
      }
    })
    .then((data) => {
      info("Refreshing access token. Expiring in", data.expires_in);
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      } as TokenResponse;
    });
}

/**
 * Returns a search request to the SifterSearch food database.
 * @param search_term
 * @param searchType
 * @param page_number
 * @returns
 */
export async function SifterSearch(
  search_term: string,
  searchType: "query" | "upc",
  page_number: number
): Promise<SifterSearchType> {
  //  Get the sifter token first.
  await get_sifter_token();

  //Search based off of a search term
  let result: SifterSearchType;
  let response_status: number;
  let options;

  log("Sifter_Search:", search_term, searchType, page_number);
  if (searchType === "query") {
    options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Bearer " + global.token,
      },
      body: JSON.stringify({
        diet_must_match: "none",
        fields: [
          "item_type",
          "brand",
          "ingredient_text",
          "id",
          "name",
          "primary_image",
          "upc",
        ],
        page: page_number,
        size: food_count_per_search,
        zipcode: null,
        q: search_term,
      }),
    };
  }
  //Search based off upc (search_term = upc)
  else {
    options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + global.token,
      },
      body: JSON.stringify({
        fields: [
          "item_type",
          "brand",
          "ingredient_text",
          "id",
          "name",
          "primary_image",
          "upc",
        ],
        refinements: [{ value: [search_term], name: "upc", op: "_in" }],
      }),
    };
  }

  const response = await fetch(product_search_url, options);
  response_status = response.status;
  result = { Pinfo: (await response.json()).results, Type: "rfoods" };

  switch (response_status) {
    case 400:
      throw Error("Invalid request.");
    case 404:
      throw Error("Resource not found.");
    case 500:
      throw Error("API server is down.");
  }
  return result;
}

/**
 * The type of the arguments to get the recall status.
 */
export type ProductRecallInfos = {
  name: string;
  upc: string[];
};

/**
 * Get the recall statuses for a list of products.
 * Recall statuses are returned as an array of arrays, where the ith recall status
 * corresponds to the ith product in the input array.
 * If an object is an empty array, it means no recall data was found.
 * If the object is an nonempty array, its recall data is found in the range (0, length - 1).
 * @param product_recall_infos
 * @returns
 */
export async function get_recall_status(
  product_recall_infos: ProductRecallInfos[]
): Promise<any[] | undefined> {

  // Configure the request
  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify the content type as JSON
    },
    body: JSON.stringify(product_recall_infos),
  };
  log(requestOptions);
  // Make the POST request
  return await fetch(product_recall_search_url, requestOptions)
    .then((response) => {
      // Check if the request was successful (status code 200)
      log("Response body", response);
      if (response.ok) {
        return response.json();
      } else {
        error(response);
        throw new Error("POST request failed");
      }
    })
    .then((data) => {
      if((data.data as any[]).length == 0) {
        warn("Something seems wrong. This is what data looks like:", data);
      };
      return data.data as any[];
    })
    .catch((e) => {
      error(e);
      return undefined;
    });
}

export async function drug_search(product_name: string): Promise<any[]> {
  const urls = [
    `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.product_ndc:%22${encodeURIComponent(
      product_name
    )}%22&limit=1000`,
    `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.package_ndc:%22${encodeURIComponent(
      product_name
    )}%22&limit=1000`,
    `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+product_description:%22${encodeURIComponent(
      product_name
    )}%22&limit=1000`,
    `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.generic_name:%22${encodeURIComponent(
      product_name
    )}%22&limit=1000`,
    `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.substance_name:%22${encodeURIComponent(
      product_name
    )}%22&limit=1000`,
  ];
  let failed = true;
  for (const url of urls) {
    const response = await fetch(url);
    log(url ,"'sresponse:", response);

    if (!response.ok) {
      continue;
    }

    failed = false;

    const data = await response.json();
    log("Received data:", data);

    if (data.results && data.results.length > 0) {
      return data.results;
    }
  }
  //  If all the links failed, then there was an error.
  if (failed) 
    log("Could not find any data.");
  //  Otherwise no recall data was found.
  return [];
}

export async function SifterSearchByID(id: string): Promise<SifterSearchType> {
  const api_url = `https://apidev.sifter.network/connect/v1.1/products?id=${id}&fields=`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + global.token,
    },
  };

  try {
    const response = await fetch(api_url, options);
    if (!response.ok)
      throw new Error("Failed to fetch data: " + response.statusText);

    const data = await response.json();
    //log("Sifter Search by ID Results:", data);
    if (data.results && data.results.length > 0) {
      return { Pinfo: data.results[0], Type: "rfoods" };
    } else {
      return { Pinfo: {}, Type: "rfoods" };
    }
  } catch (e) {
    error("Sifter Search by ID Error:", e);
    return { Pinfo: {}, Type: "rfoods" };
  }
}
