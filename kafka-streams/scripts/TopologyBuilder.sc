import $ivy.{
  `com.goyeau::kafka-streams-circe:0.6.2`
}

import com.goyeau.kafka.streams.circe.CirceSerdes._
import io.circe.generic.auto._
import org.apache.kafka.streams.Topology
import org.apache.kafka.streams.kstream.GlobalKTable
import org.apache.kafka.streams.scala.ImplicitConversions._
import org.apache.kafka.streams.scala.Serdes._
import org.apache.kafka.streams.scala.kstream.{KStream, KTable, Materialized}
import org.apache.kafka.streams.scala.{ByteArrayKeyValueStore, StreamsBuilder}

case class Product(name: String, department: String, price: String, promotionCode: String)

case class Customer(username: String, firstName: String, lastName: String, email: String, creditCardNumber: String,
                    birthday: String, address: String, zipCode: String, country: String)

case class Purchase(productId: String, creditCardNumber: String)

case class CustomerPurchase(customer: Customer, purchase: Purchase)

case class Notification(product: Product, customer: Customer)


def buildTopology: Topology = {
  val builder = new StreamsBuilder
  
  val products: GlobalKTable[String, Product] = builder.globalTable[String, Product](
    "products",
    Materialized.as[String, Product, ByteArrayKeyValueStore]("products-global-table")
  )
  val customers: KTable[String, Customer] = builder.stream[String, Customer]("customers")
    .selectKey((_, v) => v.creditCardNumber)
    .toTable(Materialized.as[String, Customer, ByteArrayKeyValueStore]("customers-creditcard-table"))
  val purchases: KStream[String, Purchase] = builder.stream[String, Purchase]("purchases")
    .selectKey((_, v) => v.creditCardNumber)

  purchases
    .join(customers)(
      (purchase, customer) => CustomerPurchase(customer, purchase)
    )
    .join(products)(
      (productId, customerPurchase) => customerPurchase.purchase.productId,
      (customerPurchase, product) => Notification(product, customerPurchase.customer)
    )
    .mapValues { notification =>
      val maskedCreditCard = mask(notification.customer.creditCardNumber)
      notification.copy(customer = notification.customer.copy(creditCardNumber = maskedCreditCard))
    }
    .to("notifications")

  def mask(creditCard: String): String = {
    val regex = "(.*)(-)?([0-9]{3,5})".r
    creditCard match {
      case regex(first, _, last) => s"${"*" * first.length}$last"
      case _ => "*" * creditCard.length
    }
  }

  builder.build()
}
