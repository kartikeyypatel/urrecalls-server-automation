import React from "react";
import { ScrollView,View, Text,FlatList, Button,TouchableOpacity,TextInput, StyleSheet, Platform, Image } from "react-native";

export default class Home extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            data: global.data,
            goods: '',
            foods: '',
            drugs: '',
            cars: '',
            response: false
    }
};
    UserPost = (Pdata, type) => {
        this.props.navigation.navigate('Post',{Info: Pdata, Type: type});
        console.log(Pdata);
        
      }

    
   

    componentWillMount = () => {        
        const url = ['http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetAllGoodsIssues',
            'http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetAllFoodIssues',
            'http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetAllDrugIssues',
            'http://ec2-34-227-36-231.compute-1.amazonaws.com/general/GetAllCarsIssues'
        ];
          
           //good issues
            var xhttp = new XMLHttpRequest()
            var that = this;
            xhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200){
                    var data = this.responseText
                    //console.log(data)
                    //User Verified is the response from the server
                      //data = JSON.parse(data)
                        that.setState({  goods: data})
                     
                }
            };
            xhttp.open("POST",  url[0],true);
            xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhttp.send();

            //food issues
            var xhttp2 = new XMLHttpRequest()
            var that = this;
            xhttp2.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200){
                    var data = this.responseText
                    //User Verified is the response from the server
                        that.setState({  foods: data })
                     
                }
            };
            xhttp2.open("POST",  url[1],true);
            xhttp2.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhttp2.send();

            //drug issues
            var xhttp3 = new XMLHttpRequest()
            var that = this;
            xhttp3.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200){
                    var data = this.responseText
                    //User Verified is the response from the server
                        that.setState({  drugs: data })
                     
                }
            };
            xhttp3.open("POST",  url[2],true);
            xhttp3.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhttp3.send();

            //car issues
            var xhttp4= new XMLHttpRequest()
            var that = this;
            xhttp4.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200){
                    var data = this.responseText
                    //User Verified is the response from the server
                        that.setState({  cars: data,
                            response: true })
                     
                }
            };
            xhttp4.open("POST",  url[3],true);
            xhttp4.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhttp4.send();

          }
    render() {
    if(this.state.response){
        var issues_goods = []
        var issues_foods = []
        var issues_drugs = []
        var issues_cars = []
        
        if(this.state.goods != '')
            issues_goods = JSON.parse(this.state.goods);
        if(this.state.foods != '')
            issues_foods = JSON.parse(this.state.foods);
        if(this.state.drugs != '')
            issues_drugs = JSON.parse(this.state.drugs);
        if(this.state.cars != '')
            issues_cars = JSON.parse(this.state.cars); 
       
        return (
            <View style={styles.container}>
                <View style={styles.rectangle27 }>
                    <Image source={require('assets/Logo.png')} style={{width:180,height:140}} />
                </View> 
                
                <ScrollView style = {styles.recalls}>
                     {issues_goods.map((item => {
                    return (
                    <React.Fragment key={item.id}>
                        <TouchableOpacity onPress = {this.UserPost.bind(this,
    item, 'igoods')}>
                            <View style={styles.goodsBanner}>
                              <Text style={styles.BannerText}>  Goods Issue:   {item.title}</Text>
                            </View>
                            <View style={styles.itemInfo}>
                                {/* <Image source={item.image} style={{width:120,height:130}} /> */}
                               <Text style={styles.tex}>
                                   <Text style={{fontWeight: "bold"}}>
                                           Name: {item.name+"\n"}
                                           {/* Description: {item.description+"\n"} */}
                                           UPC: {item.UPC + "\n"}
                                           Date: {item.date+ "\n"}
                                    </Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </React.Fragment>
                       
                        );}
                     ))}
                     
                  {issues_foods.map((item => {
                    return (
                    <React.Fragment key={item.id}>
                        <TouchableOpacity onPress = {this.UserPost.bind(this,
    item, 'ifoods')}>
                            <View style={styles.foodsBanner}>
                              <Text style={styles.BannerText}>  Food Issue:   {item.title}</Text>
                            </View>
                            <View style={styles.itemInfo}>
                                {/* <Image source={item.image} style={{width:120,height:130}} /> */}
                               <Text style={styles.tex}>
                                   <Text style={{fontWeight: "bold"}}>
                                           Name: {item.name+"\n"}
                                           {/* Description: {item.description+"\n"} */}
                                           UPC: {item.UPC + "\n"}
                                           Date: {item.date+ "\n"}
                                    </Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </React.Fragment>
                       
                        );}
                     ))}
                      {issues_drugs.map((item => {
                    return (
                    <React.Fragment key={item.id}>
                        <TouchableOpacity onPress = {this.UserPost.bind(this,
    item, 'idrugs')}>
                            <View style={styles.drugBanner}>
                              <Text style={styles.BannerText}>  Drug Issue:   {item.title}</Text>
                            </View>
                            <View style={styles.itemInfo}>
                                {/* <Image source={item.image} style={{width:120,height:130}} /> */}
                               <Text style={styles.tex}>
                                   <Text style={{fontWeight: "bold"}}>
                                           Name: {item.name+"\n"}
                                           {/* Description: {item.description+"\n"} */}
                                           NDC: {item.UPC + "\n"}
                                           Date: {item.date+ "\n"}
                                    </Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </React.Fragment>
                       
                        );}
                     ))}
                     {issues_cars.map((item => {
                    return (
                    <React.Fragment key={item.id}>
                        <TouchableOpacity onPress = {this.UserPost.bind(this, item, 'icars')}>
                            <View style={styles.carBanner}>
                              <Text style={styles.BannerText}>  Car Issue:   {item.title}</Text>
                            </View>
                            <View style={styles.itemInfo}>
                                {/* <Image source={item.image} style={{width:120,height:130}} /> */}
                               <Text style={styles.tex}>
                                   <Text style={{fontWeight: "bold"}}>
                                           Make: {item.make+"\n"}
                                           Model: {item.model+"\n"}
                                           Year: {item.year + "\n"}
                                           {/* Description: {item.description+"\n"} */}
                                           Date: {item.date+ "\n"}
                                    </Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </React.Fragment>
                       
                        );}
                     ))}  
               </ScrollView>
                   
          </View> 
        );
    
}
else return null;
}
    
}


const styles = StyleSheet.create({

    itemInfo: {
        //marginTop: 24,
        //marginLeft: 6,
        marginRight: 135,
        //marginBottom: 24,
        flex: 0,
        flexDirection: 'row',
        backgroundColor: '#d9dde2',
        width: '100%',
        // height: '25%'
    },
    tex: {
        marginLeft: 12,
        width: '70%',
        height: 127,
        fontSize: 15
    },
    carBanner: {
        backgroundColor: '#f79d2e',
        opacity: 0.9
    },
    drugBanner: {
        backgroundColor: '#d3cc3b',
        opacity: 0.9
    },
    goodsBanner: {
        backgroundColor: '#0e729e',
        opacity: 0.7
    },
    foodsBanner: {
        backgroundColor: '#bbd753',
        opacity: 0.9
    },
    BannerText: {
        fontWeight: "bold",
        fontSize: 15,
    },
    recalls: {
        backgroundColor: '#ffffff',
        height: '1000%',
        width: '100%',
        marginTop: 7,
    },
    container: {
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderColor: '#707070',
        borderStyle: 'solid',
        paddingTop: 0,
        marginTop: 0,
        borderWidth: 1,
        backgroundColor: '#0e729e',
      },
     rectangle27: {
        width: '100%',
        height: 150,
        paddingTop: 5,
        backgroundColor: '#d9dde2',
        justifyContent: "center",
        borderBottomWidth: 4,
        alignItems: 'center',
        borderBottomColor: 'transparent'
    },
    image:{
        marginLeft: 50,
        width: 100,
        height: 50,
        justifyContent:'center'
    },
    topBar: {
        fontSize: 25,
        color: 'white',
        marginTop: 15,
        flexDirection: 'row',
        justifyContent:'space-around',
      },
  })