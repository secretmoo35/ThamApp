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
    'autocomplete.directive'
])


    // Enable native scrolls for Android platform only,
    // as you see, we're disabling jsScrolling to achieve this.
    .config(function ($ionicConfigProvider) {
        if (ionic.Platform.isAndroid()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }
    })

    .constant('config', {
        apiUrl: 'https://thamapp.herokuapp.com/'
        //https://thamapp.herokuapp.com/      for production
        //https://thamapptest.herokuapp.com/  for heroku test
        //http://localhost:3000/              for local
    })

    .run(function ($ionicPlatform, $rootScope, $ionicHistory, $timeout, $ionicConfig, AuthService) {
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

    .config(function ($stateProvider, $urlRouterProvider) {
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

            .state('app.shop.popular', {
                url: "/popular",
                // cache: false,
                views: {
                    'shop-popular': {
                        templateUrl: "views/app/shop/shop-popular.html",
                        controller: 'ProfileCtrl'
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

            .state('app.cart', {
                url: "/cart",
                params: {
                    state: null
                },
                views: {
                    'menuContent': {
                        templateUrl: "views/app/shop/cart.html",
                        controller: 'ShoppingCartCtrl'
                    }
                }
            })

            .state('app.shipping-address', {
                url: "/shipping-address",
                views: {
                    'menuContent': {
                        templateUrl: "views/app/shop/shipping-address.html",
                        controller: "CheckoutCtrl"
                    }
                }
            })

            .state('app.checkout', {
                url: "/checkout",
                cache: false,
                views: {
                    'menuContent': {
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
