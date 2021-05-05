// const isDev =
//   window.location.href.toString().slice(0, 30) ===
//   "https://dev.dbs-talkback.co.uk";

const config = {
  cognito: {
    REGION: "eu-west-2",
    USER_POOL_ID: "eu-west-2_7bUrPYCah",
    APP_CLIENT_ID: "26eh118so77dcvognk37camnsb",
    IDENTITY_POOL_ID: "eu-west-2:2625b6a3-2b32-41dc-aa24-12b022297f85",
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
