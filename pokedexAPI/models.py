from google.appengine.ext import ndb
from endpoints_proto_datastore.ndb.model import EndpointsModel
from endpoints_proto_datastore.ndb import EndpointsAliasProperty


class Pokemon(EndpointsModel):
    """ A Pokemon. """
    __message_fields_schema = ("entityKey", "given_name", "species_name", "species_id", "level", "group")
    given_name = ndb.StringProperty()
    species_name = ndb.StringProperty()
    species_id = ndb.IntegerProperty()
    level = ndb.IntegerProperty()
    group = ndb.KeyProperty()
    pokemon_key = ndb.StringProperty()
    added_on = ndb.DateTimeProperty(auto_now=True)
    update_on = ndb.DateTimeProperty()

class PokemonGroup(EndpointsModel):
    """ Grouping for captured pokemons. """
    __message_fields_schema = ("entityKey", "group_name")
    group_name = ndb.StringProperty()
    group_key = ndb.StringProperty()
    added_on = ndb.DateTimeProperty(auto_now=True)
    update_on = ndb.DateTimeProperty()
    

class Items(EndpointsModel):
    """ An Item """
    name = ndb.StringProperty()
    desc = ndb.StringProperty()
    
class PlayerBag(EndpointsModel):
    """ A player's bag containing found items """
    __message_fields_schema = ("entityKey", "group_name", "pokemon_count")
    item_count = ndb.IntegerProperty()
    items = ndb.KeyProperty(kind=Items)
    