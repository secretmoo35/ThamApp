angular.module('underscore', [])
    .factory('_', function () {
        return window._; // assumes underscore has already been loaded on the page
    });

angular.module('your_app_name', [
    'ionic',
    'ngCordova',
    'your_app_name.common.directives',
    'your_app_name.app.controllers',
    'your_app_name.auth.controllers',
    'your_app_name.app.services',
    // 'your_app_name.views',
    'underscore',
    'angularMoment',
    'ngIOS9UIWebViewPatch',
    'autocomplete.directive',
    'openfb',
    'btford.socket-io',
    'satellizer'
])


    // Enable native scrolls for Android platform only,
    // as you see, we're disabling jsScrolling to achieve this.
    .config(function ($ionicConfigProvider) {
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }
    })

    .constant('config', {
        apiUrl: 'https://thamapptest.herokuapp.com/',
        redirectUri: 'http://localhost:8100/', // oauth callback url of ionic app example http://localhost:8100/
        facebook: {
            clientId: '414384685598077' // your client id from facebook console example 
        },
        //https://thamapp.herokuapp.com/      for production
        //https://thamapptest.herokuapp.com/  for heroku test
        //http://localhost:3000/              for local
    })

    .run(function ($ionicPlatform, $rootScope, $ionicHistory, $timeout, $ionicConfig, AuthService, OpenFB) {

        OpenFB.init('414384685598077', 'http://thamapptest.herokuapp.com/api/auth/facebook/callback');

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            if (window.localStorage.credential) {
                var user = JSON.parse(window.localStorage.credential);
                AuthService.login(user);
            }
            var push = new Ionic.Push({
                "debug": true
            });

            push.register(function (token) {
                console.log("My Device token:", token.token);
                window.localStorage.token = token.token;
                // prompt("Copy token", token.token);
                push.saveToken(token);  // persist the token in the Ionic Platform
            });

            var devicePlatform = device.platform;
            window.localStorage.platform = devicePlatform;
        });

        $ionicPlatform.on("resume", function (event) {
            // user opened the app from the background
            if (window.localStorage.credential) {
                var user = JSON.parse(window.localStorage.credential);
                AuthService.login(user);
            }
        });

        // This fixes transitions for transparent background views
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('auth.welcome') > -1) {
                // set transitions to android to avoid weird visual effect in the walkthrough transitions
                $timeout(function () {
                    $ionicConfig.views.transition('android');
                    $ionicConfig.views.swipeBackEnabled(false);
                    console.log("setting transition to android and disabling swipe back");
                }, 0);
            }
        });
        $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
            if (toState.name.indexOf('app.shop.home') > -1) {
                // Restore platform default transition. We are just hardcoding android transitions to auth views.
                $ionicConfig.views.transition('platform');
                // If it's ios, then enable swipe back again
                if (ionic.Platform.isIOS()) {
                    $ionicConfig.views.swipeBackEnabled(true);
                }
                console.log("enabling swipe back and restoring transition to platform default", $ionicConfig.views.transition());
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, config, $authProvider) {

        var commonConfig = {
            popupOptions: {
                location: 'no',
                toolbar: 'yes',
                width: window.screen.width,
                height: window.screen.height
            }
        };

        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            commonConfig.redirectUri = config.redirectUri;
        }
        $authProvider.facebook(angular.extend({}, commonConfig, {
            clientId: config.facebook.clientId,
            url: config.apiUrl + 'api/auth/facebook'
        }));

        $stateProvider

            //SIDE MENU ROUTES
            .state('app', {
                url: "/app",
                abstract: true,
                cache: false,
                templateUrl: "views/app/side-menu.html",
                controller: 'AppCtrl'
            })

            .state('app.feed', {
                url: "/feed",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/feed.html",
                        controller: "FeedCtrl"
                    }
                }
            })

            .state('app.profile', {
                abstract: true,
                url: '/profile/:userId',
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/profile.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.profile.posts', {
                url: '/posts',
                views: {
                    'profileContent': {
                        templateUrl: 'views/app/profile/profile.posts.html',
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.profile.likes', {
                url: '/likes',
                views: {
                    'profileContent': {
                        templateUrl: 'views/app/profile/profile.likes.html'
                    }
                }
            })

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/settings.html",
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('app.shop', {
                url: "/shop",
                abstract: false,
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "views/app/shop/shop.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.home', {
                url: "/home",
                // cache: false,
                views: {
                    'shop-home': {
                        templateUrl: "views/app/shop/shop-home.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.all', {
                url: "/all",
                params: {
                    cate: null
                },
                // cache: false,
                views: {
                    'shop-home': {
                        templateUrl: "views/app/shop/shop-all.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.campaigns', {
                url: "/campaigns",
                params: {
                    cate: null
                },
                // cache: false,
                views: {
                    'shop-campaigns': {
                        templateUrl: "views/app/shop/campaign.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.campaigns-chat', {
                url: "/chat",
                // cache: false,
                views: {
                    'shop-campaigns': {
                        templateUrl: "views/app/profile/chat.html",
                        controller: 'ChatCtrl'
                    }
                }
            })

            .state('app.shop.campaign-detail', {
                url: "/campaign/:campaignId",
                views: {
                    'shop-campaigns': {
                        templateUrl: "views/app/shop/campaign-detail.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.campaignproduct', {
                url: "/campaignproduct/:campaign/:product",
                params: {
                    cate: null
                },
                // cache: false,
                views: {
                    'shop-campaigns': {
                        templateUrl: "views/app/shop/campaignproduct.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.sale', {
                url: "/sale",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-sale.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.salelogin', {
                url: "/sale-login",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-sale-login.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.saleregis', {
                url: "/sale-regis/:setusername",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-sale-register.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.shop.popular', {
                url: "/popular",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-popular.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.shop.historybyid', {
                url: "/historybyid/:hisId",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-history-byid.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.shop.setting', {
                url: "/setting",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-setting.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.shop.policy', {
                url: "/policy",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-policy.html",
                        controller: 'PolicyCtrl'
                    }
                }
            })

            .state('app.shop.help', {
                url: "/help",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-help.html",
                        controller: 'PolicyCtrl'
                    }
                }
            })

            .state('app.shop.pushnotifications', {
                url: "/pushnotifications",
                // cache: false,
                views: {
                    'shop-sale': {
                        templateUrl: "views/app/shop/shop-pushnotifications.html",
                        controller: 'PushNotiCtrl'
                    }
                }
            })

            .state('app.shop.quiz', {
                url: "/quiz",
                // cache: false,
                views: {
                    'shop-quiz': {
                        templateUrl: "views/app/shop/quiz.html",
                        controller: 'QuizCtrl'
                    }
                }
            })

            .state('app.shop.quiz-detail', {
                url: "/quiz-detail/:quizId",
                // cache: false,
                views: {
                    'shop-quiz': {
                        templateUrl: "views/app/shop/quiz-detail.html",
                        controller: 'QuizCtrl'
                    }
                }
            })

            .state('app.shop.quiz-answer', {
                url: "/quiz-answer",
                params: {
                    quiz: null
                },
                views: {
                    'shop-quiz': {
                        templateUrl: "views/app/shop/quiz-answer.html",
                        controller: 'QuizCtrl'
                    }
                }
            })

            .state('app.shop.cart', {
                url: "/cart",
                params: {
                    state: null
                },
                // cache: false,
                views: {
                    'shop-cart': {
                        templateUrl: "views/app/shop/cart.html",
                        controller: 'ShoppingCartCtrl'
                    }
                }
            })

            .state('app.shop.shipping-address', {
                url: "/shipping-address",
                views: {
                    'shop-cart': {
                        templateUrl: "views/app/shop/shipping-address.html",
                        controller: "CheckoutCtrl"
                    }
                }
            })

            .state('app.shop.checkout', {
                url: "/checkout",
                cache: false,
                views: {
                    'shop-cart': {
                        templateUrl: "views/app/shop/checkout.html",
                        controller: "CheckoutCtrl"
                    }
                }
            })

            .state('app.complete', {
                url: "/complete/:order",
                params: {
                    order: null
                },
                views: {
                    'menuContent': {
                        templateUrl: "views/app/shop/complete.html",
                        controller: "CheckoutCtrl"
                    },
                }
            })

            .state('app.shop.chat', {
                url: "/chat",
                // cache: false,
                views: {
                    'shop-home': {
                        templateUrl: "views/app/profile/chat.html",
                        controller: 'ChatCtrl'
                    }
                }
            })

            .state('app.shop.chat-detail', {
                url: "/chat/:chatId",
                views: {
                    'shop-home': {
                        templateUrl: "views/app/profile/chat-detail.html",
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('app.product-detail', {
                url: "/product/:productId",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/shop/product-detail.html",
                        controller: 'ProductCtrl'
                    }
                }
            })

            .state('app.edit-profile', {
                url: "/edit-profile",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/edit-profile.html",
                        controller: 'EditProfileCtrl'
                    }
                }
            })

            .state('app.change-password', {
                url: "/change-password",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/change-password.html",
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('app.locations', {
                url: "/change-password",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/location.html",
                        controller: 'ShopCtrl'
                    }
                }
            })

            .state('app.listfriend', {
                url: "/listfriend",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/profile/listfriend.html",
                        controller: 'FriendsCtrl'
                    }
                }
            })

            //AUTH ROUTES
            .state('auth', {
                url: "/auth",
                templateUrl: "views/auth/auth.html",
                controller: "AuthCtrl",
                abstract: true
            })

            .state('auth.welcome', {
                url: '/welcome',
                templateUrl: "views/auth/welcome.html",
                controller: 'WelcomeCtrl',
                resolve: {
                    show_hidden_actions: function () {
                        return false;
                    }
                }
            })

            .state('auth.login', {
                url: '/login',
                templateUrl: "views/auth/login.html",
                controller: 'LogInCtrl'
            })

            .state('auth.signup', {
                url: '/signup',
                templateUrl: "views/auth/signup.html",
                controller: 'SignUpCtrl'
            })

            .state('auth.forgot-password', {
                url: '/forgot-password',
                templateUrl: "views/auth/forgot-password.html",
                controller: 'ForgotPasswordCtrl'
            })

            // .state('facebook-sign-in', {
            //   url: "/facebook-sign-in",
            //   templateUrl: "views/auth/facebook-sign-in.html",
            //   controller: 'WelcomeCtrl'
            // })
            //
            // .state('dont-have-facebook', {
            //   url: "/dont-have-facebook",
            //   templateUrl: "views/auth/dont-have-facebook.html",
            //   controller: 'WelcomeCtrl'
            // })
            //
            // .state('create-account', {
            //   url: "/create-account",
            //   templateUrl: "views/auth/create-account.html",
            //   controller: 'CreateAccountCtrl'
            // })
            //
            // .state('welcome-back', {
            //   url: "/welcome-back",
            //   templateUrl: "views/auth/welcome-back.html",
            //   controller: 'WelcomeBackCtrl'
            // })
            ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/shop/home');
        // $urlRouterProvider.otherwise('/app/feed');
    });

angular.module('openfb', [])

    .factory('OpenFB', function ($rootScope, $q, $window, $http) {

        var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth',

            // By default we store fbtoken in sessionStorage. This can be overriden in init()
            tokenStore = window.sessionStorage,

            fbAppId,
            oauthRedirectURL,

            // Because the OAuth login spans multiple processes, we need to keep the success/error handlers as variables
            // inside the module instead of keeping them local within the login function.
            deferredLogin,

            // Indicates if the app is running inside Cordova
            runningInCordova,

            // Used in the exit event handler to identify if the login has already been processed elsewhere (in the oauthCallback function)
            loginProcessed;

        document.addEventListener("deviceready", function () {
            runningInCordova = true;
        }, false);

        /**
         * Initialize the OpenFB module. You must use this function and initialize the module with an appId before you can
         * use any other function.
         * @param appId - The id of the Facebook app
         * @param redirectURL - The OAuth redirect URL. Optional. If not provided, we use sensible defaults.
         * @param store - The store used to save the Facebook token. Optional. If not provided, we use sessionStorage.
         */
        function init(appId, redirectURL, store) {
            fbAppId = appId;
            if (redirectURL) oauthRedirectURL = redirectURL;
            if (store) tokenStore = store;
        }

        /**
         * Login to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
         * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
         * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
         * @param fbScope - The set of Facebook permissions requested
         */
        function login(fbScope) {

            if (!fbAppId) {
                return error({ error: 'Facebook App Id not set.' });
            }

            var loginWindow;

            fbScope = fbScope || '';

            deferredLogin = $q.defer();

            loginProcessed = false;

            logout();

            // Check if an explicit oauthRedirectURL has been provided in init(). If not, infer the appropriate value
            if (!oauthRedirectURL) {
                if (runningInCordova) {
                    //Moo : for dev
                    oauthRedirectURL = 'http://thamapptest.herokuapp.com/api/auth/facebook/callback';

                    //Moo : for android
                    //oauthRedirectURL = 'https://www.facebook.com/connect/login_success.html';

                } else {
                    // Trying to calculate oauthRedirectURL based on the current URL.
                    var index = document.location.href.indexOf('index.html');
                    if (index > 0) {
                        oauthRedirectURL = document.location.href.substring(0, index) + 'oauthcallback.html';
                    } else {
                        return alert("Can't reliably infer the OAuth redirect URI. Please specify it explicitly in openFB.init()");
                    }
                }
            }

            loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
                '&response_type=token&display=popup&scope=' + fbScope, '_blank', 'location=no');

            // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token or an error
            if (runningInCordova) {
                loginWindow.addEventListener('loadstart', function (event) {
                    var url = event.url;
                    if (url.indexOf("access_token=") > 0 || url.indexOf("error=") > 0) {
                        loginWindow.close();
                        oauthCallback(url);
                    }
                });

                loginWindow.addEventListener('exit', function () {
                    // Handle the situation where the user closes the login window manually before completing the login process
                    deferredLogin.reject({ error: 'user_cancelled', error_description: 'User cancelled login process', error_reason: "user_cancelled" });
                });
            }
            // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
            // oauthCallback() function. See oauthcallback.html for details.

            return deferredLogin.promise;

        }

        /**
         * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
         * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
         * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
         * OAuth workflow.
         */
        function oauthCallback(url) {
            // Parse the OAuth data received from Facebook
            var queryString,
                obj;

            loginProcessed = true;
            if (url.indexOf("access_token=") > 0) {
                queryString = url.substr(url.indexOf('#') + 1);
                obj = parseQueryString(queryString);
                tokenStore['fbtoken'] = obj['access_token'];
                deferredLogin.resolve();
            } else if (url.indexOf("error=") > 0) {
                queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
                obj = parseQueryString(queryString);
                deferredLogin.reject(obj);
            } else {
                deferredLogin.reject();
            }
        }

        /**
         * Application-level logout: we simply discard the token.
         */
        function logout() {
            tokenStore['fbtoken'] = undefined;
        }

        /**
         * Helper function to de-authorize the app
         * @param success
         * @param error
         * @returns {*}
         */
        function revokePermissions() {
            return api({ method: 'DELETE', path: '/me/permissions' })
                .success(function () {
                    console.log('Permissions revoked');
                });
        }

        /**
         * Lets you make any Facebook Graph API request.
         * @param obj - Request configuration object. Can include:
         *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
         *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
         *  params:  queryString parameters as a map - Optional
         */
        function api(obj) {

            var access_token;
            if (obj.access_tokens) {
                access_token = obj.access_tokens;
            } else {
                access_token = tokenStore['fbtoken'];
            }

            var method = obj.method || 'GET',
                params = obj.params || {};
            params['access_token'] = access_token;
            var hash = CryptoJS.HmacSHA256(access_token, "1320b7dc2492ff1a39c1d4870f98bb9c"); //e77ed0982f0deb51878993ebb863e587
            params['appsecret_proof'] = hash.toString();

            return $http({ method: method, url: 'https://graph.facebook.com' + obj.path, params: params })
                .error(function (data, status, headers, config) {
                    if (data.error && data.error.type === 'OAuthException') {
                        $rootScope.$emit('OAuthException');
                    }
                });
        }

        /**
         * Helper function for a POST call into the Graph API
         * @param path
         * @param params
         * @returns {*}
         */
        function post(path, params, access_tokens) {
            return api({ method: 'POST', path: path, params: params, access_tokens: access_tokens });
        }

        /**
         * Helper function for a GET call into the Graph API
         * @param path
         * @param params
         * @returns {*}
         */
        function get(path, params) {
            return api({ method: 'GET', path: path, params: params });
        }

        function parseQueryString(queryString) {
            var qs = decodeURIComponent(queryString),
                obj = {},
                params = qs.split('&');
            params.forEach(function (param) {
                var splitter = param.split('=');
                obj[splitter[0]] = splitter[1];
            });
            return obj;
        }

        return {
            init: init,
            login: login,
            logout: logout,
            revokePermissions: revokePermissions,
            api: api,
            post: post,
            get: get,
            oauthCallback: oauthCallback
        }

    });

// Global function called back by the OAuth login dialog
function oauthCallback(url) {
    var injector = angular.element(document.getElementById('main')).injector();
    injector.invoke(function (OpenFB) {
        OpenFB.oauthCallback(url);
    });
}
