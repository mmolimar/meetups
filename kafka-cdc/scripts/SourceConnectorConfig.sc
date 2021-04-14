
val sourceConfig = Map(
  "connection.uri" -> "mongodb://localhost:27017",
  "database" -> "meetup",
  "collection" -> "purchase_order",
  "publish.full.document.only" -> "true",
  "output.format.key" -> "schema",
  "output.format.value" -> "schema",
  "output.schema.infer.value" -> "true",
  "output.json.formatter" -> "com.mongodb.kafka.connect.source.json.formatter.SimplifiedJson",
  "copy.existing" -> "true",
  "connector.class" -> "com.mongodb.kafka.connect.MongoSourceConnector",
  "key.converter" -> "org.apache.kafka.connect.storage.StringConverter",
  "value.converter" -> "org.apache.kafka.connect.json.JsonConverter"
)
