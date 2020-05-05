# Connecting things with Kafka Connect

## Prerequisites

Install Zookeeper, Kafka and Kafka Connect. Once installed, you'll have to install **kafka-connect-fs**
and **kafka-connect-jdbc** connectors in Kafka Connect.

## Scripts

In the ``bin`` folder you'll find:

* ``connector-commands.sh``: commands to interact with Kafka Connect to create and query connectors.
* ``data-generator.sh``: fake data generator for records with random latitudes and longitudes.

## Data

``data`` folder contains CSV files with records downloaded from [USGS](https://earthquake.usgs.gov).
These files will be the ones which will be processed by the connectors.

## Earthquakes webapp

WebApp with a map to show earthquakes based on their coordinates from the records processed before by the connectors.

### Run it

``npm install``

``npm start``

*NOTE*: You'll need a PostgreSQL database installed. Set the proper username/password for the application in
``server.js`` file.
