export const PAGES_MENU = [
  {
    path: 'pages',
    children: [
      {
        path: 'location',  // path for our page
        data: { // custom meinu declaration
          menu: {
            title: 'Location', // menu title
            resID:'R10001',
            icon: 'ion-android-home', // menu icon
            pathMatch: 'prefix', // use it if item children not displayed in menu
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'user',  // path for our page
        data: { // custom meinu declaration
          menu: {
            title: 'UserMgr', // menu title
            resID:'R20001',
            icon: 'ion-edit', // menu icon
            pathMatch: 'prefix', // use it if item children not displayed in menu
            hidden:false,
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'ndp',  // path for our page
        data: { // custom meinu declaration
          menu: {
            title: 'DataParser', // menu title
            resID:'R20002',
            icon: 'ion-edit', // menu icon
            pathMatch: 'prefix', // use it if item children not displayed in menu
            hidden:true,
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'sysinfo',  // path for our page
        data: { // custom meinu declaration
          menu: {
            title: 'SystemInfo', // menu title
            resID:'R30001',
            icon: 'ion-edit', // menu icon
            pathMatch: 'prefix', // use it if item children not displayed in menu
            hidden:false,
            selected: false,
            expanded: false,
            order: 0
          }
        }
      }
    ]
  }
];
