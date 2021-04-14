
val sinkConfig = Map(
  "connector.class" -> "io.confluent.connect.jdbc.JdbcSinkConnector",
  "connection.url" -> "jdbc:postgresql://localhost:5432/demo",
  "connection.user" -> "postgres",
  "connection.password" -> "postgres",
  "topics" -> "meetup.purchase_order",
  "key.converter" -> "org.apache.kafka.connect.storage.StringConverter",
  "value.converter" -> "org.apache.kafka.connect.json.JsonConverter",
  "auto.create" -> "true",
  "pk.mode" -> "record_value",
  "pk.fields" -> "_id",
  "insert.mode" -> "upsert"
)
