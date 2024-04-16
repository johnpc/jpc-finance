import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.johncorser.finance",
  appName: "jpc.finance",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
