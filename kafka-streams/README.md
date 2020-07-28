# Follow the (Kafka) Streams

## Prerequisites

Install Zookeeper, Kafka, Kafka Connect and [Kukulcan](https://github.com/mmolimar/kukulcan). Once installed, you'll have to install [voluble](https://github.com/MichaelDrogalis/voluble) connector in Kafka Connect.

## Scripts

In the ``scripts`` folder you'll find some Ammonite scripts to be executed in Kukulcan:

* ``ConnectorConfig.sc``: the configuration for the *voluble* connector.
* ``TopologyBuilder.sc``: an utility to create a Kafka Streams topology using *Circe* implicit serdes plus some case classes for the example.
* ``InteractiveQueries.sc``: HTTP server to expose state-stores and query them via *Interactive Queries* functionality in Kafka Streams.

## How to execute it

```scala
// Topic creation
kukulcan.admin.topics.createTopic("products", 6, 3)
kukulcan.admin.topics.createTopic("customers", 6, 3)
kukulcan.admin.topics.createTopic("purchases", 6, 3)
kukulcan.admin.topics.createTopic("notifications", 6, 3)

// Check that all topics exist
kukulcan.admin.topics.listTopics()
```


```scala
// Import the script with the connector config
interp.load.module(Path("/path/to/scripts/ConnectorConfig.sc"))

// List all available connector plugins (must exist voluble)
kukulcan.connect.connectorPlugins

// Create the connector
kukulcan.connect.addConnector("streams-meetup", config)

// Validate the connector status and topics in which the connector is producing
kukulcan.connect.connectorStatus("streams-meetup")
kukulcan.connect.connectorTopics("streams-meetup")
```


```scala
// Import the script with the topology builder and case classes needed
interp.load.module(Path("/path/to/scripts/TopologyBuilder.sc"))
val streams = kukulcan.streams(buildTopology)

// Print the DAG
print(streams.topology.describe)
streams.printTopology()

// Add the shutdown hook and start it!
sys.addShutdownHook(() => streams.close())
streams.start


// Take a look to the metrics
streams.listMetrics(".*producer.*", ".*record-send-total.*")
streams.listMetrics(".*consumer.*", ".*records-consumed-total.*")
```

```scala
// Load the module with the HTTP server to enable the interactive queries
interp.load.module(Path("/path/to/scripts/InteractiveQueries.sc"))
val httpServer = server(streams)
sys.addShutdownHook(() => httpServer.stop)
```
