#!/usr/bin/env bash

APP_NAME="${0##*/}"
CONNECT_HOST=${CONNECT_HOST:-localhost}
CONNECT_PORT=${CONNECT_PORT:-8083}
HADOOP_HOST=${HADOOP_HOST:-localhost}
HADOOP_PORT=${HADOOP_PORT:-8020}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_SCHEMA=${DB_SCHEMA:-meetup}
DB_USER=${DB_USER:-mmolina}

function print_usage
{
  cat <<EOF
Usage: ${APP_NAME} connector-plugins|connector-topics|create-source|create-sink|delete-connectors|list-connectors|source-connector|sink-connector
commands:
  connector-plugins   List connector plugins
  connector-topics    List topics for each connector.
  create-source       Create the FS source connector.
  create-sink         Create the JDBC sink connector.
  delete-connectors   Remove the connectors.
  list-connectors     List all connectors.
  source-connector    Get info for the source connector.
  sink-connector      Get info for the sink connector.
EOF
}

function connector_plugins
{
  curl -sX GET http://$CONNECT_CONNECT_HOST:$CONNECT_PORT/connector-plugins | jq
}

function list_connectors
{
  curl -sX GET http://$CONNECT_HOST:$CONNECT_PORT/connectors | jq
}

function source_connector
{
  curl -sX GET http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-fs-source | jq
}

function sink_connector
{
  curl -sX GET http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-jdbc-sink | jq
}

function create_source_connector
{
  curl -sX POST http://$CONNECT_HOST:$CONNECT_PORT/connectors -H "Content-Type: application/json" --data '{
    "name": "kafka-connect-fs-source",
    "config": {
      "connector.class": "com.github.mmolimar.kafka.connect.fs.FsSourceConnector",
      "tasks.max": "1",
      "topic": "earthquakes",
      "fs.uris": "hdfs://'${HADOOP_HOST}':'${HADOOP_PORT}'/data",
      "policy.class": "com.github.mmolimar.kafka.connect.fs.policy.HdfsFileWatcherPolicy",
      "policy.recursive": "true",
      "policy.regexp": "^.*\\.csv$",
      "file_reader.class": "com.github.mmolimar.kafka.connect.fs.file.reader.CsvFileReader",
      "file_reader.delimited.settings.header": "true",
      "file_reader.delimited.settings.schema": "string,double,double,double,double,string,int,double,double,double,string,string,string,string,string,double,double,double,int,string,string,string",
      "file_reader.delimited.settings.allow_nulls": "true",
      "file_reader.delimited.settings.format.delimiter": ",",
      "errors.tolerance": "all",
      "errors.log.enable": "true",
      "errors.log.include.messages": "true"
    }
  }' | jq

}

function create_sink_connector
{
  curl -sX POST http://$CONNECT_HOST:$CONNECT_PORT/connectors -H "Content-Type: application/json" --data '{
    "name": "kafka-connect-jdbc-sink",
    "config": {
      "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
      "tasks.max": "1",
      "topics": "earthquakes",
      "connection.url": "jdbc:postgresql://'${DB_HOST}':'${DB_PORT}'/'${DB_SCHEMA}'?user='${DB_USER}'",
      "auto.create": "true",
      "pk.mode": "record_value",
      "pk.fields": "id",
      "insert.mode": "upsert",
      "transforms": "convert_time,convert_updated",
      "transforms.convert_time.type": "org.apache.kafka.connect.transforms.TimestampConverter$Value",
      "transforms.convert_time.field": "time",
      "transforms.convert_time.format": "yyyy-MM-dd'\''T'\''HH:mm:ss.SSS'\''Z'\''",
      "transforms.convert_time.target.type": "Timestamp",
      "transforms.convert_updated.type": "org.apache.kafka.connect.transforms.TimestampConverter$Value",
      "transforms.convert_updated.format": "yyyy-MM-dd'\''T'\''HH:mm:ss.SSS'\''Z'\''",
      "transforms.convert_updated.field": "updated",
      "transforms.convert_updated.target.type": "Timestamp",
      "errors.tolerance": "all",
      "errors.log.enable": "true",
      "errors.log.include.messages": "true",
      "errors.deadletterqueue.topic.name": "earthquakes-errors",
      "errors.deadletterqueue.topic.replication.factor": "1",
      "errors.deadletterqueue.context.headers.enable": "true"
    }
  }' | jq

}

function connector_topics
{
  curl -sX GET http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-fs-source/topics | jq
  curl -sX GET http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-jdbc-sink/topics | jq
}

function delete_connectors
{
  curl -sX DELETE http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-fs-source | jq
  curl -sX DELETE http://$CONNECT_HOST:$CONNECT_PORT/connectors/kafka-connect-jdbc-sink | jq
}

if [[ $# = 0 ]]; then
  print_usage
  exit
fi

case $1 in
  connector-plugins)
    connector_plugins
  ;;
  connector-topics)
    connector_topics
  ;;
  create-source)
    create_source_connector
  ;;
  create-sink)
    create_sink_connector
  ;;
  delete-connectors)
    delete_connectors
  ;;
  list-connectors)
    list_connectors
  ;;
  source-connector)
    source_connector
  ;;
  sink-connector)
    sink_connector
  ;;
  *)
    echo "Unknown sub-command \"$1\"."
    print_usage
    exit 1
  ;;
esac
