angular.module('app.controllers', [])
    .controller('loginCtrl', function($scope, $state, $ionicPopup) {})

.controller('callbackCtrl', function($scope, $state) {

    $scope.$on('$ionicView.afterEnter', function() {

        OAuth.callback('google').done(function(result) {
            access_token = result["access_token"];
            token_type = result["token_type"];
            expires_in = result["expires_in"];
            id_token = result["id_token"];
            provider = result["provider"];

            oauthResult = result;

            //validation of response
            $.ajax({
                method: "GET",
                contentType: "application/json",
                url: "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + access_token,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                success: function(get_data) {
                    user_email = get_data["email"];
                    $state.go('menu.wildPokemon');
                    toastr.remove();
                    toastr.success("Your are now logged in with: " + user_email);
                    centerToast();
                },
                error: function(get_data) {
                    $state.go('menu.login');
                }
            })
        });
    });

})

.controller('capturedPokemonCtrl', function($scope, $http, $state, $ionicPopup, $timeout) {


    $scope.pokemon_data = [];
    var pokemon_array;
    var query_result;
    var base_url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/";

    var url = base_url + "pokemon/list";


    $scope.getCaptured = function(option) {
        $scope.pokemon_data = [];
        $timeout(function() {
            for (var i = 1 - 1; i >= 0; i--) {
                $.ajax({
                    method: "GET",
                    contentType: "application/json",
                    url: url + "?limit=" + 30,
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                    }
                }).done(function(data) {
                    query_result = data["items"];
                    for (var key in query_result) {
                        var id = query_result[key]["species_id"];
                        query_result[key]["species_id"] = correctIdString(id);
                    };
                    $scope.pokemon_data = $scope.pokemon_data.concat(data["items"]);
                });
            };
            if (option == 1) {
                $scope.$broadcast('scroll.refreshComplete');
            }
        }, 1000);
    };

    $scope.doRefresh = function(option) {
        $scope.getCaptured(option);
    };

    //populate initially
    $scope.$on('$ionicView.beforeEnter', function() {
        if (isLoggedIn() == false) {
            $state.go('menu.login');
        };

        $scope.pokemon_data = [];
        for (var i = 1 - 1; i >= 0; i--) {
            $.ajax({
                method: "GET",
                contentType: "application/json",
                url: url + "?limit=" + 30,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                },
                success: function(data) {
                    query_result = data["items"];
                    for (var key in query_result) {
                        var id = query_result[key]["species_id"];
                        query_result[key]["species_id"] = correctIdString(id);
                    };
                    $scope.pokemon_data = $scope.pokemon_data.concat(data["items"]);
                }
            })
        };

    });

})

.controller('editBtnCtrl', function($scope, EditPokemon, $state, $ionicPopup) {

    $scope.editPokemon = function(pokemon) {
        $scope.input = EditPokemon;
        for (var key in pokemon) {

            $scope.input[key] = pokemon[key];
            var id = $scope.input[key]["species_id"];
            $scope.input[key]["species_id"] = correctIdString(id);
        }

        //format the captured date
        var captured = new Date($scope.input["added_on"]);
        $scope.input["added_on"] = captured.getMonth() + "/" + captured.getDate() + "/" + captured.getFullYear();

        //get the name of the group
        if (pokemon["group"] != undefined && pokemon["group"] != null) {
            getSpecificDetail("group", pokemon["group"], function(result) {
                $scope.input["group"] = result["group_name"];
                $state.go('menu.edit');
            });
        } else {
            $scope.input["group"] = "Unassigned";
            $state.go('menu.edit');
        }


    };

    $scope.onHold = function(pokemon) {
        deleteEntity("pokemon", pokemon["pokemon_key"], function(result) {
            document.getElementById("card_" + pokemon["pokemon_key"]).remove();
            //$state.go($state.current, {}, {reload: true});
            toastr.remove();
            toastr.error("This pokemon was already deleted.");
            centerToast();
        });
    };
})


.controller('wildPokemonCtrl', function($scope, $http, $timeout, $state) {


    $scope.pokemon_data = [];
    var pokemon_array;

    $scope.$on('$ionicView.beforeEnter', function() {

        if (isLoggedIn() == false) {
            $state.go('menu.login');
            /*
                         OAuth.callback('google').done(function(result) {
                          access_token = result["access_token"];
                          token_type = result["token_type"];
                          expires_in = result["expires_in"];
                          id_token = result["id_token"];
                          provider = result["provider"];
                          
                          oauthResult = result;

                          console.log(result);
                          console.log(access_token);

                          //validation of response
                            $.ajax({
                                method: "GET",
                                contentType: "application/json",
                                url: "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + access_token,
                                beforeSend: function(xhr) {
                                    xhr.setRequestHeader("Authorization", "Bearer " +access_token);
                                },
                                success: function(get_data){
                                  user_email = get_data["email"];
                                  toastr.remove();
                                  toastr.success("Your are now logged in with: " + user_email);
                                  console.log(user_email);
                                }
                            });


                        });
            */
        };

        $timeout(
            $http.get('http://pokeapi.co/api/v1/pokedex/1/').then(function(resp) {
                pokemon_array = resp.data["pokemon"];
                setPokedexCache(pokemon_array);
                //$scope.pokemons = generatePokemonImgArray(pokemon_array, 12);
                parsePokedexObject(pokemon_array);
                $scope.pokemon_data = generatePokemonArray(12);
            }, function(err) {
                errorMessage = err;
            }),
            1000);
    });

    $scope.doRefresh = function() {
        $timeout(function() {
            $scope.pokemon_data = generatePokemonArray(12);
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');

        }, 1000);
    };
})

.controller('captureButtonCtrl', function($scope, $ionicPopup, $http, $state) {


    var base_url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/";
    var url;
    var send_param;
    $scope.captured = false;

    $scope.capturePokemon = function(pokemon) {

        if (isLoggedIn() == false) {
            var alertPopup = $ionicPopup.alert({
                title: "Authorization",
                template: "You are not logged in.",
                buttons: [{
                    text: 'Close'
                }, {
                    text: '<b>LogIn</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $state.go("menu.login");
                    }
                }]
            });
            return;
        };

        var name = pokemon.name;
        var plevel = pokemon.level;
        var id = pokemon.id;
        var chance = pokemon.capture_chance;
        var e_id = id + "/" + name + "/" + plevel;
        var message = "";


        if ($scope.captured) {
            toastr.remove();
            toastr.info("This pokemon was already captured.");
            centerToast();

        } else {
            if (getRandomInt(1, 10) <= chance) {
                //make call to API
                url = base_url + "pokemon/insert";

                $ionicPopup.prompt({
                    title: 'Pokeball Successful',
                    subTitle: 'What is the name of this pokemon?',
                    inputType: 'text',
                    inputPlaceholder: name,
                    okText: 'Capture',
                    cancelText: 'Release'
                }).then(function(g_name) {
                    if (g_name != undefined && g_name != null) {

                        if (g_name == "") {
                            g_name = name;
                        }

                        send_param = {
                            given_name: g_name,
                            species_name: name,
                            species_id: id,
                            level: plevel
                        };

                        $.ajax({
                            method: "POST",
                            dataType: 'json',
                            contentType: "application/json",
                            url: url,
                            data: JSON.stringify(send_param),
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                            }
                        }).done(function(data) {
                            console.log(data);
                        }).fail(function(err) {
                            console.log(err);
                        });


                        var img = document.getElementById(e_id);
                        img.setAttribute("src", "img/poke-ball.png");
                        img.setAttribute("height", "70px");

                        $scope.captured = !$scope.captured;
                        message = "Captured " + name + "!";
                        toastr.remove();
                        toastr.success(message);
                        centerToast();
                    }
                })

            } else {
                message = "Failed to capture " + name;
                toastr.remove();
                toastr.error(message);
                centerToast();

            }
        };
    };

})

.controller('editPokemonCtrl', function($scope, EditPokemon, $ionicHistory, $state, $timeout) {
    $scope.pokemon_edit_data = EditPokemon;

    $scope.myGoBack = function() {
        $ionicHistory.goBack();
        //$state.go('menu.capturedPokemon');
    };

    $scope.unassignGroup = function(pokemon_key_string) {
        unsetPokemonGroup(pokemon_key_string, function(result) {
            toastr.remove();
            toastr.success("Unassigned from group");
            centerToast();

            //remove the button and change assignment field text
            document.getElementById("group_" + pokemon_key_string).setAttribute("placeholder", "Unassigned");

            var elem = document.getElementById("remove_" + pokemon_key_string);
            elem.parentNode.removeChild(elem);

            $state.go($state.current, {}, {
                reload: true
            });
        });
    };

    $scope.deletePokemon = function(key_string) {
        deleteEntity("pokemon", key_string, function(result) {
            $state.go('menu.capturedPokemon');
        });
    };

})

.controller('groupsCtrl', function($scope, $ionicPopup, $state, EditGroupFactory, $ionicHistory, $timeout) {

    $scope.pokemon_groups_array = null;
    $scope.pokemon_in_groups = null;
    $scope.unassigned_pokemons = EditGroupFactory;
    var map_pokemon = {};

    $scope.$on('$ionicView.beforeEnter', function() {

        if (isLoggedIn() == false) {
            $state.go('menu.login');
        };

        //get the factor data and clear them
        $scope.unassigned_pokemons = EditGroupFactory;
        $scope.unassigned_pokemons["pokemons"] = []; //clear the content if there's anything there
        $scope.unassigned_pokemons["group_picked"] = ""; //clear it

        var key_string;
        //get all the groups
        getAllData("group", function(result) {
            //$scope.pokemon_groups_array = result["items"];

            var all_groups = result["items"];
            for(var key in all_groups) {
                var group = all_groups[key];
                var date = new Date(group["added_on"]);
                group["added_on"] = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
            }
            $scope.pokemon_groups_array = all_groups;
            /*
            var array_len = $scope.pokemon_groups_array.length;
            //get all the members of the groups
            for (var i = 0; i < array_len; i++) {
                key_string = $scope.pokemon_groups_array[i]["group_key"];

                getMembersOfGroup(key_string, function(new_result, my_string) {
                    var pokemons_in_this_group = new_result["items"];
                    map_pokemon[my_string] = pokemons_in_this_group;
                    $scope.pokemon_in_groups = map_pokemon;
                });
            };
            */
        });

    });

    $scope.$on('$ionicView.afterEnter', function() {


    });

    $scope.addToGroup = function(group_key_string) {
        //$scope.unassigned_pokemons = EditGroupFactory; //empty object {pokemon: [], group_picked: ""}

        //get all the pokemon first
        getAllData("pokemon", function(result) {
            var filtered = [];
            var ordered = [];
            var all_pokemons = result["items"];
            for (var key in all_pokemons) {
                var pokemon = all_pokemons[key];
                //show only those already in group or not in any group
                if (pokemon["group"] == group_key_string || pokemon["group"] == undefined || pokemon["group"] == null || pokemon["group"] == "") {
                    if(pokemon["group"] == group_key_string) {
                        filtered.unshift(pokemon);
                    } else {
                        filtered.push(pokemon);
                    } 
                    
                }
            }




            //$scope.unassigned_pokemons["pokemon"] = result["items"];
            $scope.unassigned_pokemons["pokemon"] = filtered;
            $scope.unassigned_pokemons["group_picked"] = group_key_string;
            $state.go('menu.groupedit');
        });
    };


    $scope.deleteGroup = function(key_string) {
        deleteEntity("group", key_string, function(result) {
            document.getElementById("card_" + key_string).remove();
        });
    };

    $scope.myGoBack = function() {
        $ionicHistory.goBack();
    };

    $scope.addNewGroup = function() {
        $ionicPopup.prompt({
            title: 'Add a new group',
            subTitle: 'Enter a name for the group',
            inputType: 'text',
            inputPlaceholder: ' group name'
        }).then(function(res) {
            if (res == "" || res == null || res == NaN || res == undefined) {
                toastr.remove();
                toastr.warning("No group name provided. Aborted.");
                centerToast();
            } else {

                var send_param = {
                    group_name: res,
                };
                $.ajax({
                    method: "POST",
                    dataType: 'json',
                    contentType: "application/json",
                    url: "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/group/insert",
                    data: JSON.stringify(send_param),
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + access_token);
                    },
                    success: function(data) {
                        $scope.pokemon_groups_array = data["items"];
                        toastr.remove();
                        toastr.success(res + " group has been added!");
                        centerToast();
                        getAllData("group", function(result) {
                            var all_groups = result["items"];
                            for(var key in all_groups) {
                                var group = all_groups[key];
                                var date = new Date(group["added_on"]);
                                group["added_on"] = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
                            }
                            $scope.pokemon_groups_array = all_groups;
                            $state.go($state.current, {}, {
                                reload: true
                            });
                        });
                    }
                }).done(function(data) {
                    $scope.pokemon_groups_array = data["items"];
                });
            }
        });
    };


})

.controller('groupEditCtrl', function($scope, EditGroupFactory, $ionicPopup, $ionicHistory) {

    $scope.unassigned_pokemons;
    $scope.group_picked;

    $scope.$on('$ionicView.beforeEnter', function() {

        //get the assigned data
        $scope.pokemon_data = EditGroupFactory; //{pokemon: [], group_picked: ""}

        $scope.unassigned_pokemons = $scope.pokemon_data["pokemon"];
        $scope.group_picked = $scope.pokemon_data["group_picked"];

    });


    $scope.myGoBack = function() {
        $ionicHistory.goBack();
    };

    $scope.pickPokemon = function(pokemon_key_string) {
        addPokemonToGroup(pokemon_key_string, $scope.group_picked, function(result) {
            toastr.remove();
            toastr.success("Pokemon added to this group");
            centerToast();
        });
    };

    $scope.unsetPokemon = function(pokemon_key_string) {
        unsetPokemonGroup(pokemon_key_string, function(result) {
            toastr.remove();
            toastr.warning("Pokemon removed from this group");
            centerToast();
        });
    };


    $scope.showDisabled = function() {
        toastr.remove();
        toastr.error("This pokemon is in another group");
        centerToast();
    };

})

.controller('groupEditButtonCtrl', function($scope, EditGroupFactory, $ionicPopup, $ionicHistory) {

    $scope.group_picked;
    $scope.isSet = false;

    $scope.$on('$ionicView.beforeEnter', function() {
        //get the assigned data
        $scope.pokemon_data = EditGroupFactory; //{pokemon: [], group_picked: ""}
        $scope.group_picked = $scope.pokemon_data["group_picked"];
    });

    $scope.showDisabled2 = function() {
        toastr.remove();
        toastr.error("This pokemon is in another group");
        centerToast();
    };

    $scope.pickPokemon2 = function(pokemon_key_string) {

        getSpecificDetail("pokemon", pokemon_key_string, function(result) {

            //check if successful
            if (result["pokemon_key"] == undefined) {
                //failed to retrieve
                toastr.remove();
                toastr.error("Could not retrieve data. Try again later.");
                centerToast();
            } else {

                if (result["group"] == undefined) {
                    //then this pokemon is not assigned to any group
                    $scope.isSet = false;
                } else {
                    $scope.isSet = true;
                }

                if ($scope.isSet == true) {
                    //unset it
                    unsetPokemonGroup(pokemon_key_string, function(result) {
                        toastr.remove();
                        toastr.warning("Pokemon removed from this group");
                        centerToast();
                        $scope.isSet = false;
                    });
                } else {
                    //set it
                    addPokemonToGroup(pokemon_key_string, $scope.group_picked, function(result) {
                        toastr.remove();
                        toastr.success("Pokemon added to this group");
                        centerToast();
                        $scope.isSet = true;
                    });
                }

            }
        });


    };

})


.controller('menuCtrl', function($scope, $state) {

    $scope.logoutAccountTest = function() {
        revokeToken(function(result) {
            oauthResult = null;
            access_token = null;
            token_type = null;
            expires_in = null;
            id_token = null;
            provider = null;
            user_email = null;

            $state.go('menu.login');
        });
    }

})

.controller('TestCtrl', function($scope, $ionicPopup, $state, $cordovaOauth) {

    $scope.start = function() {
        authorize_client($state);
    };


    $scope.googleLogin = function() {
        $cordovaOauth.google("465542279991-2ufoc5vbskbh3f1navlcbnusrenq9ij0.apps.googleusercontent.com", ["https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {

            toastr.success("success");
        }, function(error) {

            toastr.warning(error);
        });
    }
})
