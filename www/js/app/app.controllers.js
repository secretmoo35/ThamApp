angular.module('your_app_name.app.controllers', [])


    .controller('AppCtrl', function ($scope, AuthService, config, $ionicSideMenuDelegate, ShopService) {

        $scope.apiUrl = config.apiUrl;
        //this will represent our logged user
        $scope.countProduct = ShopService;
        // $
        // $scope.countProduct 
        $scope.$watch(function () {
            return $ionicSideMenuDelegate.isOpenLeft();
        },
            function (isOpen) {
                if (isOpen) {
                    console.log("open");
                    $scope.loggedUser = AuthService.getUser();
                }
            });

    })

    .controller('ProfileCtrl', function ($scope, $stateParams, AuthService, config, ShopService, $ionicHistory, $ionicLoading, $state, $ionicScrollDelegate, $cordovaImagePicker, $cordovaFileTransfer, $ionicPopup) {

        $scope.apiUrl = config.apiUrl;

        $scope.loggedUser = AuthService.getUser();
        if ($scope.loggedUser) {
            $scope.history = [];
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูล</p>' });
            ShopService.getCompleteOrder().then(function (res) {
                $scope.history = res;
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();
                alert(JSON.stringify(err));
            });
        }

        $scope.getNewData = function () {
            $scope.history = [];
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูล</p>' });
            ShopService.getCompleteOrder().then(function (res) {
                $scope.history = res;
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();
                alert(JSON.stringify(err));
            });
        }

        $scope.showConfirm = function (item) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'ยกเลิกรายการ',
                template: 'คุณต้องการยกเลิกรายการสั่งซื้อนี้ใช้หรือไม่ ?!'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $scope.cancelOrder(item);
                    console.log('You are sure');
                } else {
                    console.log('You are not sure');
                }
            });
        };

        $scope.cancelOrder = function (order) {
            if (order.deliverystatus === 'confirmed' || order.deliverystatus === 'wait deliver') {
                order.deliverystatus = 'cancel';
                var historystatus = {
                    status: 'cancel',
                    datestatus: new Date()
                };
                order.historystatus.push(historystatus);
                ShopService.cancelOrder(order).then(function (res) {
                    $scope.getNewData();
                }, function (err) {
                    alert(JSON.stringify(err));
                });
            }
        };

        $scope.tabs = 'H';

        $scope.myProfile = $scope.loggedUser;
        $scope.user = {};
        var options = {
            maximumImagesCount: 1,
            width: 800,
            height: 800,
            quality: 80
        };

        $scope.getHistory = function (H) {
            $scope.tabs = H;
        };

        $scope.getProfile = function (P) {
            $scope.tabs = P;
        };

        $scope.toggleItem = function (item) {
            if ($scope.isItemShown(item)) {
                $scope.shownItem = null;
            } else {
                $scope.shownItem = item;
            }
        };

        $scope.isItemShown = function (item) {
            return $scope.shownItem === item;
        };

        $scope.changeImageProfile = function () {
            var optionsImg = {
                maximumImagesCount: 1,
                width: 600,
                height: 600,
                quality: 80
            };

            var options = {
                fileKey: "newProfilePicture",
                httpMethod: "POST",
                mimeType: "image/jpeg",
                chunkedMode: true
            };

            $cordovaImagePicker.getPictures(optionsImg)
                .then(function (results) {
                    var user = AuthService.getUser();
                    $cordovaFileTransfer.upload($scope.apiUrl + 'api/users/picture', results[0], options).then(function (result) {
                        $scope.loggedUser = AuthService.updateUser(result.response);
                        $ionicLoading.hide();
                    }, function (err) {
                        $ionicLoading.hide();
                        alert("ERROR: " + JSON.stringify(err));
                    }, function (progress) {
                        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังอัพโหลดรูปภาพ</p>' });
                    });
                }, function (error) {
                    alert("ERROR: " + JSON.stringify(error));
                });
        }

    })

    .controller('ProductCtrl', function ($scope, $timeout, $rootScope, $state, $stateParams, ShopService, $ionicPopup, $ionicLoading, config, $cordovaSocialSharing) {

        var productId = $stateParams.productId;
        $scope.apiUrl = config.apiUrl;

        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูลสินค้า</p>', duration: 2000 });
        ShopService.getProduct(productId).then(function (product) {
            $scope.product = product;

            $timeout(function () {
                $ionicLoading.hide();
            }, 500);
        });

        $scope.shares = function () {

            $cordovaSocialSharing
                .share($scope.product.name, 'ธรรมธุรกิจ', null, 'https://thamapptest.herokuapp.com/products/' + $scope.product._id) // Share via native share sheet
                .then(function (result) {
                    // Success!
                }, function (err) {
                    // An error occured. Show a message to the user
                });

            // $cordovaSocialSharing
            //     .shareViaFacebook($scope.product.name, $scope.product.images, 'https://thamapptest.herokuapp.com/products/' + $scope.product._id)
            //     .then(function (result) {
            //         // Success!
            //     }, function (err) {
            //         // An error occurred. Show a message to the user
            //     });
        };

        $scope.productGotoCart = {
            qty: 1
        };

        $rootScope.shakeitCart = function () {

            var cartElem = angular.element(document.getElementsByClassName("ion-ios-cart"));
            setTimeout(function () {
                cartElem.addClass('shakeit');
            }, 1000);
            setTimeout(function () {
                cartElem.removeClass('shakeit');
            }, 2000);
        }

        $scope.$watch('productGotoCart.qty', function (newValue, oldValue) {
            if (newValue !== undefined) {
                $scope.productGotoCart.qty = parseInt(newValue);
            } else {
                $scope.productGotoCart.qty = parseInt(oldValue);
            }
        });
        // show add to cart popup on button click
        $scope.showAddToCartPopup = function (product, now) {
            $scope.data = {};
            $scope.data.product = product;
            $scope.data.productOption = 1;
            $scope.data.productQuantity = 1;

            if (now) {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">ซื้อทันที</p>', duration: 1000 });
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
                            onTap: function (e) {
                                return $scope.data;
                            }
                        }
                    ]
                });
                myPopup.then(function (res) {
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

    .controller('ShopCtrl', function ($scope, $rootScope, $stateParams, $ionicLoading, $timeout, ShopService, config, AuthService, $state, $window, $ionicScrollDelegate, $cordovaGeolocation, $ionicPopup, CheckoutService) {

        CheckoutService.getPostcode().then(function (success) {
            $scope.postcodes = success.postcode;
        }, function (err) {
            alert('unsuccess');
        });

        ShopService.getMarketplans().then(function (success) {
            $scope.marketplans = success;
        }, function (err) {
            alert('getMarketplans unsuccess');
        });

        if ($stateParams.cate) {
            $scope.cate = $stateParams.cate;
        }
        $rootScope.loadUser = function () {
            $rootScope.user = AuthService.getUser();
        };
        $rootScope.loadUser();
        if ($stateParams.campaignId) {
            var campaignId = $stateParams.campaignId;
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูลแคมเปญ</p>' });
            ShopService.getCampaign(campaignId).then(function (campaign) {
                $scope.campaign = campaign;
                $timeout(function () {
                    $ionicLoading.hide();
                }, 500);
            });
        }
        if ($rootScope.user) {
            $scope.step = '4';
        } else {
            $scope.step = '1';

        }

        $scope.onPostcodeSelected = function (item) {
            $scope.authentication.address.subdistrict = item.subdistrict;
            $scope.authentication.address.district = item.district;
            $scope.authentication.address.province = item.province;
        };
        $scope.onPostcodeInvalid = function () {
            $scope.authentication.address.subdistrict = '';
            $scope.authentication.address.district = '';
            $scope.authentication.address.province = '';
        };
        $scope.authentication = {};
        $scope.acceptCampaign = {
            status: 'accept'
        };
        $scope.gotoForm = function (num) {
            if (num === '4') {
                $scope.acceptCampaign.user = $rootScope.user;
                $scope.campaign.listusercampaign.push($scope.acceptCampaign);
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                ShopService.acceptCampaign($scope.campaign).then(function (res) {
                    $ionicLoading.hide();
                    $scope.step = num;
                    var myPopup = $ionicPopup.show({
                        title: 'ลงทะเบียนเรียบร้อยแล้ว!!',
                        subTitle: 'คุณได้ลงทะเบียนเรียบร้อยแล้ว',
                        scope: $scope,
                        buttons: [{
                            text: '<b>ตกลง</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                // $scope.gotoForm();
                                $scope.acceptCampaign = {};
                            }
                        }
                        ]
                    });

                    myPopup.then(function (res) {
                        console.log('Tapped!', res);
                    });
                }, function (err) {
                    $scope.acceptCampaign = {};
                    $ionicLoading.hide();
                    if (err.message === 'Identification is already!' || err.message === 'Your identification is Invalid!') {
                        var myPopup = $ionicPopup.show({
                            title: 'ผิดพลาด',
                            subTitle: 'รหัสบัตรประชาชนของคุณไม่ถูกต้อง',
                            scope: $scope,
                            buttons: [{
                                text: '<b>ตกลง</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                    // $scope.gotoForm();
                                    $scope.campaign.listusercampaign.splice($scope.campaign.listusercampaign.length - 1, 1);
                                    $scope.acceptCampaign = {};
                                }
                            }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else if (err.message === 'Privilege is full') {
                        var myPopup = $ionicPopup.show({
                            title: 'ท่านไม่สามารถรับสิทธิ์',
                            subTitle: 'จำนวนสิทธิ์คงเหลือเต็มแล้ว',
                            scope: $scope,
                            buttons: [{
                                text: '<b>ตกลง</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                    // $scope.gotoForm();
                                    $scope.campaign.listusercampaign.splice($scope.campaign.listusercampaign.length - 1, 1);
                                    $scope.acceptCampaign = {};
                                }
                            }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else if (err.message === '') {
                        var myPopup = $ionicPopup.show({
                            title: 'ผิดพลาด',
                            subTitle: 'กรุณาลองใหม่อีกครั้ง',
                            scope: $scope,
                            buttons: [{
                                text: '<b>ตกลง</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                    // $scope.gotoForm();
                                    $scope.campaign.listusercampaign.splice($scope.campaign.listusercampaign.length - 1, 1);
                                    $scope.acceptCampaign = {};
                                }
                            }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else {
                        alert(JSON.stringify(err));
                        $scope.campaign.listusercampaign.splice($scope.campaign.listusercampaign.length - 1, 1);
                        $scope.acceptCampaign = {};
                    }

                })
            } else if (num === '3') {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                AuthService.login($scope.authentication).then(function (success) {
                    $scope.step = '4';
                    $rootScope.loadUser();
                    $ionicLoading.hide();
                }, function (err) {
                    if (err.message === 'Unknown user or invalid password') {
                        var myPopup = $ionicPopup.show({
                            title: 'ผิดพลาด',
                            subTitle: 'ชื่อหรือพาสเวิร์ดไม่ถูกต้อง',
                            scope: $scope,
                            buttons: [{
                                text: '<b>ตกลง</b>',
                                type: 'button-positive',
                                onTap: function (e) {
                                    // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                    // $scope.gotoForm();
                                    $scope.authentication.username = '';
                                    $scope.authentication.password = '';
                                }
                            }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else {
                        alert(JSON.stringify(err));
                    }
                    $scope.step = '1';
                    $ionicLoading.hide();
                })
            } else if (num === '2') {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                $scope.authentication.username = $scope.authentication.username;
                $scope.authentication.password = 'Usr#Pass1234';
                AuthService.login($scope.authentication).then(function (success) {
                    $scope.step = '4';
                    $rootScope.loadUser();
                    $ionicLoading.hide();
                }, function (err) {

                    $scope.step = num;
                    $ionicLoading.hide();
                })
            } else {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                $scope.authentication.address.postcode = $scope.authentication.address.postcode ? $scope.authentication.address.postcode.toString() : null;
                $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                $scope.authentication.address.tel = $scope.authentication.username;
                $scope.authentication.password = 'Usr#Pass1234';
                AuthService.signup($scope.authentication).then(function (res) {
                    $scope.step = '4';
                    $rootScope.loadUser();
                    $ionicLoading.hide();
                }, function (err) {
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
                                    onTap: function (e) {
                                        // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                        $scope.gotoForm();
                                    }
                                }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else {
                        alert(JSON.stringify(err));
                    }

                });
            }
        };
        // alert('user: ' + JSON.stringify($rootScope.user));
        $scope.apiUrl = config.apiUrl;
        $scope.products = [];
        $scope.popular_products = [];
        $scope.scroll = $scope.scroll ? $scope.scroll : true;
        $scope.images = ['img/1.png', 'img/2.png'];
        $scope.readProduct = function () {
            $scope.category = [];
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังโหลดข้อมูลสินค้า</p>' });
            ShopService.getProducts().then(function (products) {
                $scope.products = products;
                for (var i = 0; i < $scope.products.length; i++) {
                    if ($scope.category.indexOf($scope.products[i].category) == -1) {
                        $scope.category.push($scope.products[i].category);
                    }
                }
                $timeout(function () {
                    $ionicLoading.hide();
                }, 500);
            });
            ShopService.getCampaigns().then(function (campaigns) {
                $scope.campaigns = campaigns;
            });
        }

        $scope.getNewData = function () {
            ShopService.getProducts().then(function (products) {
                $scope.products = products;
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        $scope.signout = function () {
            $rootScope.user = null;
            $rootScope.loadUser();
            AuthService.signout();
            $window.location.reload('app.shop.home');
            // $location.path('/app/shop/home');
            // $state.go('app.shop.home')
        }
        $scope.onSwipeRight = function () {
            $scope.scroll = false;
            console.log('right');
        }
        $scope.onSwipeLeft = function () {
            $scope.scroll = false;
            console.log('left');
        }
        $scope.onSwipeUp = function () {
            $scope.scroll = true;
            console.log('up');
        }
        $scope.onSwipeDown = function () {
            $scope.scroll = true;
            console.log('down');
        }

        $scope.successAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'บันทึกข้อมูล',
                template: 'บันทึกตำแหน่งที่ตั้งของคุณเรียบร้อยแล้ว'
            });
            alertPopup.then(function (res) {

            });
        };

        $scope.errorAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'ผิดพลาด!',
                template: 'กรุณาเปิด GPS ในมือถือของท่าน!'
            });
            alertPopup.then(function (res) {

            });
        };

        // var myLatlng = new google.maps.LatLng(13.757884, 100.485148);
        // var mapOptions = {
        //     center: myLatlng,
        //     zoom: 16,
        //     mapTypeId: google.maps.MapTypeId.ROADMAP
        // };
        // var map = new google.maps.Map(document.getElementById("map"), mapOptions);


        $scope.getNewLocation = function () {
            // $scope.loadLocation = '';
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: true
            };
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังตรวจสอบ GPS ของท่าน</p>' });
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    $ionicLoading.hide();
                    $scope.loadLocation = 'success';
                    lat = position.coords.latitude
                    long = position.coords.longitude
                    var myLatlng = new google.maps.LatLng(lat, long);
                    var mapOptions = {
                        center: myLatlng,
                        zoom: 16,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: myLatlng,
                    })

                    $scope.map = map;
                }, function (err) {
                    $ionicLoading.hide();
                    $scope.loadLocation = 'error';
                });
        };


        $scope.updateLocation = function () {
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: true
            };
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังตรวจสอบ GPS ของท่าน</p>' });
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    $ionicLoading.hide();
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    $rootScope.user.address = $rootScope.user.address ? $rootScope.user.address : {};
                    $rootScope.user.address.sharelocation = $rootScope.user.address.sharelocation ? $rootScope.user.address.sharelocation : {};
                    $rootScope.user.address.sharelocation.latitude = lat;
                    $rootScope.user.address.sharelocation.longitude = lng;
                    $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังบันทึกข้อมูล</p>' });
                    AuthService.updateProfile($rootScope.user).then(function (res) {
                        $ionicLoading.hide();
                        $scope.successAlert();
                    }, function (err) {
                        $ionicLoading.hide();
                        alert(JSON.stringify(err));
                    })
                }, function (err) {
                    $ionicLoading.hide();
                    $scope.errorAlert();
                })
        };

    })

    .controller('ShoppingCartCtrl', function ($scope, $rootScope, $state, $stateParams, ShopService, AuthService, $ionicActionSheet, _, config) {
        $scope.state = $stateParams.state;
        $scope.apiUrl = config.apiUrl;
        $scope.products = ShopService.getCartProducts();
        $rootScope.shakeitCart = function () {

            var cartElem = angular.element(document.getElementsByClassName("ion-ios-cart"));
            setTimeout(function () {
                cartElem.addClass('shakeit');
            }, 1000);
            setTimeout(function () {
                cartElem.removeClass('shakeit');
            }, 2000);
        }
        $scope.getTotal = function () {
            $scope.total = 0;
            var alldiscountamount = 0;
            var alldeliverycost = 0;
            var subTotal = 0;
            $scope.products.forEach(function (item) {
                alldiscountamount += item.discountamount;
                alldeliverycost += item.deliverycost;
                subTotal += item.amount;
            });
            $scope.total = subTotal + alldeliverycost - alldiscountamount;
        };

        $scope.getTotal();

        $scope.removeProductFromCart = function (product) {
            $ionicActionSheet.show({
                destructiveText: 'ลบสินค้าออกจากตะกร้า',
                cancelText: 'ยกเลิก',
                cancel: function () {
                    return true;
                },
                destructiveButtonClicked: function () {
                    ShopService.removeProductFromCart(product);
                    $scope.products = ShopService.getCartProducts();
                    $rootScope.shakeitCart();
                    $scope.getTotal();
                    return true;
                }
            });
        };
        $scope.calculate = function (product) {
            ShopService.addProductToCart(product, true);
            $scope.products = ShopService.getCartProducts();
            product.amount = product.qty * product.product.price;
            $scope.getTotal();
        };

        // $scope.getSubtotal = function () {
        //     return _.reduce($scope.products, function (memo, product) { return memo + product.price; }, 0);
        // };

        $scope.getUserAndContinue = function () {
            var user = AuthService.getUser();
            if (user) {
                $state.go('app.checkout');
            } else {
                $state.go('app.shipping-address');
            }
        };

    })

    .controller('CheckoutCtrl', function ($scope, $state, $stateParams, $ionicPopup, CheckoutService, ShopService, AuthService, config, $ionicLoading, $cordovaGeolocation, $http, OpenFB) {
        //$scope.paymentDetails;

        $scope.apiUrl = config.apiUrl;
        $scope.status = true;
        $scope.loginFacebook = function () {
            OpenFB.login('email,public_profile,user_friends,user_photos,user_posts,publish_actions,user_birthday,email,manage_pages,publish_pages,read_page_mailboxes').then(
                function () {

                    // $state.go('app.feed');
                    alert('OpenFB : Login Success!');

                },
                function () {
                    alert('OpenFB : Login Failed! Please Try Again...');
                });
        };

        $scope.signOutFacebook = function () {

            OpenFB.revokePermissions().then(
                function () {
                    // $state.go('facebook-sign-in');
                    alert('OpenFB : Revoke Permissions Success!');
                },
                function () {
                    alert('OpenFB : Revoke Permissions Failed!ppppp');
                });

        };
        // $scope.postcode = CheckoutService.getPostcode();
        CheckoutService.getPostcode().then(function (success) {
            $scope.postcodes = success.postcode;
        }, function (err) {
            alert('unsuccess');
        });
        $scope.user = AuthService.getUser();
        $scope.onPostcodeSelected = function (item) {
            $scope.authentication.address.subdistrict = item.subdistrict;
            $scope.authentication.address.district = item.district;
            $scope.authentication.address.province = item.province;
        };

        $scope.onCheckOutPostcodeSelected = function (item) {
            $scope.order.shipping.subdistrict = item.subdistrict;
            $scope.order.shipping.district = item.district;
            $scope.order.shipping.province = item.province;
        };

        $scope.onCheckOutPostcodeInvalid = function () {
            $scope.order.shipping.subdistrict = '';
            $scope.order.shipping.district = '';
            $scope.order.shipping.province = '';
        };

        $scope.onPostcodeInvalid = function () {
            $scope.authentication.address.subdistrict = '';
            $scope.authentication.address.district = '';
            $scope.authentication.address.province = '';
        };

        if ($stateParams.order) {
            $scope.completeOrder = JSON.parse($stateParams.order);
            // alert(JSON.stringify($scope.completeOrder));
        }
        $scope.order = {
            shipping: {},
            delivery: {
                deliveryid: '0'
            },
            deliveryamount: 0,
            discountpromotion: 0,
            amount: 0,
            totalamount: 0


        };
        $scope.order.items = ShopService.getCartProducts();

        // $scope.order.items.forEach(function(item) {
        //     $scope.order.amount += item.amount;
        //     $scope.order.totalamount = $scope.order.amount;
        // });

        $scope.state = true;
        $scope.step = '1';
        $scope.choice = true;
        $scope.authentication = {}

        $scope.calculate = function () {
            $scope.order.amount = 0;
            $scope.order.totalamount = 0;
            $scope.order.deliveryamount = 0;
            $scope.order.discountpromotion = 0;
            var allDeliverycost = 0;
            var allDiscountAmount = 0;
            $scope.order.items.forEach(function (item) {
                $scope.order.amount += item.amount;
                allDeliverycost += item.deliverycost;
                allDiscountAmount += item.discountamount;
            });
            $scope.order.deliveryamount = allDeliverycost;
            $scope.order.discountpromotion = allDiscountAmount;
            $scope.order.totalamount = $scope.order.amount + $scope.order.deliveryamount - $scope.order.discountpromotion;
        };

        $scope.calculate();

        $scope.gotoForm = function (num) {
            if (num === '4') {
                $state.go('app.checkout');
            } else if (num === '3') {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                AuthService.login($scope.authentication).then(function (res) {
                    $state.go('app.checkout');
                    $ionicLoading.hide();
                    $scope.step = num;
                }, function (err) {
                    $ionicLoading.hide();
                    alert(JSON.stringify(err));
                })
            } else if (num === '2') {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                $scope.authentication.username = $scope.authentication.username;
                $scope.authentication.password = 'Usr#Pass1234';
                AuthService.login($scope.authentication).then(function (success) {
                    $scope.step = '3';
                    $state.go('app.checkout');
                    $ionicLoading.hide();
                }, function (err) {

                    $scope.step = num;
                    $ionicLoading.hide();
                })
            } else {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>' });
                $scope.authentication.address.postcode = $scope.authentication.address.postcode ? $scope.authentication.address.postcode.toString() : null;
                $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                $scope.authentication.address.tel = $scope.authentication.username;
                $scope.authentication.password = 'Usr#Pass1234';
                AuthService.signup($scope.authentication).then(function (res) {
                    $scope.state = false;
                    $scope.step = '3';
                    $state.go('app.checkout');
                    $ionicLoading.hide();
                }, function (err) {
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
                                    onTap: function (e) {
                                        // $scope.authentication.email = $scope.authentication.username + '@thamapp.com';
                                        $scope.gotoForm();
                                    }
                                }
                            ]
                        });

                        myPopup.then(function (res) {
                            console.log('Tapped!', res);
                        });
                    } else {
                        alert(JSON.stringify(err));
                    }

                });
            }
        };

        $scope.confirm = function (status) {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
            $scope.order.docno = (+new Date());
            $scope.order.docdate = new Date();
            if (window.localStorage.platform) {
                $scope.order.src = window.localStorage.platform;
            }
            $scope.order.user = AuthService.getUser();
            $scope.order.platform = 'Mobile';
            $scope.order.shipping.postcode = $scope.order.shipping.postcode ? $scope.order.shipping.postcode.toString() : '';
            $scope.order.shipping.tel = $scope.order.shipping.tel ? $scope.order.shipping.tel : $scope.order.user.address.tel;
            $scope.order.historystatus = [{
                status: 'confirmed',
                datestatus: new Date()
            }];
            if (status === true) {
                $scope.order.shipping.sharelocation = {};
                $scope.order.shipping = $scope.order.user.address;
                $scope.order.shipping.firstname = $scope.order.user.firstName;
                $scope.order.shipping.lastname = $scope.order.user.lastName;
                if ($scope.order.user && $scope.order.user.address.sharelocation) {
                    $scope.order.shipping.sharelocation.latitude = $scope.order.user.address.sharelocation.latitude;
                    $scope.order.shipping.sharelocation.longitude = $scope.order.user.address.sharelocation.longitude;
                    CheckoutService.saveOrder($scope.order).then(function (res) {
                        // alert(JSON.stringify(res));                                
                        $ionicLoading.hide();
                        $state.go('app.complete', {
                            order: JSON.stringify(res)
                        });
                    }, function (err) {
                        alert(err.data.message);
                    });
                } else {
                    var posOptions = {
                        timeout: 10000,
                        enableHighAccuracy: true
                    };

                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (position) {


                            var lat = position.coords.latitude;
                            var lng = position.coords.longitude;
                            $scope.order.shipping.sharelocation = {};
                            // $scope.order.shipping.sharelocation.latitude = lat;
                            // $scope.order.shipping.sharelocation.longitude = lng;
                            // เส้นทางตามถนน
                            var fullAddress = $scope.order.shipping.address + '+' + $scope.order.shipping.subdistrict + '+' + $scope.order.shipping.district + '+' + $scope.order.shipping.province + '+' + $scope.order.shipping.postcode;
                            // alert(fullAddress);
                            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fullAddress + '&key=AIzaSyATqyCgkKXX1FmgzQJmBMw1olkYYEN7lzE').success(function (response) {
                                if (response.status.toUpperCase() === 'OK') {
                                    $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                    $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                    // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                    // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                    //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                    //     if (distance.rows[0].elements[0].distance.value) {
                                    CheckoutService.saveOrder($scope.order).then(function (res) {
                                        // alert(JSON.stringify(res));                                
                                        $ionicLoading.hide();
                                        $state.go('app.complete', {
                                            order: JSON.stringify(res)
                                        });
                                    }, function (err) {
                                        alert(err.data.message);
                                    });
                                    //     } else {
                                    //         $ionicLoading.hide();
                                    //         // alert("5");
                                    //         var confirmPopup = $ionicPopup.confirm({
                                    //             title: 'ระยะห่างของที่อยู่ปัจจุบันกับที่คุณสั่งซื้อห่างกันเกิน 500 เมตร',
                                    //             template: 'คุณต้องการเปลี่ยนที่อยู่ใหม่ไหม?'
                                    //         });
                                    //         confirmPopup.then(function (res) {
                                    //             if (res) {
                                    //                 $scope.order.shipping.sharelocation.latitude = lat;
                                    //                 $scope.order.shipping.sharelocation.longitude = lng;
                                    //                 // api เพื่อ get ข้อมูลที่อยู่ปัจจุบัน เป็นtext
                                    //                 $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false').success(function (results) {


                                    //                     // alert(JSON.stringify(results));

                                    //                     $scope.data = {}
                                    //                     // An elaborate, custom popup
                                    //                     var myPopup1 = $ionicPopup.show({
                                    //                         template: '<input type="text" ng-model="data.address" placeholder="เลขที่ / หมู่บ้าน">',
                                    //                         title: 'ยืนยันที่อยู่ใหม่',
                                    //                         subTitle: 'โปรดตรวจสอบความถูกต้องของที่อยู่',
                                    //                         scope: $scope,
                                    //                         buttons: [
                                    //                             { text: 'Cancel' },
                                    //                             {
                                    //                                 text: '<b>Save</b>',
                                    //                                 type: 'button-positive',
                                    //                                 onTap: function (e) {
                                    //                                     if (!$scope.data.address) {
                                    //                                         // alert(1);
                                    //                                         //don't allow the user to close unless he enters address password
                                    //                                         e.preventDefault();

                                    //                                     } else {
                                    //                                         // alert(JSON.stringify(results.results[0]));
                                    //                                         //  alert(JSON.stringify(results[0]));
                                    //                                         $scope.order.shipping.address = $scope.data.address;
                                    //                                         $scope.order.shipping.postcode = results.results[0].address_components[6].short_name;
                                    //                                         $scope.order.shipping.subdistrict = results.results[0].address_components[2].short_name;
                                    //                                         $scope.order.shipping.province = results.results[0].address_components[4].short_name;
                                    //                                         $scope.order.shipping.district = results.results[0].address_components[3].short_name;
                                    //                                         CheckoutService.saveOrder($scope.order).then(function (res) {
                                    //                                             $ionicLoading.hide();
                                    //                                             console.log(res);
                                    //                                             $state.go('app.complete', {
                                    //                                                 order: JSON.stringify(res)
                                    //                                             });
                                    //                                         }, function (err) {
                                    //                                             alert(err.data.message);
                                    //                                         });
                                    //                                         return $scope.data.address;
                                    //                                     }
                                    //                                 }
                                    //                             },
                                    //                         ]
                                    //                     });
                                    //                     // alert(JSON.stringify(results));
                                    //                     var newAdress = results;

                                    //                     myPopup1.then(function (resp) {
                                    //                         // alert(3);

                                    //                         // postcode: String,
                                    //                         //     subdistrict: String,
                                    //                         //         province: String,
                                    //                         //             district: String,
                                    //                     });

                                    //                 }).error(function (err) {

                                    //                 });
                                    //             } else {
                                    //                 $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                    //                 $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                    //                 // alert();
                                    //                 $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
                                    //                 CheckoutService.saveOrder($scope.order).then(function (res) {
                                    //                     $ionicLoading.hide();
                                    //                     console.log(res);
                                    //                     $state.go('app.complete', {
                                    //                         order: JSON.stringify(res)
                                    //                     });
                                    //                 }, function (err) {
                                    //                     alert(err.data.message);
                                    //                 });
                                    //             }
                                    //         });
                                    //     };
                                    // }).error(function (err) {
                                    //     console.log(err);
                                    // });
                                } else {

                                    $scope.order.shipping.sharelocation.latitude = lat;
                                    $scope.order.shipping.sharelocation.longitude = lng;
                                    // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                    // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                    //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                    //     if (distance.rows[0].elements[0].distance.value) {
                                    CheckoutService.saveOrder($scope.order).then(function (res) {
                                        // alert(JSON.stringify(res));                                
                                        $ionicLoading.hide();
                                        console.log(res);
                                        $state.go('app.complete', {
                                            order: JSON.stringify(res)
                                        });
                                    }, function (err) {
                                        alert(err.data.message);
                                    });
                                }
                                function successCallback(res) {
                                    vm.cart.clear();
                                    $state.go('complete', {
                                        orderId: res._id
                                    });
                                }
                                function errorCallback(res) {
                                    vm.error = res.data.message;
                                }
                            }).error(function (err) {
                                console.log(err);
                            });




                        }, function (err) {

                            $scope.order.shipping.sharelocation = {};
                            // $scope.order.shipping.sharelocation.latitude = lat;
                            // $scope.order.shipping.sharelocation.longitude = lng;
                            // เส้นทางตามถนน
                            var fullAddress = $scope.order.shipping.address + '+' + $scope.order.shipping.subdistrict + '+' + $scope.order.shipping.district + '+' + $scope.order.shipping.province + '+' + $scope.order.shipping.postcode;
                            // alert(fullAddress);
                            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fullAddress + '&key=AIzaSyATqyCgkKXX1FmgzQJmBMw1olkYYEN7lzE').success(function (response) {
                                if (response.status.toUpperCase() === 'OK') {
                                    $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                    $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                    // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                    // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                    //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                    //     if (distance.rows[0].elements[0].distance.value) {
                                    CheckoutService.saveOrder($scope.order).then(function (res) {
                                        // alert(JSON.stringify(res));
                                        $ionicLoading.hide();
                                        console.log(res);
                                        $state.go('app.complete', {
                                            order: JSON.stringify(res)
                                        });
                                    }, function (err) {
                                        alert(err.data.message);
                                    });
                                    //     } else {
                                    //         $ionicLoading.hide();
                                    //         // alert("5");
                                    //         var confirmPopup = $ionicPopup.confirm({
                                    //             title: 'ระยะห่างของที่อยู่ปัจจุบันกับที่คุณสั่งซื้อห่างกันเกิน 500 เมตร',
                                    //             template: 'คุณต้องการเปลี่ยนที่อยู่ใหม่ไหม?'
                                    //         });
                                    //         confirmPopup.then(function (res) {
                                    //             if (res) {
                                    //                 $scope.order.shipping.sharelocation.latitude = lat;
                                    //                 $scope.order.shipping.sharelocation.longitude = lng;
                                    //                 // api เพื่อ get ข้อมูลที่อยู่ปัจจุบัน เป็นtext
                                    //                 $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false').success(function (results) {


                                    //                     // alert(JSON.stringify(results));

                                    //                     $scope.data = {}
                                    //                     // An elaborate, custom popup
                                    //                     var myPopup1 = $ionicPopup.show({
                                    //                         template: '<input type="text" ng-model="data.address" placeholder="เลขที่ / หมู่บ้าน">',
                                    //                         title: 'ยืนยันที่อยู่ใหม่',
                                    //                         subTitle: 'โปรดตรวจสอบความถูกต้องของที่อยู่',
                                    //                         scope: $scope,
                                    //                         buttons: [
                                    //                             { text: 'Cancel' },
                                    //                             {
                                    //                                 text: '<b>Save</b>',
                                    //                                 type: 'button-positive',
                                    //                                 onTap: function (e) {
                                    //                                     if (!$scope.data.address) {
                                    //                                         // alert(1);
                                    //                                         //don't allow the user to close unless he enters address password
                                    //                                         e.preventDefault();

                                    //                                     } else {
                                    //                                         // alert(JSON.stringify(results.results[0]));
                                    //                                         //  alert(JSON.stringify(results[0]));
                                    //                                         $scope.order.shipping.address = $scope.data.address;
                                    //                                         $scope.order.shipping.postcode = results.results[0].address_components[6].short_name;
                                    //                                         $scope.order.shipping.subdistrict = results.results[0].address_components[2].short_name;
                                    //                                         $scope.order.shipping.province = results.results[0].address_components[4].short_name;
                                    //                                         $scope.order.shipping.district = results.results[0].address_components[3].short_name;
                                    //                                         CheckoutService.saveOrder($scope.order).then(function (res) {
                                    //                                             $ionicLoading.hide();
                                    //                                             console.log(res);
                                    //                                             $state.go('app.complete', {
                                    //                                                 order: JSON.stringify(res)
                                    //                                             });
                                    //                                         }, function (err) {
                                    //                                             alert(err.data.message);
                                    //                                         });
                                    //                                         return $scope.data.address;
                                    //                                     }
                                    //                                 }
                                    //                             },
                                    //                         ]
                                    //                     });
                                    //                     // alert(JSON.stringify(results));
                                    //                     var newAdress = results;

                                    //                     myPopup1.then(function (resp) {
                                    //                         // alert(3);

                                    //                         // postcode: String,
                                    //                         //     subdistrict: String,
                                    //                         //         province: String,
                                    //                         //             district: String,
                                    //                     });

                                    //                 }).error(function (err) {

                                    //                 });
                                    //             } else {
                                    //                 $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                    //                 $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                    //                 // alert();
                                    //                 $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
                                    //                 CheckoutService.saveOrder($scope.order).then(function (res) {
                                    //                     $ionicLoading.hide();
                                    //                     console.log(res);
                                    //                     $state.go('app.complete', {
                                    //                         order: JSON.stringify(res)
                                    //                     });
                                    //                 }, function (err) {
                                    //                     alert(err.data.message);
                                    //                 });
                                    //             }
                                    //         });
                                    //     };
                                    // }).error(function (err) {
                                    //     console.log(err);
                                    // });
                                } else {

                                    $scope.order.shipping.sharelocation.latitude = '';
                                    $scope.order.shipping.sharelocation.longitude = '';
                                    // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                    // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                    //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                    //     if (distance.rows[0].elements[0].distance.value) {
                                    CheckoutService.saveOrder($scope.order).then(function (res) {
                                        // alert(JSON.stringify(res));                                
                                        $ionicLoading.hide();
                                        console.log(res);
                                        $state.go('app.complete', {
                                            order: JSON.stringify(res)
                                        });
                                    }, function (err) {
                                        alert(err.data.message);
                                    });
                                }
                            });

                            $ionicLoading.hide();

                            if (error.code == PositionError.PERMISSION_DENIED) {
                                alert("Permission denied. check setting");
                            } else if (error.code == PositionError.POSITION_UNAVAILABLE) {
                                alert("Cannot get position. May be problem with network or can't get a satellite fix.");
                            } else if (error.code == PositionError.TIMEOUT) {
                                alert("Geolocation is timed out.");
                            } else {
                                alert(error.message);
                            }
                        });
                }
            } else {
                var posOptions = {
                    timeout: 10000,
                    enableHighAccuracy: true
                };

                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {


                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;


                        // alert(lat + ' ' + lng);


                        $scope.order.shipping.sharelocation = {};
                        // $scope.order.shipping.sharelocation.latitude = lat;
                        // $scope.order.shipping.sharelocation.longitude = lng;
                        // เส้นทางตามถนน
                        var fullAddress = $scope.order.shipping.address + '+' + $scope.order.shipping.subdistrict + '+' + $scope.order.shipping.district + '+' + $scope.order.shipping.province + '+' + $scope.order.shipping.postcode;
                        // alert(fullAddress);
                        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fullAddress + '&key=AIzaSyATqyCgkKXX1FmgzQJmBMw1olkYYEN7lzE').success(function (response) {
                            if (response.status.toUpperCase() === 'OK') {
                                $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                //     if (distance.rows[0].elements[0].distance.value) {
                                CheckoutService.saveOrder($scope.order).then(function (res) {
                                    // alert(JSON.stringify(res));                                
                                    $ionicLoading.hide();
                                    $state.go('app.complete', {
                                        order: JSON.stringify(res)
                                    });
                                }, function (err) {
                                    alert(err.data.message);
                                });
                                //     } else {
                                //         $ionicLoading.hide();
                                //         // alert("5");
                                //         var confirmPopup = $ionicPopup.confirm({
                                //             title: 'ระยะห่างของที่อยู่ปัจจุบันกับที่คุณสั่งซื้อห่างกันเกิน 500 เมตร',
                                //             template: 'คุณต้องการเปลี่ยนที่อยู่ใหม่ไหม?'
                                //         });
                                //         confirmPopup.then(function (res) {
                                //             if (res) {
                                //                 $scope.order.shipping.sharelocation.latitude = lat;
                                //                 $scope.order.shipping.sharelocation.longitude = lng;
                                //                 // api เพื่อ get ข้อมูลที่อยู่ปัจจุบัน เป็นtext
                                //                 $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false').success(function (results) {


                                //                     // alert(JSON.stringify(results));

                                //                     $scope.data = {}
                                //                     // An elaborate, custom popup
                                //                     var myPopup1 = $ionicPopup.show({
                                //                         template: '<input type="text" ng-model="data.address" placeholder="เลขที่ / หมู่บ้าน">',
                                //                         title: 'ยืนยันที่อยู่ใหม่',
                                //                         subTitle: 'โปรดตรวจสอบความถูกต้องของที่อยู่',
                                //                         scope: $scope,
                                //                         buttons: [
                                //                             { text: 'Cancel' },
                                //                             {
                                //                                 text: '<b>Save</b>',
                                //                                 type: 'button-positive',
                                //                                 onTap: function (e) {
                                //                                     if (!$scope.data.address) {
                                //                                         // alert(1);
                                //                                         //don't allow the user to close unless he enters address password
                                //                                         e.preventDefault();

                                //                                     } else {
                                //                                         // alert(JSON.stringify(results.results[0]));
                                //                                         //  alert(JSON.stringify(results[0]));
                                //                                         $scope.order.shipping.address = $scope.data.address;
                                //                                         $scope.order.shipping.postcode = results.results[0].address_components[6].short_name;
                                //                                         $scope.order.shipping.subdistrict = results.results[0].address_components[2].short_name;
                                //                                         $scope.order.shipping.province = results.results[0].address_components[4].short_name;
                                //                                         $scope.order.shipping.district = results.results[0].address_components[3].short_name;
                                //                                         CheckoutService.saveOrder($scope.order).then(function (res) {
                                //                                             $ionicLoading.hide();
                                //                                             console.log(res);
                                //                                             $state.go('app.complete', {
                                //                                                 order: JSON.stringify(res)
                                //                                             });
                                //                                         }, function (err) {
                                //                                             alert(err.data.message);
                                //                                         });
                                //                                         return $scope.data.address;
                                //                                     }
                                //                                 }
                                //                             },
                                //                         ]
                                //                     });
                                //                     // alert(JSON.stringify(results));
                                //                     var newAdress = results;

                                //                     myPopup1.then(function (resp) {
                                //                         // alert(3);

                                //                         // postcode: String,
                                //                         //     subdistrict: String,
                                //                         //         province: String,
                                //                         //             district: String,
                                //                     });

                                //                 }).error(function (err) {

                                //                 });
                                //             } else {
                                //                 $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                //                 $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                //                 // alert();
                                //                 $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
                                //                 CheckoutService.saveOrder($scope.order).then(function (res) {
                                //                     $ionicLoading.hide();
                                //                     console.log(res);
                                //                     $state.go('app.complete', {
                                //                         order: JSON.stringify(res)
                                //                     });
                                //                 }, function (err) {
                                //                     alert(err.data.message);
                                //                 });
                                //             }
                                //         });
                                //     };
                                // }).error(function (err) {
                                //     console.log(err);
                                // });
                            } else {

                                $scope.order.shipping.sharelocation.latitude = lat;
                                $scope.order.shipping.sharelocation.longitude = lng;
                                // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                //     if (distance.rows[0].elements[0].distance.value) {
                                CheckoutService.saveOrder($scope.order).then(function (res) {
                                    // alert(JSON.stringify(res));                                
                                    $ionicLoading.hide();
                                    console.log(res);
                                    $state.go('app.complete', {
                                        order: JSON.stringify(res)
                                    });
                                }, function (err) {
                                    alert(err.data.message);
                                });
                            }
                            function successCallback(res) {
                                vm.cart.clear();
                                $state.go('complete', {
                                    orderId: res._id
                                });
                            }
                            function errorCallback(res) {
                                vm.error = res.data.message;
                            }
                        }).error(function (err) {
                            console.log(err);
                        });




                    }, function (err) {

                        $scope.order.shipping.sharelocation = {};
                        // $scope.order.shipping.sharelocation.latitude = lat;
                        // $scope.order.shipping.sharelocation.longitude = lng;
                        // เส้นทางตามถนน
                        var fullAddress = $scope.order.shipping.address + '+' + $scope.order.shipping.subdistrict + '+' + $scope.order.shipping.district + '+' + $scope.order.shipping.province + '+' + $scope.order.shipping.postcode;
                        // alert(fullAddress);
                        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fullAddress + '&key=AIzaSyATqyCgkKXX1FmgzQJmBMw1olkYYEN7lzE').success(function (response) {
                            if (response.status.toUpperCase() === 'OK') {
                                $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                //     if (distance.rows[0].elements[0].distance.value) {
                                CheckoutService.saveOrder($scope.order).then(function (res) {
                                    // alert(JSON.stringify(res));
                                    $ionicLoading.hide();
                                    console.log(res);
                                    $state.go('app.complete', {
                                        order: JSON.stringify(res)
                                    });
                                }, function (err) {
                                    alert(err.data.message);
                                });
                                //     } else {
                                //         $ionicLoading.hide();
                                //         // alert("5");
                                //         var confirmPopup = $ionicPopup.confirm({
                                //             title: 'ระยะห่างของที่อยู่ปัจจุบันกับที่คุณสั่งซื้อห่างกันเกิน 500 เมตร',
                                //             template: 'คุณต้องการเปลี่ยนที่อยู่ใหม่ไหม?'
                                //         });
                                //         confirmPopup.then(function (res) {
                                //             if (res) {
                                //                 $scope.order.shipping.sharelocation.latitude = lat;
                                //                 $scope.order.shipping.sharelocation.longitude = lng;
                                //                 // api เพื่อ get ข้อมูลที่อยู่ปัจจุบัน เป็นtext
                                //                 $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false').success(function (results) {


                                //                     // alert(JSON.stringify(results));

                                //                     $scope.data = {}
                                //                     // An elaborate, custom popup
                                //                     var myPopup1 = $ionicPopup.show({
                                //                         template: '<input type="text" ng-model="data.address" placeholder="เลขที่ / หมู่บ้าน">',
                                //                         title: 'ยืนยันที่อยู่ใหม่',
                                //                         subTitle: 'โปรดตรวจสอบความถูกต้องของที่อยู่',
                                //                         scope: $scope,
                                //                         buttons: [
                                //                             { text: 'Cancel' },
                                //                             {
                                //                                 text: '<b>Save</b>',
                                //                                 type: 'button-positive',
                                //                                 onTap: function (e) {
                                //                                     if (!$scope.data.address) {
                                //                                         // alert(1);
                                //                                         //don't allow the user to close unless he enters address password
                                //                                         e.preventDefault();

                                //                                     } else {
                                //                                         // alert(JSON.stringify(results.results[0]));
                                //                                         //  alert(JSON.stringify(results[0]));
                                //                                         $scope.order.shipping.address = $scope.data.address;
                                //                                         $scope.order.shipping.postcode = results.results[0].address_components[6].short_name;
                                //                                         $scope.order.shipping.subdistrict = results.results[0].address_components[2].short_name;
                                //                                         $scope.order.shipping.province = results.results[0].address_components[4].short_name;
                                //                                         $scope.order.shipping.district = results.results[0].address_components[3].short_name;
                                //                                         CheckoutService.saveOrder($scope.order).then(function (res) {
                                //                                             $ionicLoading.hide();
                                //                                             console.log(res);
                                //                                             $state.go('app.complete', {
                                //                                                 order: JSON.stringify(res)
                                //                                             });
                                //                                         }, function (err) {
                                //                                             alert(err.data.message);
                                //                                         });
                                //                                         return $scope.data.address;
                                //                                     }
                                //                                 }
                                //                             },
                                //                         ]
                                //                     });
                                //                     // alert(JSON.stringify(results));
                                //                     var newAdress = results;

                                //                     myPopup1.then(function (resp) {
                                //                         // alert(3);

                                //                         // postcode: String,
                                //                         //     subdistrict: String,
                                //                         //         province: String,
                                //                         //             district: String,
                                //                     });

                                //                 }).error(function (err) {

                                //                 });
                                //             } else {
                                //                 $scope.order.shipping.sharelocation.latitude = response.results[0].geometry.location.lat;
                                //                 $scope.order.shipping.sharelocation.longitude = response.results[0].geometry.location.lng;
                                //                 // alert();
                                //                 $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กรุณารอสักครู่</p>' });
                                //                 CheckoutService.saveOrder($scope.order).then(function (res) {
                                //                     $ionicLoading.hide();
                                //                     console.log(res);
                                //                     $state.go('app.complete', {
                                //                         order: JSON.stringify(res)
                                //                     });
                                //                 }, function (err) {
                                //                     alert(err.data.message);
                                //                 });
                                //             }
                                //         });
                                //     };
                                // }).error(function (err) {
                                //     console.log(err);
                                // });
                            } else {

                                $scope.order.shipping.sharelocation.latitude = '';
                                $scope.order.shipping.sharelocation.longitude = '';
                                // alert(response.results[0].geometry.location.lat + response.results[0].geometry.location.lng);
                                // $http.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + lat + ',' + lng + '&destinations=' + response.results[0].geometry.location.lat + ',' + response.results[0].geometry.location.lng + '&key=AIzaSyBY4B67oPlLL9AdfXNTQl6JP_meTTzq8xY').success(function (distance) {
                                //     // alert(JSON.stringify(distance.rows[0].elements[0].distance.value));
                                //     if (distance.rows[0].elements[0].distance.value) {
                                CheckoutService.saveOrder($scope.order).then(function (res) {
                                    // alert(JSON.stringify(res));                                
                                    $ionicLoading.hide();
                                    console.log(res);
                                    $state.go('app.complete', {
                                        order: JSON.stringify(res)
                                    });
                                }, function (err) {
                                    alert(err.data.message);
                                });
                            }
                        });

                        $ionicLoading.hide();

                        if (error.code == PositionError.PERMISSION_DENIED) {
                            alert("Permission denied. check setting");
                        } else if (error.code == PositionError.POSITION_UNAVAILABLE) {
                            alert("Cannot get position. May be problem with network or can't get a satellite fix.");
                        } else if (error.code == PositionError.TIMEOUT) {
                            alert("Geolocation is timed out.");
                        } else {
                            alert(error.message);
                        }
                    });
            }
        };

    })

    .controller('SettingsCtrl', function ($scope, $state, $ionicModal, AuthService, $rootScope) {

        $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.privacy_policy_modal = modal;
        });

        $scope.showPrivacyPolicy = function () {
            $scope.privacy_policy_modal.show();
        };

        $scope.signout = function () {
            AuthService.signout();
            $state.go('app.shop.home')
        }

    })

    .controller('ChatCtrl', function ($scope, $state, $ionicModal, AuthService, $rootScope, roomService, Socket) {
        $scope.listRoom = function () {
            roomService.getrooms().then(function (res) {
                $scope.chats = res;
            }, function (err) {
                console.log(err);
            });
        };
        $scope.listRoom();
        $scope.createRoom = function (data) {
            roomService.createRoom(data).then(function (res) {
                $scope.listRoom();
            }, function (err) {
                console.log(err);
            });
        };

        Socket.on('invite', function (res) {
            $scope.listRoom();
        });

    })

    .controller('ChatDetailCtrl', function ($scope, $state, $ionicModal, AuthService, $rootScope, roomService, $stateParams, Socket, $ionicScrollDelegate, $timeout) {
        $scope.user = AuthService.getUser();
        var roomId = $stateParams.chatId;
        $scope.messages = [];
        $scope.chat = null;
        $scope.room = {};
        Socket.connect();
        // ทดสอบ mobile connect
        // Socket.on('mobile', function (message) {
        //   $scope.messages.unshift(message);
        // });

        roomService.getRoom(roomId).then(function (res) {
            $scope.chat = res;
            Socket.emit('join', $scope.chat);
            $scope.chat.users.forEach(function (user) {
                if ($scope.user._id != user._id) {
                    $scope.title = user.displayName;
                }
            });
        }, function (err) {
            console.log(err);
        });
        // Add an event listener to the 'invite' event
        Socket.on('invite', function (res) {
            // alert('invite : ' + JSON.stringify(data));
            Socket.emit('join', res);
        });

        // Add an event listener to the 'joinsuccess' event
        Socket.on('joinsuccess', function (data) {
            $scope.room = data;
            // alert('joinsuccess : ' + JSON.stringify(data));
        });

        // Add an event listener to the 'chatMessage' event
        Socket.on('chatMessage', function (data) {
            // alert(JSON.stringify(data));
            $scope.room = data;
        });
        $scope.hideTime = true;
        var alternate,
            isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
        // Create a controller method for sending messages
        $scope.sendMessage = function () {
            // alternate = !alternate
            // if (!$scope.room.messages) {
            //     $scope.room.messages = [];
            $scope.room.messages.unshift({
                type: 'message',
                created: Date.now(),
                profileImageURL: $scope.user.profileImageURL,
                username: $scope.user.username,
                text: this.message
            });
            // } else {
            //     $scope.room.messages.unshift({
            //         type: 'message',
            //         created: Date.now(),
            //         profileImageURL: $scope.user.profileImageURL,
            //         username: $scope.user.username,
            //         text: this.message
            //     });
            // }
            $ionicScrollDelegate.scrollBottom(true);

            Socket.emit('chatMessage', $scope.room);
            this.message = '';
        };








        // $scope.sendMessage = function () {
        //     alternate = !alternate;

        //     // var d = new Date();
        //     // d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
        //     // $scope.room.messages.forEach(function(message){

        //     // });
        //     $scope.messages.push({
        //         userId: alternate ? '12345' : '54321',
        //         text: $scope.room.message,
        //         time: d
        //     });

        //     delete $scope.room.message;
        //     $ionicScrollDelegate.scrollBottom(true);

        // };

        $scope.inputUp = function () {
            if (isIOS) $scope.room.keyboardHeight = 216;
            $timeout(function () {
                $ionicScrollDelegate.scrollBottom(true);
            }, 300);

        };

        $scope.inputDown = function () {
            if (isIOS) $scope.room.keyboardHeight = 0;
            $ionicScrollDelegate.resize();
        };

        $scope.closeKeyboard = function () {
            // cordova.plugins.Keyboard.close();
        };


        $scope.data = {};
        $scope.myId = $scope.user.username;
    })

    .controller('FriendsCtrl', function ($scope, $state, $ionicModal, AuthService, $rootScope, roomService, Socket) {
        $scope.user = AuthService.getUser();
        $scope.listAccount = function () {
            $scope.listRoom = [];
            $scope.friends = [];
            roomService.getrooms().then(function (rooms) {
                rooms.forEach(function (room) {
                    room.users.forEach(function (user) {
                        if ($scope.user._id === user._id) {
                            $scope.listRoom.push(room);
                        }
                    });
                });
                if ($scope.listRoom.length > 0) {
                    $scope.listRoom.forEach(function (room) {
                        room.users.forEach(function (user) {
                            if ($scope.user._id !== user._id) {
                                $scope.friends.push(user);
                            }
                        });
                    });
                }
                alert($scope.friends.length);
                AuthService.getusers().then(function (accounts) {
                    $scope.accounts = accounts;
                }, function (err) {
                    console.log(err);
                });
            });
        };
        $scope.listAccount();
        $scope.addFriend = function (user) {
            var data = {
                name: $scope.user.username + '' + user.username,
                type: 'P',
                users: [$scope.user, user],
                user: $scope.user
            };
            Socket.emit('createroom', data);
        };
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
