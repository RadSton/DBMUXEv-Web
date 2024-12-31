# Basic API Documentation for DBMUXEv

## Generic

### GET /api/config

Returns some important options of the `configuration.json` file

```json
{
    "ENABLE_WEBSERVER": true,
    "ENABLE_API": true,
    "DISABLE_CONVERSION_ENDPOINTS": false
}
```

## Architecture

### GET /api/v1/architectures

Returns the complete data of architectures.yml in JSON form:

```json
{
    "$architecture": {
        "$variant": {
            "comment": {
                "en": "Comment in English",
                "fr": "Comment in French"
            },
            "networks": {
                "$network1": {
                    "$bus1": {
                        "display_name": {
                            "en": "Display name in English",
                            "fr": "Display name in French"
                        },
                        "comment": {
                            "en": "Comment in English",
                            "fr": "Comment in French"
                        }
                    }
                }
            },
            "protocols": [
                "$protocol1"
                "$protocol2"
            ]
        }
    }
}
```

### GET /api/v1/architecture/:id
 
Gets an architecture by id

The parameter id is casesensitive and must follow: `${ARCHITECTURE}.§{VARIANT}` (f.e. : AEE2004.full)

Returns architecture in JSON:
```json
{
    "comment": {
        "en": "Comment in English",
        "fr": "Comment in French"
    },
    "networks": {
        "$network1": {
            "$bus1": {
                "display_name": {
                    "en": "Display name in English",
                    "fr": "Display name in French"
                },
                "comment": {
                    "en": "Comment in English",
                    "fr": "Comment in French"
                }
            }
        }
    },
    "protocols": [
        "$protocol1"
        "$protocol2"
    ]
}
```

#### Errors:

Errors are also sent in JSON format

```json
{
    "error": "$ERROR"
}
```

| Error                | Meaning                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| Invalid id-format    | The URL-Parameter id has an invalid format / doesnt contain a dot                     |
| Invalid architecture | The Architecture provided in the id URL-Parameter does not exist in architectures.yml |

### GET /api/v1/architectureList

Returns a json-list of all architectures:

```json
["AEE2001.full", "AEE2004.full", ....]
```

### POST /api/v1/architecture/search

This request needs an body to be sent with the request
The following header must be set or the body will be ignored:
`Content-Type: application/json`

Request-Body: 
```json
{
    "query": "$SEARCHSTRING"
}
```

For `§SEARCHSTRING` you need to set the string of the searchbar etc.

The response-body looks like the architectures body but architectures that do not meet the search criteria are removed.

Response-Body:
```json
{
    "comment": {
        "en": "Comment in English",
        "fr": "Comment in French"
    },
    "networks": {
        "$network1": {
            "$bus1": {
                "display_name": {
                    "en": "Display name in English",
                    "fr": "Display name in French"
                },
                "comment": {
                    "en": "Comment in English",
                    "fr": "Comment in French"
                }
            }
        }
    },
    "protocols": [
        "$protocol1"
        "$protocol2"
    ]
}
```

## Cars

### GET /api/v1/cars

This response returns all cars declared in cars/ folder of the dbmuxev in JSON format

```json
{
    "$CAR_ID": {
        "codes": {
            "$CAR_CODE1": "$CAR_NAME1",
            "$CAR_CODES2": ["$CAR_NAME2", "CAR_NAME3"],
        },
        "versions": {
            "$VERSION1": {
                "architecture": "$ARCHITECTURE"
            }
        }
    }
}
```

### GET /api/v1/car/:id


Gets an car by id

The parameter id is casesensitive (f.e. : `T3` will work but `t3` doesnt)

Returns car in JSON:
```json
{
    "codes": {
        "$CAR_CODE1": "$CAR_NAME1",
        "$CAR_CODES2": ["$CAR_NAME2", "CAR_NAME3"],
    },
    "versions": {
        "$VERSION1": {
            "architecture": "$ARCHITECTURE"
        }
    }
}
```

#### Errors:

Errors are also sent in JSON format

```json
{
    "error": "$ERROR"
}
```

| Error                   | Meaning                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| Could not find that car | The URL-Parameter id has an invalid format or is a car-id that doesnt exist |


### POST /api/v1/cars/search

This request needs an body to be sent with the request
The following header must be set or the body will be ignored:
`Content-Type: application/json`

Request-Body: 
```json
{
    "query": "$SEARCHSTRING"
}
```

For `§SEARCHSTRING` you need to set the string of the searchbar etc.

The response-body looks like the cars body but cars that do not meet the search criteria are removed.


Response-Body in JSON format:
```json
{
    "$CAR_ID": {
        "codes": {
            "$CAR_CODE1": "$CAR_NAME1",
            "$CAR_CODES2": ["$CAR_NAME2", "CAR_NAME3"],
        },
        "versions": {
            "$VERSION1": {
                "architecture": "$ARCHITECTURE"
            }
        }
    }
}
```

## Nodes

### GET /api/v1/nodes

This response returns all nodes declared in nodes/ folder of the dbmuxev in JSON format

```json
{
    "$ARCHITECTURE": {
        "$NODE": {
            "bus": ["$BUS1"],
            "id": {
                "$NETWORK1": 1
            },
            "alt": ["$ALT_NAME"],
            "name": {
                "en": "Name in English",
                "fr": "Name in French"
            },
             "comment": {
                "en": "Comment in English",
                "fr": "Comment in French"
            },
        }
    }
}
```

### GET /api/v1/nodes/:id


Gets an node by architecture (id)

The parameter id is casesensitive (f.e. : `AEE2004.full` will work but `aee2004.full` doesnt)

Returns car in JSON:
```json
{
    "$NODE": {
        "bus": ["$BUS1"],
        "id": {
            "$NETWORK1": 1
        },
        "alt": ["$ALT_NAME"],
        "name": {
            "en": "Name in English",
            "fr": "Name in French"
        },
         "comment": {
            "en": "Comment in English",
            "fr": "Comment in French"
        },
    }
}
```

#### Errors:

Errors are also sent in JSON format

```json
{
    "error": "$ERROR"
}
```

| Error                            | Meaning                       |
| -------------------------------- | ----------------------------- |
| Could not find any nodes for $ID | Invalid architecture supplied |


### POST /api/v1/node/:id/search

This request needs an body to be sent with the request
The following header must be set or the body will be ignored:
`Content-Type: application/json`

Paramter id defines the architecture to search in (casesensitive; f.e.: "AEE2004.full")

Request-Body: 
```json
{
    "query": "$SEARCHSTRING"
}
```

For `§SEARCHSTRING` you need to set the string of the searchbar etc.

The response-body looks like the get nodes-body but nodes that do not meet the search criteria are removed.


Response-Body in JSON format:
```json
{
    "$NODE": {
        "bus": ["$BUS1"],
        "id": {
            "$NETWORK1": 1
        },
        "alt": ["$ALT_NAME"],
        "name": {
            "en": "Name in English",
            "fr": "Name in French"
        },
         "comment": {
            "en": "Comment in English",
            "fr": "Comment in French"
        },
    }
}
```

### POST /api/v1/node/:id/findByAlt

This request needs an body to be sent with the request
The following header must be set or the body will be ignored:
`Content-Type: application/json`

Paramter id defines the architecture to search in (casesensitive; f.e.: "AEE2004.full")

Request-Body: 
```json
{
    "nodeName": "$nodeName"
}
```

For `$nodeName` you need to set the **alternate** string of the node.

The response-body looks like the get nodes-body but nodes that do not meet the search criteria are removed.


Response-Body in JSON format:
```json
{
    "$NODE": {
        "bus": ["$BUS1"],
        "id": {
            "$NETWORK1": 1
        },
        "alt": ["$ALT_NAME"],
        "name": {
            "en": "Name in English",
            "fr": "Name in French"
        },
         "comment": {
            "en": "Comment in English",
            "fr": "Comment in French"
        },
    }
}
```

#### Errors


| Error                                                    | Meaning                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| You need to declare nodeName in the body of the request! | No Content-Type header or no nodeName in json body of request                         |
| Invalid arch!                                            | The architecture supplied by the id parameter doesnt exist / doesnt have a nodes file |
| No node was found                                        | This alternate doesnt match any nodes                                                 |

## Buses

### GET /api/v1/buses

This response returns all buses declared in buses/ folder of the dbmuxev in JSON format

```json
{
    "$ARCHITECTURE": {
        "$NETWORK": {
            "$MESSAGE": {
                "id": 0,
                "name": "$NAME",
                "alt_names": [
                    "$ALTNAME"
                ],
                "length": 1,
                "comment": {
                    "en": "English Comment",
                    "fr": "French Comment"
                },
                "type": "can",
                "periodicity": "100",
                "senders": [
                    "$SENDER"
                ],
                "receivers": [ "$RECIEVER"],
                "signals": {
                    "$SIGNALS": "$SIGNALS"
                }
            }
        }
    }
}
```
### POST /api/v1/buses/search

This request needs an body to be sent with the request
The following header must be set or the body will be ignored:
`Content-Type: application/json`

Paramter id defines the architecture to search in (casesensitive; f.e.: "AEE2004.full")

Request-Body: 
```json
{
    "query": "$SEARCH",
    "arch": "$ARCHITECTURE",
    "identifyer": "$NETWORK.$BUS"
}
```

Response-Body in JSON format:
```json
{
    "$MESSAGE": {
        "id": 0,
        "name": "$NAME",
        "alt_names": [
            "$ALTNAME"
        ],
        "length": 1,
        "comment": {
            "en": "English Comment",
            "fr": "French Comment"
        },
        "type": "can",
        "periodicity": "100",
        "senders": [
            "$SENDER"
        ],
        "receivers": [ "$RECIEVER"],
        "signals": {
            "$SIGNALS": "$SIGNALS"
        }
    }
}
```

#### Errors


| Error                                                                     | Meaning                                                                              |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| You need to declare query in the json body of the request!                | No Content-Type header or no query in json body of request                           |
| You need to declare arch in the json body of the request!                 | No arch in json body of request                                                      |
| You need to declare identifyer in the json body of the request!           | No identifyer in json body of request                                                |
| There is no network/bus documentation for an architecture called "$ARCH"! | The architecture supplied by the json body doesnt exist / doesnt have a buses folder |
| There is no network/bus documentation for "$IDENTIFYER" in "$ARCH"!       | Could not find network / bus $IDENTIFYER in buses of architecture $ARCH              |

## Converters

### GET /api/v1/converters

This response returns all available converters for DBMUXEv

```json
["$CONVERTER"]
```

### GET /api/v1/convert/:CONVERTER/:ARCHITECTURE/:BUS/:LANGUAGE

This response executes a conveter with the specified paramerters

| Parameter    | Example      |
| ------------ | ------------ |
| CONVERTER    | "DBC"        |
| ARCHITECTURE | AEE2004.full |
| BUS          | LS.CONF      |
| LANGUAGE     | "en" or "fr" |

```json
{
    "extention": "$FILE_EXTENTION",
    "file": "$FILE_CONTENT"
}
```

The return-body parameter `$FILE_EXTENTION` is without a dot so "dbc" and `$FILE_CONTENT` is the whole file in text format. binary formats are currently not supported by this api endpoint!