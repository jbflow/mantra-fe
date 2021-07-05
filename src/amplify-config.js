import { isDev } from "./utils/Constants";
const config = {
  cognito: {
    REGION: "eu-west-2",
    USER_POOL_ID: isDev() ? "eu-west-2_3B2TYzI2L" : "eu-west-2_Xdht4Ws0x",
    APP_CLIENT_ID: isDev()
      ? "55m9nj2tvmu8t9o2g327lq1bgp"
      : "4h4ds0mk004v42objisa0rlaru",
    IDENTITY_POOL_ID: isDev()
      ? "eu-west-2:67c54d34-b4c6-439a-a1d8-e39dda196ca9"
      : "eu-west-2:8378f0c8-6374-4a14-89f9-d3df69defa13",
  },
  // cognito: {
  // 	REGION: "eu-west-2",
  // 	USER_POOL_ID: "eu-west-2_xrj0qcsgc",
  // 	APP_CLIENT_ID: "2k1spgl39krah7pk4065ng5etm",
  // 	IDENTITY_POOL_ID: "eu-west-2:7c21b046-a296-49fb-80ac-2484936d52d3",
  // },
  // cognito: {
  // 	REGION: "eu-west-2",
  // 	USER_POOL_ID: "eu-west-2_QT3eNZVmR",
  // 	APP_CLIENT_ID: "3atmlcemi7m1epopev9opootb1",
  // 	// IDENTITY_POOL_ID: "eu-west-2:7c21b046-a296-49fb-80ac-2484936d52d3",
  // },
};

export default config;
