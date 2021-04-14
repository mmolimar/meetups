# CDC patterns in Apache Kafka

## Prerequisites

Install Zookeeper, Kafka, Kafka Connect, and [Kukulcan](https://github.com/mmolimar/kukulcan). Once installed, you'll have to install also the [Mongo connector](https://github.com/mongodb/mongo-kafka) and the [JDBC connector](https://github.com/confluentinc/kafka-connect-jdbc) in Kafka Connect.

## Scripts

In the ``scripts`` folder you'll find some Ammonite scripts to be executed in Kukulcan:

* ``SourceConnectorConfig.sc``: the configuration for the *Mongo source* connector.
* ``SinkConnectorConfig.sc``: the configuration for the *JDBC sink* connector.
* ``RecordGenerator.sc``: generate fake records and insert them into a Mongo database.

## How to execute it

```scala
// Topic creation
kukulcan.admin.topics.createTopic("meetup.purchase_order", 6, 3)

// Check that all topics exist
kukulcan.admin.topics.listTopics()
```

```scala
// Import the script with the source connector config
interp.load.module(Path("/path/to/scripts/SourceConnectorConfig.sc"))

// Import the script with the sink connector config
interp.load.module(Path("/path/to/scripts/SinkConnectorConfig.sc"))

// List all available connector plugins (must exist Mongo and JDBC connectors)
kukulcan.connect.connectorPlugins

// Create the source connector
kukulcan.connect.addConnector("source-mongodb-meetup", sourceConfig)

// Create the sink connector
kukulcan.connect.addConnector("sink-jdbc-meetup", sinkConfig)

// Validate the connector status
kukulcan.connect.connectorStatus("source-mongodb-meetup")
kukulcan.connect.connectorStatus("sink-jdbc-meetup")
```


```scala
// Import the script to start creating records in the Mongo database
interp.load.module(Path("/path/to/scripts/RecordGenerator.sc"))
```
