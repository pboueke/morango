# morango

Simply copies synchronously entire collections from a MongoDB instance to a ArangoDB instace. You are responsible for creating the ArangoDB collections and their indexes. This process only copies the documents and allows for a specific field to be used as the ```_key``` attribute.

## Setup

Install the node dependencies and create a ```.env``` file containing yhe following environment variables:

```
MONGO_DATABASE=
MONGO_USER=
MONGO_PASSWORD=
MONGO_HOST=
MONGO_PORT=

ARANGO_DATABASE=
ARANGO_USER=
ARANGO_PASSWORD=
ARANGO_HOST=
ARANGO_PORT=

```