import $ivy.{
  `com.typesafe.play::play:2.8.2`,
  `com.typesafe.play::play-netty-server:2.8.2`,
  `com.lihaoyi::requests:0.6.5`
}

import play.core.server._
import play.api.routing.sird._
import play.api.mvc._
import io.circe.syntax._
import io.circe.generic.auto._
import org.apache.kafka.streams.StoreQueryParameters
import org.apache.kafka.streams.state.QueryableStoreTypes
import org.apache.kafka.streams.state.ReadOnlyKeyValueStore
import com.github.mmolimar.kukulcan.KStreams
import scala.collection.JavaConverters._
import $file.scripts.TopologyBuilder, TopologyBuilder.{Product, Customer}

val port = 9000
lazy val server = (streams: KStreams) => {
  NettyServer.fromRouterWithComponents(new ServerConfig(
    rootDir = new java.io.File("."),
    port = Some(port),
    address = "127.0.0.1",
    sslPort = None,
    mode = play.api.Mode.Dev,
    properties = System.getProperties,
    configuration = play.api.Configuration(
      "play.server.netty" -> Map(
        "maxInitialLineLength" -> 4096,
        "maxHeaderSize" -> 8192,
        "maxChunkSize" -> 8192,
        "log.wire" -> false,
        "eventLoopThreads" -> 0,
        "transport" -> "jdk",
        "option.child" -> Map(),
        "server-header" -> "streams-meetup"
      ),
      "play.server.max-content-length" -> "10MB",
      "play.server.http.port" -> port,
      "play.server.http.idleTimeout" -> "75 seconds",
      "play.server.https.idleTimeout" -> "75 seconds",
      "play.server.https.wantClientAuth" -> false,
      "play.server.https.needClientAuth" -> false,
      "play.server.websocket.frame.maxLength" -> "64k",

    )
  )) {components =>
      import components.{ defaultActionBuilder => Action }
      {
        case GET(p"/state-stores") =>
          Action {
            Results.Ok(streams.allMetadata.asScala.flatMap(_.stateStoreNames.asScala).asJson.toString)
          }
        case GET(p"/state-stores/$st") =>
          Action {
            val queryOpt = st match {
              case "products-global-table" => Some(StoreQueryParameters.fromNameAndType(st, QueryableStoreTypes.keyValueStore[String, Product]))
              case "customers-creditcard-table" => Some(StoreQueryParameters.fromNameAndType(st, QueryableStoreTypes.keyValueStore[String, Customer]))
              case _ => None
            }
            queryOpt
              .map { query =>
                val store = streams.store(query)
                Results.Ok(
                  store.all.asScala.map(_.value).map {
                    case x: Product => x.asJson
                    case x: Customer => x.asJson
                  }
                  .toSeq.asJson.toString)
              }.getOrElse(Results.NotFound)
          }    
      }
  }
}
