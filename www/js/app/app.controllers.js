angular.module('your_app_name.app.controllers', [])


.controller('AppCtrl', function($scope, AuthService, config, $ionicSideMenuDelegate, ShopService) {

    $scope.apiUrl = config.apiUrl;
    //this will represent our logged user
    $scope.countProduct = ShopService;
    // $
    // $scope.countProduct 
    $scope.$watch(function() {
            return $ionicSideMenuDelegate.isOpenLeft();
        },
        function(isOpen) {
            if (isOpen) {
                console.log("open");
                $scope.loggedUser = AuthService.getUser();
            }
        });

})

.controller('ProfileCtrl', function($scope, $stateParams, AuthService, $ionicHistory, $state, $ionicScrollDelegate, config, ShopService) {

    $scope.apiUrl = config.apiUrl;
    $scope.loggedUser = AuthService.getUser();
    ShopService.getCompleteOrder().then(function(res) {
        $scope.history = res;
    }, function(err) {
        alert(JSON.stringify(err));
    });
    $scope.tabs = 'H';

    $scope.myProfile = $scope.loggedUser;
    $scope.user = {};
    $scope.getHistory = function(H) {
        $scope.tabs = H;
    };

    $scope.getProfile = function(P) {
        $scope.tabs = P;
    };

    $scope.toggleItem = function(item) {
        if ($scope.isItemShown(item)) {
            $scope.shownItem = null;
        } else {
            $scope.shownItem = item;
        }
    };
    $scope.isItemShown = function(item) {
        return $scope.shownItem === item;
    };

})

.controller('ProductCtrl', function($scope, $timeout, $rootScope, $state, $stateParams, ShopService, $ionicPopup, $ionicLoading, config) {
    var productId = $stateParams.productId;
    $scope.apiUrl = config.apiUrl;

    $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูลสินค้า</p>', duration: 2000 });
    ShopService.getProduct(productId).then(function(product) {
        $scope.product = product;

        $timeout(function() {
            $ionicLoading.hide();
        }, 500);
    });

    $scope.productGotoCart = {
        qty: 1
    };

    $rootScope.shakeitCart = function() {

        var cartElem = angular.element(document.getElementsByClassName("ion-ios-cart"));
        setTimeout(function() {
            cartElem.addClass('shakeit');
        }, 1000);
        setTimeout(function() {
            cartElem.removeClass('shakeit');
        }, 2000);
    }

    // show add to cart popup on button click
    $scope.showAddToCartPopup = function(product, now) {
        $scope.data = {};
        $scope.data.product = product;
        $scope.data.productOption = 1;
        $scope.data.productQuantity = 1;

        if (now) {
            $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">ซื้อทันที</p>', duration: 1000 });
            $scope.productGotoCart.product = product;
            $scope.productGotoCart.qty = 1;
            $scope.productGotoCart.amount = product.price * $scope.productGotoCart.qty;
            $scope.productGotoCart.qty = parseInt($scope.productGotoCart.qty);
            ShopService.addProductToCart($scope.productGotoCart);
            console.log('Shop now!', $scope.productGotoCart);
            $state.go('app.cart');
            $rootScope.shakeitCart();

        } else {
            var myPopup = $ionicPopup.show({
                cssClass: 'add-to-cart-popup',
                templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
                title: 'ใส่ตะกร้า',
                scope: $scope,
                buttons: [
                    { text: '', type: 'close-popup ion-ios-close-outline' }, {
                        text: 'ตกลง',
                        onTap: function(e) {
                            return $scope.data;
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                if (res) {
                    $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">ใส่ตะกร้า</p>', duration: 1000 });
                    $scope.productGotoCart.product = res.product;
                    $scope.productGotoCart.amount = res.product.price * $scope.productGotoCart.qty;
                    $scope.productGotoCart.qty = parseInt($scope.productGotoCart.qty);
                    ShopService.addProductToCart($scope.productGotoCart);
                    console.log('Item added to cart!', $scope.productGotoCart);
                    $rootScope.shakeitCart();

                } else {
                    console.log('Popup closed');
                }
            });
        }

    };
})

.controller('ShopCtrl', function($scope, $ionicLoading, $timeout, ShopService, config) {
    $scope.apiUrl = config.apiUrl;
    $scope.products = [];
    $scope.popular_products = [];
    $scope.readProduct = function() {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูลสินค้า</p>' });
        ShopService.getProducts().then(function(products) {
            $scope.products = products;
            $timeout(function() {
                $ionicLoading.hide();
            }, 500);
        });
    }

    $scope.getNewData = function() {
        ShopService.getProducts().then(function(products) {
            $scope.products = products;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('ShoppingCartCtrl', function($scope, $rootScope, $state, $stateParams, ShopService, AuthService, $ionicActionSheet, _, config) {
    $scope.state = $stateParams.state;
    $scope.apiUrl = config.apiUrl;
    $scope.products = ShopService.getCartProducts();

    $scope.removeProductFromCart = function(product) {
        $ionicActionSheet.show({
            destructiveText: 'ลบสินค้าออกจากตะกร้า',
            cancelText: 'ยกเลิก',
            cancel: function() {
                return true;
            },
            destructiveButtonClicked: function() {
                ShopService.removeProductFromCart(product);
                $scope.products = ShopService.getCartProducts();
                $rootScope.shakeitCart();
                return true;
            }
        });
    };

    $scope.getTotal = function() {
        $scope.total = 0;
        $scope.products.forEach(function(item) {
            $scope.total += item.amount;
        });
    };

    $scope.getTotal();

    $scope.calculate = function(product) {
        product.amount = product.qty * product.product.price;
        $scope.getTotal();
        ShopService.addProductToCart(product, true);
    };

    // $scope.getSubtotal = function () {
    //     return _.reduce($scope.products, function (memo, product) { return memo + product.price; }, 0);
    // };

    $scope.getUserAndContinue = function() {
        var user = AuthService.getUser();
        if (user) {
            $state.go('app.checkout');
        } else {
            $state.go('app.shipping-address');
        }
    };

})

.controller('CheckoutCtrl', function($scope, $state, $stateParams, $ionicPopup, CheckoutService, ShopService, AuthService, config, $ionicLoading) {
    //$scope.paymentDetails;

    $scope.apiUrl = config.apiUrl;
    $scope.status = true;
    $scope.user = AuthService.getUser();
    if ($stateParams.order) {
        $scope.completeOrder = JSON.parse($stateParams.order);
    }
    $scope.order = {
        shipping: {},
        delivery: {
            deliveryid: '0'
        },
        amount: 0
    };
    $scope.order.items = ShopService.getCartProducts();

    $scope.order.items.forEach(function(item) {
        $scope.order.amount += item.amount;
    });

    $scope.state = true;
    $scope.step = '1';
    $scope.choice = true;
    $scope.authentication = {}
    $scope.gotoForm = function(num) {
        if (num === '4') {
            $state.go('app.checkout');
        } else if (num === '3') {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
            AuthService.login($scope.authentication).then(function(res) {
                $state.go('app.checkout');
                $ionicLoading.hide();
                $scope.step = num;
            }, function(err) {
                $ionicLoading.hide();
                alert(JSON.stringify(err));
            })
        } else if (num === '2') {
            $scope.step = num;
        } else {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
            $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
            $scope.authentication.address.tel = $scope.authentication.username;
            $scope.authentication.password = 'Usr#P@ssw0rd';
            AuthService.signup($scope.authentication).then(function(res) {
                $scope.state = false;
                $scope.step = '3';
                $state.go('app.checkout');
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
                if (err.message === 'Username already exists') {
                    var myPopup = $ionicPopup.show({
                        template: '<input type="text" ng-model="authentication.username">',
                        title: 'มีชื่อผู้ใช้งานนี้แล้ว',
                        subTitle: 'กรุณากรอกชื่อผู้ใช้งานใหม่',
                        scope: $scope,
                        buttons: [
                            { text: 'ยกเลิก' }, {
                                text: '<b>ตกลง</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    $scope.gotoForm();
                                }
                            }
                        ]
                    });

                    myPopup.then(function(res) {
                        console.log('Tapped!', res);
                    });
                } else {
                    alert(JSON.stringify(err));
                }

            });
        }
    };

    $scope.confirm = function(status) {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
        $scope.order.docno = (+new Date());
        $scope.order.docdate = new Date();
        $scope.order.user = AuthService.getUser();
        $scope.order.platform = 'Mobile';

        if (status) {
            $scope.order.shipping = $scope.order.user.address;
            $scope.order.shipping.firstname = $scope.order.user.firstName;
            $scope.order.shipping.lastname = $scope.order.user.lastName;
        }

        CheckoutService.saveOrder($scope.order).then(function(res) {
            $ionicLoading.hide();
            console.log(res);
            $state.go('app.complete', {
                order: JSON.stringify(res)
            });
        }, function(err) {
            alert(err.data.message);
        });
    };

})

.controller('SettingsCtrl', function($scope, $state, $ionicModal, AuthService) {

    $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.privacy_policy_modal = modal;
    });

    $scope.showPrivacyPolicy = function() {
        $scope.privacy_policy_modal.show();
    };

    $scope.signout = function() {
        AuthService.signout();
        $state.go('app.shop.home')
    }

});


//  .controller('PostCardCtrl', function ($scope, PostService, $ionicPopup, $state) {
//     var commentsPopup = {};

//     $scope.navigateToUserProfile = function (user) {
//         commentsPopup.close();
//         $state.go('app.profile.posts', { userId: user._id });
//     };

//     $scope.showComments = function (post) {
//         PostService.getPostComments(post)
//             .then(function (data) {
//                 post.comments_list = data;
//                 commentsPopup = $ionicPopup.show({
//                     cssClass: 'popup-outer comments-view',
//                     templateUrl: 'views/app/partials/comments.html',
//                     scope: angular.extend($scope, { current_post: post }),
//                     title: post.comments + ' Comments',
//                     buttons: [
//                         { text: '', type: 'close-popup ion-ios-close-outline' }
//                     ]
//                 });
//             });
//     };
// })

// .controller('FeedCtrl', function ($scope, PostService, $ionicPopup, $state) {
//     $scope.posts = [];
//     $scope.page = 1;
//     $scope.totalPages = 1;

//     $scope.doRefresh = function () {
//         PostService.getFeed(1)
//             .then(function (data) {
//                 $scope.totalPages = data.totalPages;
//                 $scope.posts = data.posts;

//                 $scope.$broadcast('scroll.refreshComplete');
//             });
//     };

//     $scope.getNewData = function () {
//         //do something to load your new data here
//         $scope.$broadcast('scroll.refreshComplete');
//     };

//     $scope.loadMoreData = function () {
//         $scope.page += 1;

//         PostService.getFeed($scope.page)
//             .then(function (data) {
//                 //We will update this value in every request because new posts can be created
//                 $scope.totalPages = data.totalPages;
//                 $scope.posts = $scope.posts.concat(data.posts);

//                 $scope.$broadcast('scroll.infiniteScrollComplete');
//             });
//     };

//     $scope.moreDataCanBeLoaded = function () {
//         return $scope.totalPages > $scope.page;
//     };

//     $scope.doRefresh();

// });
