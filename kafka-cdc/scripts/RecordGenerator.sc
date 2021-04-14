import $ivy.{
  `org.mongodb.scala::mongo-scala-driver:4.2.2`,
  `com.github.javafaker:javafaker:1.0.2`
}
import org.mongodb.scala._
import com.github.javafaker._
import java.util.concurrent._

val mongoHost = "localhost:27017"
val mongoDb = "meetup"
val mongoCollection = "purchase_order"

val faker = new Faker()
val uri = s"mongodb://$mongoHost/$mongoDb"
val client = MongoClient(uri)
val db = client.getDatabase(mongoDb)
val collection = db.getCollection(mongoCollection)

val executor = new ScheduledThreadPoolExecutor(1)
val task = new Runnable {
  def run() = {
    val quantity = faker.number.digit.toInt
    val price = faker.commerce.price.toDouble
    val doc = Document(
      "product_id" -> faker.internet.uuid,
      "order_id" -> faker.internet.uuid,
      "product_name" -> faker.commerce.productName,
      "product_type" -> faker.commerce.department,
      "product_price" -> price,
      "quantity" -> quantity,
      "total_amount" -> price * quantity,
      "currency" -> faker.country.currencyCode
    )
    collection.insertOne(doc).head
  }
}

executor.scheduleAtFixedRate(task, 1, 1, TimeUnit.SECONDS)
