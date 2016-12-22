angular.module('your_app_name.app.services', [])

.service('AuthService', function($q, $http, config) {
    var apiUrl = config.apiUrl;

    this.getUser = function() {
        return (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
    };

    this.signout = function() {
        window.localStorage.removeItem('user');
        return true;
    };

    this.login = function(user) {

        var dfd = $q.defer();

        $http.post(apiUrl + 'api/auth/signin', user).success(function(res) {

            window.localStorage.user = JSON.stringify(res);
            dfd.resolve(res);

        }).error(function(err) {
            dfd.reject(err);
        });

        return dfd.promise;

    };

    this.signup = function(user) {

        var dfd = $q.defer();

        $http.post(apiUrl + 'api/auth/signup', user).success(function(res) {

            window.localStorage.user = JSON.stringify(res);
            dfd.resolve(res);

        }).error(function(err) {
            dfd.reject(err);
        });

        return dfd.promise;

    };

})

// .service('PostService', function($http, $q) {

//     this.getPostComments = function(post) {
//         var dfd = $q.defer();

//         $http.get('database.json').success(function(database) {
//             var comments_users = database.users;

//             // Randomize comments users array
//             comments_users = window.knuthShuffle(comments_users.slice(0, post.comments));

//             var comments_list = [];
//             // Append comment text to comments list
//             comments_list = _.map(comments_users, function(user) {
//                 var comment = {
//                     user: user,
//                     text: database.comments[Math.floor(Math.random() * database.comments.length)].comment
//                 };
//                 return comment;
//             });

//             dfd.resolve(comments_list);
//         });

//         return dfd.promise;
//     };

//     this.getUserDetails = function(userId) {
//         var dfd = $q.defer();

//         $http.get('database.json').success(function(database) {
//             //find the user
//             var user = _.find(database.users, function(user) { return user._id == userId; });
//             dfd.resolve(user);
//         });

//         return dfd.promise;
//     };

//     this.getUserPosts = function(userId) {
//         var dfd = $q.defer();

//         $http.get('database.json').success(function(database) {

//             //get user posts
//             var userPosts = _.filter(database.posts, function(post) { return post.userId == userId; });
//             //sort posts by published date
//             var sorted_posts = _.sortBy(userPosts, function(post) { return new Date(post.date); });

//             //find the user
//             var user = _.find(database.users, function(user) { return user._id == userId; });

//             //add user data to posts
//             var posts = _.each(sorted_posts.reverse(), function(post) {
//                 post.user = user;
//                 return post;
//             });

//             dfd.resolve(posts);
//         });

//         return dfd.promise;
//     };

//     this.getUserLikes = function(userId) {
//         var dfd = $q.defer();

//         $http.get('database.json').success(function(database) {
//             //get user likes
//             //we will get all the posts
//             var slicedLikes = database.posts.slice(0, 4);
//             // var sortedLikes =  _.sortBy(database.posts, function(post){ return new Date(post.date); });
//             var sortedLikes = _.sortBy(slicedLikes, function(post) { return new Date(post.date); });

//             //add user data to posts
//             var likes = _.each(sortedLikes.reverse(), function(post) {
//                 post.user = _.find(database.users, function(user) { return user._id == post.userId; });
//                 return post;
//             });

//             dfd.resolve(likes);

//         });

//         return dfd.promise;

//     };

//     this.getFeed = function(page) {

//         var pageSize = 5, // set your page size, which is number of records per page
//             skip = pageSize * (page - 1),
//             totalPosts = 1,
//             totalPages = 1,
//             dfd = $q.defer();

//         $http.get('database.json').success(function(database) {

//             totalPosts = database.posts.length;
//             totalPages = totalPosts / pageSize;

//             var sortedPosts = _.sortBy(database.posts, function(post) { return new Date(post.date); }),
//                 postsToShow = sortedPosts.slice(skip, skip + pageSize);

//             //add user data to posts
//             var posts = _.each(postsToShow.reverse(), function(post) {
//                 post.user = _.find(database.users, function(user) { return user._id == post.userId; });
//                 return post;
//             });

//             dfd.resolve({
//                 posts: posts,
//                 totalPages: totalPages
//             });
//         });

//         return dfd.promise;
//     };
// })

.service('ShopService', function($http, $q, _, config) {

    var apiUrl = config.apiUrl;
    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get(apiUrl + 'api/products').success(function(database) {
            dfd.resolve(database);
        });
        return dfd.promise;
    };

    this.getProduct = function(productId) {
        var dfd = $q.defer();
        $http.get(apiUrl + 'api/products/' + productId).success(function(database) {
            dfd.resolve(database);
        });
        return dfd.promise;
    };

    this.addProductToCart = function(productToAdd, update) {
        var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

        //check if this product is already saved
        var existing_product = _.find(cart_products, function(product) {
            return product.product._id === productToAdd.product._id;
        });

        if (cart_products.length === 0) {
            cart_products.push(productToAdd);
        } else {
            if (existing_product != undefined && existing_product.product._id === productToAdd.product._id) {
                if (update) {
                    existing_product.qty = productToAdd.qty
                } else {
                    existing_product.qty += productToAdd.qty;
                }
                existing_product.amount = 0;
                existing_product.amount += existing_product.qty * existing_product.product.price;
            } else {
                cart_products.push(productToAdd);
            }
        }

        window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
    };

    this.getCartProducts = function() {
        return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
    };

    this.getCountProduct = function() {
        var getCartProducts = this.getCartProducts();
        var count = 0;
        getCartProducts.forEach(function(product) {
            count += product.qty;
        });
        return count;
    };

    this.removeProductFromCart = function(productToRemove) {
        var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

        var new_cart_products = _.reject(cart_products, function(product) { return product.product._id == productToRemove.product._id; });

        window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
    };

    this.getCompleteOrder = function() {
        var dfd = $q.defer();
        var user = (window.localStorage.user) ? JSON.parse(window.localStorage.user) : null;
        var data = [];
        $http.get(apiUrl + 'api/orders').success(function(database) {
            database.forEach(function(item) {
                if (item.user && item.user._id === user._id) {
                    data.push(item);
                }
            });
            dfd.resolve(data);
        }).error(function(err) {
            dfd.reject(err);
        });;
        return dfd.promise;
    }

})

.service('CheckoutService', function($http, $q, _, config) {

    var apiUrl = config.apiUrl;

    this.saveOrder = function(order) {
        var dfd = $q.defer();
        var header = {
            'Access-Control-Request-Method': 'POST'
        }
        $http.post(apiUrl + 'api/orders', order, { header: header }).then(function(res) {

            dfd.resolve(res.data);
            window.localStorage.removeItem('ionTheme1_cart');

        }, function(err) {
            dfd.reject(err);
        });

        return dfd.promise;

    };

});