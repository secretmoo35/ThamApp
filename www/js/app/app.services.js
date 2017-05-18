angular.module('your_app_name.app.services', [])

    .service('AuthService', function ($q, $http, config, $rootScope, $auth) {
        var apiUrl = config.apiUrl;

        // window.localStorage.removeItem('ionTheme1_cart');
        this.getUser = function () {
            return (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
        };

        this.updateUser = function (newUser) {

            window.localStorage.user = newUser;
            return JSON.parse(window.localStorage.user);

        };

        this.signout = function () {
            $auth.logout({ url: config.apiUrl + 'api/auth/signout' })
                .then(function () {
                    window.localStorage.removeItem('user');
                    window.localStorage.removeItem('credential');
                    $rootScope.$emit('userLoggedOut');
                });
        };

        this.login = function (user) {
            window.localStorage.credential = JSON.stringify(user);

            $auth
                .login(user, { url: config.apiUrl + 'api/auth/signin' })
                .then(this.successAuth)
                .catch(this.failedAuth);

            // var dfd = $q.defer();

            // $http.post(apiUrl + 'api/auth/signin', user).success(function (res) {
            //     window.localStorage.user = JSON.stringify(res);
            //     dfd.resolve(res);

            // }).error(function (err) {
            //     dfd.reject(err);
            // });

            // return dfd.promise;

        };

        this.shippingLogin = function (user) {
            window.localStorage.credential = JSON.stringify(user);

            $auth
                .login(user, { url: config.apiUrl + 'api/auth/signin' })
                .then(this.successAuthShipping)
                .catch(this.failedAuthShipping);

            // var dfd = $q.defer();

            // $http.post(apiUrl + 'api/auth/signin', user).success(function (res) {
            //     window.localStorage.user = JSON.stringify(res);
            //     dfd.resolve(res);

            // }).error(function (err) {
            //     dfd.reject(err);
            // });

            // return dfd.promise;

        };

        this.signup = function (user) {

            $auth
                .signup(user, { url: config.apiUrl + 'api/auth/signup' })
                .then(this.successAuth)
                .catch(this.failedAuth);

            // var dfd = $q.defer();

            // $http.post(apiUrl + 'api/auth/signup', user).success(function (res) {

            //     window.localStorage.user = JSON.stringify(res);
            //     dfd.resolve(res);

            // }).error(function (err) {
            //     dfd.reject(err);
            // });

            // return dfd.promise;

        };

        this.updateProfile = function (data) {

            var dfd = $q.defer();
            var user = this.getUser();
            $http.put(apiUrl + 'api/users', data, user).then(function (res) {

                window.localStorage.user = JSON.stringify(res.data);
                dfd.resolve(res);

            }, function (err) {
                dfd.reject(err.data.message);
            });

            return dfd.promise;

        };

        this.changePassword = function (passwordDetails) {

            var dfd = $q.defer();
            var user = this.getUser();
            $http.post(apiUrl + 'api/users/password', passwordDetails, user).then(function (res) {

                dfd.resolve(res);

            }, function (err) {
                dfd.reject(err.data.message);
            });

            return dfd.promise;

        };

        this.saveUserPushNoti = function (push_user) {
            var dfd = $q.defer();
            $http.post(apiUrl + 'api/pushnotiusers', push_user).success(function (database) {
                dfd.resolve(database);
            }).error(function (error) {
                /* Act on the event */
                alert(JSON.stringify(error));
                dfd.resolve(error);
                // return dfd.promise;
            });
            return dfd.promise;
        };

        this.getusers = function () {
            var dfd = $q.defer();
            var user = this.getUser();
            $http.get(config.apiUrl + 'api/users').success(function (data) {
                // window.localStorage.setItem("storage", JSON.stringify(data));
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        }

        this.authenticate = function (provider) {
            $auth
                .authenticate(provider)
                .then(this.successAuth)
                .catch(this.failedAuth);
        };

        this.successAuth = function (data) {
            window.localStorage.user = JSON.stringify(data.data);
            $rootScope.$emit('userLoggedIn', data.data);
        };

        this.failedAuth = function (err) {
            $rootScope.$emit('userFailedLogin', err.data);
        };

        this.successAuthShipping = function (data) {
            window.localStorage.user = JSON.stringify(data.data);
            $rootScope.$emit('userLoggedInShipping', data.data);
        };

        this.failedAuthShipping = function (err) {
            $rootScope.$emit('userFailedLoginShipping', err.data);
        };


    })

    .service('roomService', function ($http, $q, config) {
        this.getrooms = function () {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            $http.get(config.apiUrl + 'api/chatrooms', user).success(function (data) {
                // window.localStorage.setItem("storage", JSON.stringify(data));
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };

        this.getRoom = function (roomId) {
            var dfd = $q.defer();
            $http.get(config.apiUrl + 'api/chatrooms/' + roomId).success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.createRoom = function (data) {
            var dfd = $q.defer();
            $http.post(config.apiUrl + 'api/chatrooms', data).success(function (data) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            })
            return dfd.promise;
        };
    })
    
    .service('ShopService', function ($http, $q, _, config) {

        var apiUrl = config.apiUrl;

        // window.localStorage.clear(); //# เคลียร์ localStorage ทั้งหมด สำหรับ test อย่างเดียว 20161223 by Moo.

        this.getProducts = function () {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/products').success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getProduct = function (productId) {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/products/' + productId).success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getMarketplans = function () {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/marketplans/').success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getCampaigns = function () {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/campaigns/').success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getCampaign = function (campaignId) {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/campaigns/' + campaignId).success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getDeliveryCost = function (product) {
            if (product.product.deliveryratetype === 0) {
                product.deliverycost = 0;
            } else if (product.product.deliveryratetype === 1) {
                product.deliverycost = product.qty * product.product.valuetype1;
            } else if (product.product.deliveryratetype === 2) {
                for (var i = 0; i < product.product.rangtype2.length; i++) {
                    if (product.qty >= product.product.rangtype2[i].min && product.qty <= product.product.rangtype2[i].max) {
                        product.deliverycost = product.product.rangtype2[i].value;
                    }
                }
            }
        };

        this.getPromotion = function (product) {

            for (var i = 0; i < product.product.promotions.length; i++) {
                var sumQtyCheckCondition = parseInt(product.qty / product.product.promotions[i].condition);
                product.discountamount = sumQtyCheckCondition * product.product.promotions[i].discount.fixBath;
            }
            this.getDeliveryCost(product);

        };

        this.addProductToCart = function (productToAdd, update) {
            productToAdd.price = productToAdd.product.price;
            productToAdd.retailerprice = productToAdd.product.retailerprice;
            productToAdd.discountamount = 0;
            productToAdd.deliverycost = 0;
            var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

            //check if this product is already saved
            var existing_product = _.find(cart_products, function (product) {
                return product.product._id === productToAdd.product._id;
            });



            if (cart_products.length === 0) {
                this.getPromotion(productToAdd);
                cart_products.push(productToAdd);
            } else {
                if (existing_product != undefined && existing_product.product._id === productToAdd.product._id) {
                    if (update) {
                        existing_product.qty = productToAdd.qty
                    } else {
                        existing_product.qty += productToAdd.qty;
                    }
                    this.getPromotion(existing_product);


                    existing_product.amount = 0;
                    existing_product.amount += existing_product.qty * existing_product.product.price;
                } else {
                    this.getPromotion(productToAdd);
                    cart_products.push(productToAdd);
                }
            }

            window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
        };

        this.getCartProducts = function () {
            return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
        };

        this.getCountProduct = function () {

            var getCartProducts = this.getCartProducts();
            var count = 0;
            getCartProducts.forEach(function (product) {
                count += product.qty;
            });
            return count;
        };

        this.removeProductFromCart = function (productToRemove) {
            var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

            var new_cart_products = _.reject(cart_products, function (product) {
                return product.product._id == productToRemove.product._id;
            });

            window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
        };

        this.getCompleteOrder = function () {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            var data = [];
            $http.get(apiUrl + 'api/orders').success(function (database) {
                database.forEach(function (item) {
                    if (item.user && item.user._id === user._id) {
                        data.push(item);
                    }
                });
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            });
            return dfd.promise;
        }

        this.getCompleteOrderById = function (id) {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            var data = [];
            $http.get(apiUrl + 'api/orders/' + id).success(function (database) {
                dfd.resolve(database);
            }).error(function (err) {
                dfd.reject(err);
            });
            return dfd.promise;
        }

        this.cancelOrder = function (order) {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            var data = [];
            $http.put(apiUrl + 'api/orders/' + order._id, order).success(function (database) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            });;
            return dfd.promise;
        }

        this.acceptCampaign = function (accept) {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            var data = [];
            $http.put(apiUrl + 'api/campaigns/' + accept._id, accept).success(function (database) {
                dfd.resolve(data);
            }).error(function (err) {
                dfd.reject(err);
            });;
            return dfd.promise;
        }

    })

    .service('QuizService', function ($http, $q, _, config) {

        var apiUrl = config.apiUrl;

        // window.localStorage.clear(); //# เคลียร์ localStorage ทั้งหมด สำหรับ test อย่างเดียว 20161223 by Moo.

        this.getQuizs = function () {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/quizzes').success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.getQuiz = function (quizId) {
            var dfd = $q.defer();
            $http.get(apiUrl + 'api/quizzes/' + quizId).success(function (database) {
                dfd.resolve(database);
            });
            return dfd.promise;
        };

        this.saveQuiz = function (quiz) {
            var dfd = $q.defer();
            var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
            var data = [];
            $http.put(apiUrl + 'api/quizzes/' + quiz._id, quiz).success(function (database) {
                dfd.resolve(database);
            }).error(function (err) {
                dfd.reject(err);
            });;
            return dfd.promise;
        }

    })

    .service('CheckoutService', function ($http, $q, _, config, AuthService, $rootScope) {

        var apiUrl = config.apiUrl;

        this.saveOrder = function (order) {
            var dfd = $q.defer();
            var user = AuthService.getUser();
            $http.post(apiUrl + 'api/orders', order, user).then(function (res) {
                if (window.localStorage.token && window.localStorage.user) {
                    var userStore = JSON.parse(window.localStorage.user);
                    var push_usr = {
                        user_id: userStore._id,
                        user_name: userStore.username,
                        role: 'user',
                        device_token: window.localStorage.token
                    };
                    AuthService.saveUserPushNoti(push_usr)
                        .then(function (res) {
                            console.log('success');
                        });
                }
                dfd.resolve(res.data);
                window.localStorage.removeItem('ionTheme1_cart');

            }, function (err) {
                dfd.reject(err);
            });

            return dfd.promise;

        };

        this.getPostcode = function (callback) {
            var dfd = $q.defer();

            $http.get('postcode.json').success(function (postcodes) {
                //alert(JSON.stringify(postcodes));

                dfd.resolve(postcodes);
            });

            return dfd.promise;
        };

    })



    .factory('Socket', function ($rootScope, config) {

        var url = config.apiUrl;
        var socket = io.connect(url);
        return {
            connect: function () {
                io.connect(url);
            },
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            },
            removeAllListeners: function (eventName, callback) {
                socket.removeAllListeners(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            }
        };
    });
