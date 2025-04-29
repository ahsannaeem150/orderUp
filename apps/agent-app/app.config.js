import "dotenv/config";

export default {
  expo: {
    name: "AgentUP",
    slug: "agentup",
    scheme: "agentup",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ahsannaeem002x.agentup",
      config: {
        googleMaps: {
          apiKey: process.env.IOS_API_KEY,
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.ahsannaeem002x.agentup",
      config: {
        googleMaps: {
          apiKey: process.env.ANDROID_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "085ad7da-c886-4801-b7ab-9265010ebdd9",
      },
    },
    owner: "ahsannaeem002x",
  },
};
