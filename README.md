# morango

Simply copies synchronously an entire simple documents collection from a MongoDB instance to an ArangoDB instace. You are responsible for creating the ArangoDB collections and their indexes. This process only copies the documents and allows for a specific field to be used as the ```_key``` attribute.

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

## Options

```-k```, ```--key``` ```[attribute]```
* **Optional**.
* The mongo document attribute to be used as the ```_key``` attribute at the arango collection. The default ```_key``` attribute from arango is used  if none is given.

```-m```, ```--mongo_collection``` ```<collection>```
* **Required**.
* The name of the mongo collection that will be copied.

```-a```, ```--arango_collection``` ```<collection>```
* **Required**.
* The name of the arango collection that will be filled.

```-l```, ```--log_frequency``` ```<n>```
* **Optional**.
* Defaults to 1.
* The number of times a document must be read from mongo for the process to output a [Saved/Found/Read] documents update to the console.
