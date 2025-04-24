# Installation and Setup
1. Clone the repository.
2. Run `npm install` inside the project directory to install all dependencies.
3. Create an `.env.local` if you do not already have one. Add the API key to `CLERK_PUBLISHABLE_KEY`. If you want to setup username and password setting, modify `setup.py` and replace `<replace>` with your login credentials. A user account can be created through the app.
4. Run `bash run.bash` to start the Expo server.
5. Make sure you have Expo Go downloaded on your phone OR you have a simulator.
6. Scan the QR code or enter the https link to build the project.
# Ur Recalls Project Structure
UrRecalls is a React Native project integrated with Expo for mobile app development. The following is a list of design decisions and dependencies the project uses:
## Clerk
Account management is handled through Clerk.
- Read more at https://clerk.com/docs.
## Material Design
Most UI components are built off of React Native Paper's material components.
- Read more at https://callstack.github.io/react-native-paper/docs/guides/theming.
## Relative File Paths
File paths are relatively imported from the src folder.
- Read more at https://stackoverflow.com/a/57799113.
## Localization
All text should be localized using i18n-js. Localization strings are located in the locales folder. A utility function `t` is provided.
- Read more at https://github.com/fnando/i18n-js.
## Food Product Search
Searching is done through the Sifter Connect API.
- Read more at https://docs.sifter.network/reference/examples.
## FDA Recall Information
Recall information is collected through the openFDA API.
- Read more at https://open.fda.gov/apis/.

# Common Issues

## Invalid Clerk key
Create `.env.local` in root directory.  
```
CLERK_PUBLISHABLE_KEY=pk_test_abcd
DEFAULT_USERNAME='<replace>'
DEFAULT_PASSWORD='<replace>'
```

## Building an APK
The following are the issues we encountered trying to build the project.
1. **Issues with Expo Permissions.** Create a new Expo project at https://expo.dev/ and insert it's projectID into `app.config.ts`.
2. **Issues with dependencies.** Make sure you update them as often as possible.
3. **Issues with application crashing.** We discovered there were issues with environment variables not being set properly in builds, more specifically the `.env.local` file is included in the `.gitignore` and thus not being included in builds. We recommend you migrate to using secrets instead. See https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson for more information.
4. **Issues with Recall Status not showing.** Android and IOS devices do not usually allow `http` protocol requests to be made. Now you may ask, why are we using `http` instead of `https`?. Well apparently the API call to our AWS server doesn't work with `https` so right now we manually modified the manifest to allow `http` protocol. See https://stackoverflow.com/questions/38418998/react-native-fetch-network-request-failed for more information.
5. **Something is not working and I don't know what to do.** Download the `.apk` from the build and install it on an Android device (emulator or physical). Then run `adb logcat` to view the log of all system messages. Finally, launch the build on the Android device. Examine the logs for any information. I recommend you you filter the logs to only show react messages, i.e. `adb logcat | grep 'react'`.

There may be issues due to dependencies being out of date. I suggest you update them as much as possible and remove any that are deprecated.
- Read more about building an APK at https://docs.expo.dev/build-reference/apk/.
- Read more about secrets at https://docs.expo.dev/build-reference/variables/.
- Read more about environment variables at https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson.

# Licensing
Most icons use Material Design Icons by Pictogrammers.
- Read more at https://pictogrammers.com/docs/general/license/.