angular.module('your_app_name.auth.controllers', [])

.controller('AuthCtrl', function($scope) {

})

.controller('WelcomeCtrl', function($scope, $ionicModal, $ionicLoading, show_hidden_actions, $state) {

    $scope.show_hidden_actions = show_hidden_actions;

    $scope.toggleHiddenActions = function() {
        $scope.show_hidden_actions = !$scope.show_hidden_actions;
    };

    $scope.facebookSignIn = function() {
        console.log("doing facebbok sign in");
        $state.go('app.shop.home');
    };

    $scope.googleSignIn = function() {
        console.log("doing google sign in");
        $state.go('app.shop.home');
    };

    $scope.twitterSignIn = function() {
        console.log("doing twitter sign in");
        $state.go('app.shop.home');
    };

    $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.privacy_policy_modal = modal;
    });

    $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.terms_of_service_modal = modal;
    });

    $scope.showPrivacyPolicy = function() {
        $scope.privacy_policy_modal.show();
    };

    $scope.showTerms = function() {
        $scope.terms_of_service_modal.show();
    };
})

.controller('LogInCtrl', function($scope, $ionicLoading, $timeout, $state, AuthService) {
    $scope.user = {};

    $scope.loadding = function() {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังตรวจสอบข้อมูล</p>', duration: 1000 });
    };

    $scope.doLogIn = function() {
        $scope.loadding();
        AuthService.login($scope.user).then(function() {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>', duration: 2000 });
            $timeout(function() {
                $state.go('app.shop.home');
            }, 2000);
        }, function(err) {
            $ionicLoading.hide();
            alert(JSON.stringify(err))
        })
    };
})

.controller('SignUpCtrl', function($scope, $ionicLoading, $timeout, $state, AuthService) {
    $scope.user = {
        address: {}
    };
    $scope.loadding = function() {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังตรวจสอบข้อมูล</p>', duration: 1000 });
    };

    $scope.doSignUp = function() {
        $scope.loadding();
        AuthService.signup($scope.user).then(function(res) {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังเข้าสู่ระบบ</p>', duration: 2000 });
            $timeout(function() {
                $state.go('app.shop.home');
            }, 2000);
            console.log("doing sign up", $scope.user);
            $state.go('app.shop.home');
        }, function(err) {
            alert(JSON.stringify(err))
        })
    };

})

.controller('ForgotPasswordCtrl', function($scope, $state) {
    $scope.requestNewPassword = function() {
        console.log("requesting new password");
        $state.go('app.shop.home');
    };
})

.controller('EditProfileCtrl', function($scope, $ionicLoading, $state, AuthService) {
    $scope.user = AuthService.getUser();
    $scope.passwordDetails = {};
    $scope.updateProfile = function() {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังบันทึกข้อมูล</p>' });
        AuthService.updateProfile($scope.user).then(function(res) {
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
            alert(JSON.stringify(err));
        })
    };

    $scope.changePassword = function() {
        $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">กำลังบันทึกข้อมูล</p>' });
        AuthService.changePassword($scope.passwordDetails).then(function(res) {
            console.log(res);
            $scope.passwordDetails = {};
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner><p style="margin: 5px 0 0 0;">เปลี่ยนรหัสผ่านสำเร็จ</p>', duration: 1000 });
            $state.go('app.profile.posts');
        }, function(err) {
            $ionicLoading.hide();
            alert(JSON.stringify(err));
        })
    };
})

;
