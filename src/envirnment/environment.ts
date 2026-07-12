// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envName: 'prod',
  // //////localhost //////////////

  //  apiUrl: 'http://localhost:11011/',
  // apiUrlauth: 'http://localhost:11011/',


  /////for live server api//////////

  
 apiUrl: 'https://www.nadiamatchmaking.com:11011/',
 apiUrlauth: 'https://www.nadiamatchmaking.com:11011/',


//   // http://159.69.174.28:11015/
//  apiUrl: 'http://95.217.205.57:11011/',
//  apiUrlauth: 'http://95.217.205.57:11011/',

  imageUrl: 'C:\\inetpub\\wwwroot\\Matchmaking\\Matchmaking-app\\matchmaking\\assets\\user-images\\',

  
 
    productUrl: 'https://www.nadiamatchmaking.com',
    googleClientId: '51129007656-7853v1j76s30u7cnne2b10nlg9r2ku3l.apps.googleusercontent.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
