James Gaiser (4/25/2024)
The following is the current understanding of the logical structure of `DrugsScreen.tsx`

# Inial Mounting
All the products that are currently saved on local storage are fetched.

On initial mounting, the Drug Screen shows the `SearchScreen` component. The search screen component handles common logic for searching.

# On focusing
When the component is focused (such as when the screen changes), the local storage is queried for any changes to the saved products.

# Searching
When the user searches for a product, the `search_for_product` callback is invoked. This sends a formatted search query to OpenFDA. This data is currently not hosted on AWS. Due to the nature of the search right now, only recalled products are being searched. The SearchScreen component's `forwardRef` is invoked to tell it the status of the search.

# Saving
Save statuses are based on the saved products fetched upon mounting / focusing. When a product is swiped, it will toggle it's save status in local storage.

# Details
When clicking on a product, the user is navigated to the details page. The product information of the selected product and its recall data is passed.
