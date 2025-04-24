// File to search for drugs and display the results
import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default class DrugsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pname: '',
            searchResults: [],
            isLoading: false,
            error: null,
            recentSearches: []
        };

        // Binding functions to the component instance
        this.updatePName = this.updatePName.bind(this);
        this.searchDrug = this.searchDrug.bind(this);
        this.onRecentSearchSelect = this.onRecentSearchSelect.bind(this);
        this.loadRecentSearches = this.loadRecentSearches.bind(this);
    }

    componentDidMount() {
        this.loadRecentSearches();
    }

    updatePName(pname) {
        this.setState({ pname });
    }

    searchDrug = async () => {
        const { pname } = this.state;
        this.saveSearchQuery(pname); 
        this.setState({ recentSearches: [] }); // Clear recent searches

        const urls = [
          `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.product_ndc:%22${encodeURIComponent(pname)}%22&limit=1000`,
          `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.package_ndc:%22${encodeURIComponent(pname)}%22&limit=1000`,
          `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+product_description:%22${encodeURIComponent(pname)}%22&limit=1000`,
          `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.generic_name:%22${encodeURIComponent(pname)}%22&limit=1000`,
          `https://api.fda.gov/drug/enforcement.json?search=status:%22Ongoing%22+AND+openfda.substance_name:%22${encodeURIComponent(pname)}%22&limit=1000`
      ];
  
      this.setState({ isLoading: true, error: null, searchResults: [] });
      console.log("Starting search for:", pname);
  
      let all404 = true;
      for (const url of urls) {
          console.log("Fetching URL:", url);
          try {
              const response = await fetch(url);
              console.log("Received response:", response);
  
              if (!response.ok) {
                  if (response.status !== 404) {
                      throw new Error('Server Error, please check your input and try again.');
                  } 
                  continue; // Continue to the next URL on 404
              }
  
              all404 = false; // If any URL does not return 404, update the flag
  
              const data = await response.json();
              console.log("Received data:", data);
  
              if (data.results && data.results.length > 0) {
                  this.setState({ searchResults: data.results, isLoading: false });
                  return; // Data found, exit the loop
              }
          } catch (error) {
              console.error('Fetch error:', error);
              this.setState({ error: error.message, isLoading: false });
              return; // Exit the loop on non-404 errors
          }
      }
  
      if (all404) {
          this.setState({ error: 'Recall could not be found', isLoading: false });
      } else if (!this.state.searchResults.length) {
          this.setState({ error: 'No results found', isLoading: false });
      }
  }

  saveSearchQuery = async (newQuery) => {
    try {
        // Check if the query is not just a blank character and not empty
        if (newQuery.trim() !== '') {
            // Retrieve existing queries
            const existingQueries = await AsyncStorage.getItem('recentSearches');
            let searches = existingQueries ? JSON.parse(existingQueries) : [];

            // Check if the new query already exists in the recent searches
            if (!searches.includes(newQuery)) {
                // Add the new query
                searches.unshift(newQuery);

                // Keep only the latest five queries
                searches = searches.slice(0, 5);

                // Save the updated queries back to AsyncStorage
                await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
            }
        }
    } catch (error) {
        console.error('Error saving search query:', error);
    }
};


loadRecentSearches = async () => {
    try {
        const searches = await AsyncStorage.getItem('recentSearches');
        const recentSearches = searches ? JSON.parse(searches) : [];
        this.setState({ recentSearches });
    } catch (error) {
        console.error('Error retrieving recent searches:', error);
    }
};

onRecentSearchSelect(query) {
    this.updatePName(query);
}

    render() {
      const { pname, searchResults, isLoading, error, recentSearches } = this.state;

      const renderHeader = () => (
        <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeaderCell}>Substance Name</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Reason for Recall</Text>
            <Text style={styles.tableHeaderCell}>Product Description</Text>
        </View>
    );

      return (
          <SafeAreaView style={styles.container}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Drug Name or NDC"
                        placeholderTextColor="gray"
                        value={pname}
                        onChangeText={this.updatePName}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={this.searchDrug}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>
                {!isLoading && !error && recentSearches.length > 0 && (
                    <View style={styles.recentSearchesContainer}>
                        <Text style={styles.text}>Recent Searches:</Text>
                        <FlatList
                            data={recentSearches}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => this.onRecentSearchSelect(item)}>
                                    <Text style={styles.recentSearchText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
                {isLoading && <ActivityIndicator size="large" color="#0e729e" />}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
            {!isLoading && !error && searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.resultText}>{item.openfda.substance_name ? item.openfda.substance_name.join(', ') : 'N/A'}</Text>
                                <Text style={styles.resultText}>{item.status}</Text>
                                <Text style={styles.resultText}>{item.reason_for_recall}</Text>
                                <Text style={styles.resultText}>{item.product_description}</Text>
                            </View>
                        )}
                        ListHeaderComponent={renderHeader}
                    />
                </View>
            )}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e729e',
        padding: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginRight: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        color: 'black',
    },
    searchButton: {
        backgroundColor: '#bbd753',
        padding: 10,
        borderRadius: 5,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d9dde2',
        padding: 8,
    },
    tableCell: {
        flex: 1,
        color: 'white',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    recentSearchesContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    recentSearchText: {
        color: '#0e729e',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#d9dde2',
    },
    resultsContainer: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
    },
    tableRowHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d9dde2',
        padding: 8,
        backgroundColor: 'white',
    },
    tableHeaderCell: {
        flex: 1,
        fontWeight: 'bold',
        color: 'black',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d9dde2',
        padding: 8,
    },
    resultText: {
        flex: 1,
        color: '#0e729e',
    },
});
