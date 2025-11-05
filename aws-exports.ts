export const amplifyConfig = {
  Auth: {
    Cognito: {
      region: "ap-south-1",
      userPoolId: "ap-south-1_WbksxZ6od",
      userPoolClientId: "5m589auptofr75bq5qc68nnvcd",
      loginWith: {
        oauth: {
          domain: "ap-south-1wbksxz6od.auth.ap-south-1.amazoncognito.com",
          scopes: ["email", "openid", "profile"],
          redirectSignIn: ["http://localhost:3000/"],
          redirectSignOut: ["http://localhost:3000/"],
          responseType: "code",
        },
      },
    },
  },
};
