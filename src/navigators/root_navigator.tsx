import React from 'react';
//clerk(authentication) imports
import { ClerkLoaded, useSession } from '@clerk/clerk-expo';
//navigation imports
import { createStackNavigator} from '@react-navigation/stack';
import LoginNavigator from '~/navigators/login_navigator';
import MainNavigator from '~/navigators/main_navigator';
//react native imports
import { SafeAreaView } from 'react-native-safe-area-context';
//styling imports
import { ActivityIndicator,  } from 'react-native-paper';
//utility imports

export type RootNavigatorParamList = {
  "LoginNavigator": undefined,
  "MainNavigator": undefined,
};


const Stack = createStackNavigator<RootNavigatorParamList>();

/**
 * The root navigator controls movement through different navigators (such as login and main).
 * @returns 
 */
function RootNavigator() {
    const { isLoaded, session } = useSession();
    
    if (!isLoaded) {
      return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} />
        </SafeAreaView>
      );
    }

    const initialRouteName = session == undefined ? "LoginNavigator" : "MainNavigator";
    
    return (
      <ClerkLoaded>
          <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false}}>
              <Stack.Screen name= "LoginNavigator" component = {LoginNavigator}/>
              <Stack.Screen name= "MainNavigator" component = {MainNavigator}/>
          </Stack.Navigator>
      </ClerkLoaded>
    );
}

export default RootNavigator;