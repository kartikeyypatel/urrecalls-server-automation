// API key: ZzwjPbjkrRQbSkIYsHcfN9m58hPgRs53dZ1afstz
/* 

*/
import React, { Component } from 'react';
import { Text, FlatList, View, Button, StyleSheet, ActivityIndicator } from "react-native";

export default async function Page(Pinfo, Type) {

  // try {
  //   const response = await fetch('https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"&limit=1000');
  //   const jsonone = await response.json();

  //   const responsetwo = await fetch('https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"&skip=1000&limit=1000');
  //   const jsontwo = await responsetwo.json();

  //   const oneresults = Object.values(jsonone.results);
  //   const tworesults = Object.values(jsontwo.results);

  //   const results = oneresults.concat(tworesults);

  //   const recallData = recallSearch(Pinfo, results)
  //   return {Pinfo: Pinfo, Type: Type, recallData: recallData}
  // } catch (error) {
  //  console.log(error);
  // } 

  try {


    const url = 'http://44.206.244.120:5000/getTheProduct'


    // Data to send in the POST request (if any)
    const data = {
      name: Pinfo.name,
      upc: Pinfo.upc
    };

    // Configure the request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Specify the content type as JSON
      },
      body: JSON.stringify(data) // Convert data to JSON string
    };

    // Make the POST request
    fetch(url, requestOptions)
      .then(response => {
        // Check if the request was successful (status code 200)
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('POST request failed');
        }
      })
      .then(data => {

        if (data['received_data'] && data['received_data'].length > 0) {
          console.log('POST request successful!');
          console.log('Response:', data);

          return {
            Pinfo: Pinfo,
            Type: Type,
            recallData: [data['received_data'][0]]
          }
        }
      })
      .catch(error => {
        return {
          Pinfo: Pinfo,
          Type: Type,
          recallData: []
        }
      });

    return {
      Pinfo: Pinfo,
      Type: Type,
      recallData: []
    }



  } catch (error) {
    return {
      Pinfo: Pinfo,
      Type: Type,
      recallData: []
    }
  }
}

function calculateMatchingPercentage(itemNameToCheck, paraToCheckItem) {
  // Regex to get the words splitted with Capital Start space special characters etc
  const itemWords = itemNameToCheck.match(/[A-Z]?[a-z]+|[^,\s]+/g);
  const paraWords = paraToCheckItem.match(/[A-Z]?[a-z]+|[^,\s]+/g);

  // Count the number of matching words
  let matchingCount = 0;
  for (let itemWord of itemWords) {
    for (let paraWord of paraWords) {
      if (itemWord.toLowerCase() === paraWord.toLowerCase()) {
        matchingCount++;
        break;
      }
    }
  }

  // Calculate the percentage of matching words
  const accuracy = (matchingCount / itemWords.length);
  return accuracy; // Return the percentage with two decimal places
}

function tryAndCheckIfUPCMatches(paragraph, sifterUPC) {
  // Regex to find 12 and 14 digit UPC number with . and - in between some series of numbers
  regexStr = /\b\d{1}[- ]*\d{5}[- ]*\d{5}[- ]*\d{1}\b|\b\d{1}[- ]*\d{5}[- ]*\d{5}[- ]*\d{1}\b|\b\d{12}\b|\b\d{14}\b/g

  const guessForUPC = paragraph.match(regexStr);

  if (guessForUPC != null && guessForUPC.length > 0) {
    for (let item of guessForUPC) {
      if (item == sifterUPC) {
        return true;
      }
    }
  }
  // If not present UPC or match UPC with sifter one return false
  return false;
}

function recallSearch(Pinfo, array) {

  var item = Pinfo
  var results = [];
  array.forEach(element => {

    for (let i = 0; i < item.upc.length; i++) {
      // Check if Sifter UPCs match UPC in product_description
      if (tryAndCheckIfUPCMatches(element.product_description, item.upc[i])) { // Check if UPC is in product_description
        if (!results.includes(element)) {

          results.push([element, 1]);
          break;
        }
      }
      // Check if Sifter UPCs match UPC in reason_for_recall
      if (tryAndCheckIfUPCMatches(element.reason_for_recall, item.upc[i])) {
        if (!results.includes(element)) {
          results.push([element, 1]);
        }
      }
    }

    // check the matching accuracy for the product name in the product_description 
    const ACCEPTED_ACCURACY = 0.6
    accuracy = calculateMatchingPercentage(item.name, element.product_description)
    if (accuracy > ACCEPTED_ACCURACY) {
      if (!results.includes(element)) {
        results.push([element, accuracy]);
      }
    }
    // check the matching accuracy for the product name in the reason_for_recall
    accuracy = calculateMatchingPercentage(item.name, element.reason_for_recall)
    if (accuracy > ACCEPTED_ACCURACY) {
      if (!results.includes(element)) {
        results.push([element, accuracy]);
      }
    }

  });

  // return the product with maximum accuracy
  var maxMatchingPercentage = 0.0, matchedElement;
  results.forEach(element => {

    if (element[1] > maxMatchingPercentage) {
      maxMatchingPercentage = element[1]
      matchedElement = element[0]
    }
  }
  );
  if (matchedElement) {
    results = [matchedElement]
  }

  return results;
}

/*class Page extends Component {
  constructor(props){
    super(props)
        this.state = {
            Pinfo: this.props.navigation.state.params.Pinfo,
            Type: this.props.navigation.state.params.Type,
            recallData: null,
            dataone: null,
            datatwo: null
        };
  }
    async recallQuery() {
      //var item = this.state.Pinfo;
        //console.log(item.upc);
        console.log(this.state.Pinfo);
      try {
       const key = "ZzwjPbjkrRQbSkIYsHcfN9m58hPgRs53dZ1afstz"

       const response = await fetch('https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"&limit=1000');
       const jsonone = await response.json();

       const responsetwo = await fetch('https://api.fda.gov/food/enforcement.json?search=status:"Ongoing"&skip=1000&limit=1000');
       const jsontwo = await responsetwo.json();

       const oneresults = Object.values(jsonone.results);
       const tworesults = Object.values(jsontwo.results);

       const results = oneresults.concat(tworesults);
       //console.log(results.length)

       console.log(this.recallSearch(results));
       
       this.setState({dataone: oneresults});
       this.setState({datatwo: tworesults});

       this.setState({recallData: this.recallSearch(results)});

     } catch (error) {
       console.log(error);
     } finally {
       this.setState({ isLoading: false })
     }
   }

    recallSearch(array) {
      var item = this.state.Pinfo;
      const results = [];
      array.forEach(element => {
        if (element.reason_for_recall.toLowerCase().includes(item.brand.name.toLowerCase())) { // Check if item brand is in reason for recall
          if (!results.includes(element)) {
            results.push(element);
          } 
        }
        if (element.reason_for_recall.toLowerCase().includes(item.name.toLowerCase())) { // Check if item name is in reason for recall
          if (!results.includes(element)) {
            results.push(element);
          }
        }
        for (let i = 0; i < item.upc.length; i++) { // Check if Sifter UPCs match UPC in Recall data
          if (element.product_description.includes(item.upc[i])) { // Check if UPC is in product_description
            if (!results.includes(element)) {
              results.push(element);
            }
          }
          if (element.code_info.includes(item.upc[i])) { // Check if UPC is in code_info
            if (!results.includes(element)) {
              results.push(element);
            }
          }
        }
        if (element.product_description.toLowerCase().includes(item.name.toLowerCase())) { // Check if item.name in product_description
          if (!results.includes(element)) {
            results.push(element);
          }
        }
        if (element.product_description.toLowerCase().includes(item.brand.name.toLowerCase())) { // Check if item brand is in product_description
          if (!results.includes(element)) {
            results.push(element);
          }
        }
        if (element.recalling_firm.toLowerCase().includes(item.brand.name.toLowerCase())) { // Check if item brand is the recalling firm
          if (!results.includes(element)) {
            results.push(element);
          }
        }
      });
      return results;
   }



    componentDidMount() {
    this.recallQuery();
    }
    render() {
      if (this.state.recallData != null) {
        return (
          <View style={{ flex: 1, padding: 24 }}>
            {this.state.isLoading ? <ActivityIndicator/> : (
              //console.log("Recall Information: " + JSON.stringify(this.state.recallData))
              this.props.navigation.navigate('Detail',{Pinfo: this.state.Pinfo, Type: this.state.Type, recallData: this.state.recallData})
            )}
          </View>
        );
      }
    }

}

export default Page*/ 