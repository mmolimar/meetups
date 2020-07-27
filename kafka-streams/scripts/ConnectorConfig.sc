
val config = Map(
    "key.converter.schemas.enable" -> "false",
    "value.converter.schemas.enable" -> "false",
    "connector.class" -> "io.mdrogalis.voluble.VolubleSourceConnector",
    "key.converter" -> "org.apache.kafka.connect.storage.StringConverter",
    "value.converter" -> "org.apache.kafka.connect.json.JsonConverter",
    "global.throttle.ms" -> "1000",
    "global.history.records.max" -> "100000",

    "genkp.products.with" -> "#{Internet.uuid}",
    "genv.products.name.with" -> "#{Commerce.productName}",
    "genv.products.department.with" -> "#{Commerce.department}",
    "genv.products.price.with" -> "#{Commerce.price}",
    "genv.products.promotionCode.with" -> "#{Commerce.promotionCode}",

    "genkp.customers.with" -> "#{Internet.uuid}",
    "genv.customers.username.with" -> "#{Name.username}",
    "genv.customers.firstName.with" -> "#{Name.firstName}",
    "genv.customers.lastName.with" -> "#{Name.lastName}",
    "genv.customers.email.with" -> "#{Internet.emailAddress}",
    "genv.customers.creditCardNumber.with" -> "#{Finance.credit_card}",
    "genv.customers.birthday.with" -> "#{date.birthday}",
    "genv.customers.address.with" -> "#{Address.streetAddress}",
    "genv.customers.zipCode.with" -> "#{Address.zipCode}",
    "genv.customers.country.with" -> "#{Address.country}",

    "genkp.purchases.with" -> "#{Internet.uuid}",
    "genv.purchases.productId.matching" -> "products.key",
    "genv.purchases.creditCardNumber.matching" -> "customers.value.creditCardNumber"
  )
