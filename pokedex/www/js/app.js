// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

toastr.options = {
    "debug": false,
    "positionClass": "toast-mid-center",
    "onclick": null,
    "fadeIn": 300,
    "fadeOut": 1000,
    "timeOut": 2000,
    "extendedTimeOut": 1000
};

//Variables for holding info about authentications

var oauthResult = null;
var access_token = null;
var token_type = null;
var expires_in = null;
var id_token = null;
var provider = null;
var user_email = null;

// Variables for holding the GET result from pokeapi.co
var currentUser = null;
var currentUserId = null;
var currentPokedexCache = null;
var currentPokedexContent = {};


// app limitations
var count_all_captured = 0;

var pok_group_1_name = ""; //these are the names of the groups
var pok_group_2_name = "";
var pok_group_3_name = "";
var pok_group_4_name = "";
var pok_group_5_name = "";

var pok_group_1_count = 0;
var pok_group_2_count = 0;
var pok_group_3_count = 0;
var pok_group_4_count = 0;
var pok_group_5_count = 0;


function revokeToken(callback) {
  var url = "https://accounts.google.com/o/oauth2/revoke?token=" + access_token;

    $.ajax({
        method: "POST",
        url: url,
        complete: callback
    });

};


function getSpecificDetail(group_or_pokemon, key_string, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1";

    if (group_or_pokemon == "pokemon") {
        url = url + "/pokemon/listone/" + key_string
    } else if (group_or_pokemon == "group") {
        url = url + "/group/listone/" + key_string;
    }

    $.ajax({
        method: "GET",
        contentType: "application/json",
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: callback
    });
};

function unsetPokemonGroup(pokemon_key_string, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/pokemon/remove-group/" + pokemon_key_string;

    $.ajax({
        method: "POST",
        dataType: 'json',
        contentType: "application/json",
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: callback
    });
};

function deleteEntity(group_or_pokemon, key_string, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1";

    if (group_or_pokemon == "pokemon") {
        url = url + "/pokemon/delete/" + key_string;
    } else if (group_or_pokemon == "group") {
        url = url + "/group/delete/" + key_string;
    }

    $.ajax({
        method: "DELETE",
        dataType: 'json',
        contentType: "application/json",
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: callback
    });

}

function addPokemonToGroup(pokemon_key, group_key, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/pokemon/update/" + pokemon_key;
    $.ajax({
        method: "PUT",
        dataType: 'json',
        contentType: "application/json",
        url: url,
        data: JSON.stringify({
            "group": group_key
        }),
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: callback,
        error: function(response) {
            console.log("error");
            console.log(response);
        }
    });
};

function getAllData(group_or_pokemon, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1";

    if (group_or_pokemon == "pokemon") {
        url = url + "/pokemon/list";
    } else if (group_or_pokemon == "group") {
        url = url + "/group/list";
    }

    $.ajax({
        method: "GET",
        contentType: "application/json",
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: callback
    });
}

function getMembersOfGroup(group_key_string, callback) {
    var url = "https://pokedexapi-1148.appspot.com/_ah/api/pokedexAPI/v1/group/listmembers?group="+group_key_string;

    $.ajax({
        method: "GET",
        contentType: "application/json",
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + access_token);
        },
        success: function(response) {
            callback(response, group_key_string)
        }

    });
};


//helper function for Toast
function centerToast() {
    var window_height = $(document).height();
    var window_width = $(document).width();
    var this_toast = document.getElementsByClassName("toast-mid-center");
    var e_width = this_toast[0].offsetWidth / 2;
    this_toast[0].style.margin = "" + (window_height / 2) + "px " + (window_width / 2 - e_width) + "px";
};


//helper function for OAuth
function authorize_client($state) {

    /*
      OAuth.redirect('google', "http://10.0.2.2:4000/www/#/side-menu/wild");
    */
    OAuth.initialize('cQb79OklPct43dta8aNiTvl2chA');
    OAuth.popup('google').done(function(result) {
        access_token = result["access_token"];
        token_type = result["token_type"];
        expires_in = result["expires_in"];
        id_token = result["id_token"];
        provider = result["provider"];

        oauthResult = result;

        //validation of response
        oauthResult.get("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + access_token).done(function(get_data) {
            user_email = get_data["email"];
            $state.go('menu.wildPokemon');
            toastr.remove();
            toastr.success("Your are now logged in with: " + user_email);
        }).fail(function(err) {
            console.log("err: " + err);
        });
    });

};



function isLoggedIn() {

    if (oauthResult != null && access_token != null) {
        return true;
    } else {
        return false;
    };
};


function setPokedexCache(pokedex) {
    currentPokedexCache = pokedex;
    return;
};

function getPokedexCache() {
    return currentPokedexCache;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function parsePokedexObject(pokedexObject) {
    currentPokedexContent = {};

    pokedexObject.forEach(function(item) {
        var key = item.resource_uri.split("/")[3];
        currentPokedexContent[key] = item.name;
    });
};

function correctIdString(id) {


    if (parseInt(id) < 10) {
        return "00" + id;
    }

    if (parseInt(id) < 100) {
        return "0" + id;
    }

    return id;
};

function generatePokemonArray(count) {
    var result_obj = [];

    //pick a number between 1 and 718 
    var id = 0;
    var added = 0;

    while (added < count) {
        id = getRandomInt(1, 649);
        if (id in result_obj) {
            //do nothing
        } else {
            var new_pokemon = {};
            new_pokemon["name"] = currentPokedexContent[id.toString()];
            new_pokemon["id"] = correctIdString(id);
            new_pokemon["level"] = getRandomInt(1, 100);
            new_pokemon["capture_chance"] = getRandomInt(1, 10);
            result_obj.push(new_pokemon);
            added++;
        }
    };
    return result_obj;
};

function generatePokemonImgArray(currentPokedex, count) {

    var max_index = currentPokedex.length;
    var index = 0;
    var resource;
    var sourceID;

    var pokemonIDs = new Array();
    var id;

    for (var i = count - 1; i >= 0; i--) {
        do {
            index = getRandomInt(0, max_index - 1);
            resource = currentPokedex[index].resource_uri; // change the index here
            sourceID = parseInt(resource.split("/")[3]) - 1;
        } while (sourceID > 718 || sourceID < 2);

        pokemonIDs.push(sourceID);
    };
    return pokemonIDs;
}


angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        Parse.initialize("ZQRVtH03B0tnjrIdxwrgnuPdZ5iJDXdzCuYtX2P1", "V3G54UHmQv6zh9ECjKVyaooVaXZwosQThTdgU5qA");
    });
})

.factory('EditPokemon', function() {
    pokemon = {};
    return pokemon;
})

.factory('EditGroupFactory', function() {
    //pokemon = [];
    //group_picked = "";

    return {
        pokemon: [],
        group_picked: ""
    };
})
