import endpoints
import protorpc

from google.appengine.ext import ndb
from models import Pokemon, PokemonGroup

WEB_CLIENT_ID = ""
ANDROID_CLIENT_ID = ""
IOS_CLIENT_ID = ""
WEB_BROWSER_ID = ""


def get_parent_key(user):
    return ndb.Key("Entity", user.email().lower())


@endpoints.api(name="pokedexAPI", version="v1", description="Pokedex API",
               audiences=[WEB_CLIENT_ID, WEB_BROWSER_ID], 
               allowed_client_ids=[endpoints.API_EXPLORER_CLIENT_ID, WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID, WEB_BROWSER_ID])
class PokedexApi(protorpc.remote.Service):
    """ POKEDEX API for mobile """
    
    #============================================================================================
    # GROUP FUNCTIONS
    #============================================================================================
    
    #=============
    @PokemonGroup.query_method(user_required=True, 
                                 query_fields=("limit", "pageToken"),
                                 name="group.list", 
                                 path="group/list", 
                                 http_method="GET" )
    def group_list(self, query):
        """ GROUP-LIST-ALL: list all groups for user"""
        user = endpoints.get_current_user()
        user_groups = PokemonGroup.query(ancestor=get_parent_key(user)).order(PokemonGroup.group_name)
        return user_groups
    
    
    #=============
    @PokemonGroup.method(user_required=True,
                    request_fields=("entityKey",),
                   name="group.listone",
                   path="group/listone/{entityKey}",
                   http_method="GET")
    def group_list_one(self, request):
        """ GROUP-LIST-ONE: list a given entityKey's structure """ 
        return request
    
    #=============
    @Pokemon.query_method(user_required=True,
                    query_fields=("group",),
                   name="group.listmembers",
                   path="group/listmembers",
                   http_method="GET")
    def group_list_members(self, request):
        """ GROUP-LIST-MEMBERS: list all pokemons inside the group """ 
        return request
    
    
    #=============
    @PokemonGroup.method(user_required=True,
                           name="group.insert",
                           path="group/insert",
                           http_method="POST")
    def group_insert(self, group):
        """ GROUP-ADD: create a new group """
        if group.from_datastore:
            group_with_parent = group
            group_with_parent.put()
        else:
            user = endpoints.get_current_user()
            group_with_parent = PokemonGroup(parent=get_parent_key(user),
                                                group_name=group.group_name)
            this_key = group_with_parent.put()
            this_instance = this_key.get()
            this_instance.group_key = this_key.urlsafe()
            this_instance.put()
            group_with_parent = this_instance
            
        return group_with_parent
    
    #=============
    @PokemonGroup.method(user_required=True,
                         request_fields=("entityKey",),
                           name="group.delete",
                           path="group/delete/{entityKey}",
                           http_method="DELETE")
    def group_delete(self, request):
        """ GROUP-DELETE: deletes a specific group under the user's account """
        if not request.from_datastore:
            return PokemonGroup(group_name="ERROR: group key not found in datastore")
        
        #remove any pokemon association to this group
        all_pokemons = Pokemon.query(Pokemon.group==request.key).fetch()
        for pokemon in all_pokemons:
            pokemon.group = None
            pokemon.put()
                    
        request.key.delete()                                                   
        return PokemonGroup(group_name="Group has been deleted.")

    #============================================================================================
    # POKEMON FUNCTIONS
    #============================================================================================
    
    #=============
    @Pokemon.query_method(user_required=True, 
                                 query_fields=("limit", "pageToken"),
                                 name="pokemon.list", 
                                 path="pokemon/list", 
                                 http_method="GET" )
    def pokemon_list(self, query):
        """ POKEMON-LIST-ALL: lists all pokemon captured by user """
        user = endpoints.get_current_user()
        user_pokemons = Pokemon.query(ancestor=get_parent_key(user)).order(Pokemon.species_name)
        return user_pokemons


    #=============
    @Pokemon.method(user_required=True,
                    request_fields=("entityKey",),
                   name="pokemon.listone",
                   path="pokemon/listone/{entityKey}",
                   http_method="GET")
    def pokemon_list_one(self, request):
        """ POKEMON-LIST-ONE: list a given entityKey's structure """ 
        return request


    #=============
    @Pokemon.method(user_required=True,
                           name="pokemon.insert",
                           path="pokemon/insert",
                           http_method="POST")
    def pokemon_insert(self, pokemon):
        """ POKEMON-ADD: add a pokemon under the user's account """
        if pokemon.from_datastore:
            pokemon_with_parent = pokemon
            pokemon_with_parent.put()
        else:
            user = endpoints.get_current_user()
            pokemon_with_parent = Pokemon(parent=get_parent_key(user),
                                          given_name=pokemon.given_name,
                                          species_name=pokemon.species_name,
                                          species_id=pokemon.species_id,
                                          level=pokemon.level)

            this_key = pokemon_with_parent.put()
            this_instance = this_key.get()
            this_instance.pokemon_key = this_key.urlsafe()
            this_instance.put()
            pokemon_with_parent = this_instance

        return pokemon_with_parent


    #=============
    @Pokemon.method(user_required=True,
                    request_fields=("entityKey",),
                   name="pokemon.delete",
                   path="pokemon/delete/{entityKey}",
                   http_method="DELETE")
    def pokemon_delete(self, request):
        """ POKEMON-DELETE: delete's a pokemon from user. """
        if not request.from_datastore:
            return Pokemon(given_name="ID of pokemon was not found")
        request.key.delete()
        return Pokemon(given_name="deleted")


    #=============
    @Pokemon.method(user_required=True,
                    request_fields=("given_name", "group", "level"),
                   name="pokemon.update",
                   path="pokemon/update/{entityKey}",
                   http_method="PUT")
    def pokemon_update(self, request):
        """ POKEMON-UPDATE: update a pokemon's group assignment """
        the_pokemon = request
        if request.group is not None:
            print "groupKey: ", request.group
            print "Group Name: ", request.group.get().group_name
        the_pokemon.put()
        return the_pokemon

    #=============
    @Pokemon.method(user_required=True,
                    request_fields=("group",),
                   name="pokemon.remove-group",
                   path="pokemon/remove-group/{entityKey}",
                   http_method="DELETE")
    def pokemon_remove_group(self, request):
        """ POKEMON-REMOVE-GROUP: remove the group association """
        if not request.from_datastore:
            return Pokemon(given_name="ID of pokemon was not found")
        this_pokemon = request.key.get()
        this_pokemon.group = None
        this_pokemon.put()
        return this_pokemon

    
app = endpoints.api_server([PokedexApi], restricted=False)
