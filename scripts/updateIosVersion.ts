import fs from "fs";
const defaultIosVersion = "13.0";
const desiredIosVersion = "17.4";
const filesToEdit = [
  "ios/App/Pods/Local Podspecs/Capacitor.podspec.json",
  "ios/App/Pods/Local Podspecs/CapacitorApp.podspec.json",
  "ios/App/Pods/Local Podspecs/JohnpcFinancekitCapacitor.podspec.json",
  "ios/App/Pods/Local Podspecs/CapacitorCordova.podspec.json",
  "ios/capacitor-cordova-ios-plugins/CordovaPlugins.podspec",
  "ios/capacitor-cordova-ios-plugins/CordovaPluginsStatic.podspec",
  "ios/App/App.xcodeproj/project.pbxproj",
  "ios/App/Pods/Pods.xcodeproj/project.pbxproj",
];

const main = async () => {
  filesToEdit.forEach((fileName) => {
    const contents = fs.readFileSync(fileName).toString();
    fs.writeFileSync(
      fileName,
      contents.replaceAll(defaultIosVersion, desiredIosVersion),
    );
  });
};
main();
