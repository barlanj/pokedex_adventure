angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
        
    .state('menu.login', {
      url: '/login_register',
      views: {
        'side-menu21': {
          templateUrl: 'templates/login.html',
          controller: 'TestCtrl'//'loginCtrl'
        }
      }
    })
        
      
    
      
    .state('menu', {
      url: '/side-menu',
      abstract:true,
      templateUrl: 'templates/menu.html',
      controller: 'menuCtrl'
    })
      
    
      
        
    .state('logged-InPage', {
      url: '/logged_in',
      templateUrl: 'templates/logged-InPage.html',
      controller: 'logged-InPageCtrl'
    })
        
      
    .state('callback', {
      url: '/callback',
      templateUrl: 'templates/callback.html',
      controller: 'callbackCtrl'
    })
      
        
    .state('menu.capturedPokemon', {
      url: '/captured',
      views: {
        'side-menu21': {
          templateUrl: 'templates/capturedPokemon.html',
          controller: 'capturedPokemonCtrl'
        }
      }
    })
        
      
        
    .state('menu.wildPokemon', {
      url: '/wild',
      views: {
        'side-menu21': {
          templateUrl: 'templates/wildPokemon.html',
          controller: 'wildPokemonCtrl'
        }
      }
    })
        
        
    .state('menu.edit', {
      url: '/edit',
      //templateUrl: 'templates/edit.html',
      //controller: 'editPokemonCtrl'
      views: {
        'side-menu21': {
          templateUrl: 'templates/edit.html',
          controller: 'editPokemonCtrl'
        }
      }
      
    })
        
        
    .state('menu.groups', {
      url: '/groups',
      views: {
        'side-menu21': {
          templateUrl: 'templates/groups.html',
          controller: 'groupsCtrl'
        }
      }
    })
        
    .state('menu.groupedit', {
      url: '/groupedit',
      views: {
        'side-menu21': {
          templateUrl: 'templates/edit_group.html',
          controller: 'groupEditCtrl'
        }
      }
      
    })


    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/side-menu/login_register');

});