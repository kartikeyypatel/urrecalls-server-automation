James Gaiser (4/25/2024)
The following is the current understanding of the logical structure of `FoodsScreen.tsx`

# Inial Mounting
Upon mounting, the FoodsScreen component tries to connect to our Food information provider (SifterSolutions). See `useEffect`. While the token is being fetched, a loading symbol (`ActivityIndicator`) is displayed. On completion, an access token is retrieved and stored globally. Additionally, all the products that are currently saved on local storage are fetched.

On initial mounting, the Food Screen shows the `SearchScreen` component. The search screen component handles common logic for searching.

# On focusing
When the component is focused (such as when the screen changes), the local storage is queried for any changes to the saved products.

# Searching
When the user searches for a product, the `search_for_product` callback is invoked. This sends a formatted search query to SifterSolutions. Upon a successful search, the recall data is then asynchronously fetched from the AWS server. This data is identical to what can be found through OpenFDA. The SearchScreen component's `forwardRef` is invoked to tell it the status of the search.

# Pagination
When the user scrolls all the way to the bottom of the search results, the page number increases and new products are searched for.

# Saving
Save statuses are based on the saved products fetched upon mounting / focusing. When a product is swiped, it will toggle it's save status in local storage.

# Details
When clicking on a product, the user is navigated to the details page. The product information of the selected product and its recall data is passed.
