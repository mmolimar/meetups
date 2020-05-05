
var map, featureList, earthquakesSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

var earthquakesLayer = L.geoJson(null);
var earthquakes = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/earthquake.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.place,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" +
      "<tr><th>Event time</th><td>" + feature.properties.time + "</td></tr>" +
      "<tr><th>Type</th><td>" + feature.properties.type + "</td></tr>" +
      "<tr><th>Magnitude</th><td>" + feature.properties.mag + " (" + feature.properties.magType + ")</td></tr>" +
      "<tr><th>Depth</th><td>" + feature.properties.depth + " (km)</td></tr>" +
      "<tr><th>Latitude</th><td>" + feature.properties.latitude + "</td></tr>" +
      "<tr><th>Longitude</th><td>" + feature.properties.longitude + "</td></tr>" +
      "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.place);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/earthquake.png"></td><td class="feature-name">' + layer.feature.properties.place + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      earthquakesSearch.push({
        name: layer.feature.properties.place,
        source: "Earthquakeses",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("api/earthquakes", function (data) {
  var lastEventTime = null;
  if (data != null && data.features != null) {
    earthquakes.addData(data);
    if (data.features[0] != null && data.features[0].properties != null) {
      lastEventTime = data.features[0].properties.time;
    }
    map.addLayer(earthquakesLayer);
  }
  setInterval(function(){
    var queryUrl = "api/earthquakes?"
    if (lastEventTime != null && lastEventTime != "") {
      queryUrl = queryUrl + "fields=time&filter=" + lastEventTime;
    }
    $.getJSON(queryUrl, function (updatedData) {
      if (updatedData != null &&
        updatedData.features != null &&
        updatedData.features[0] != null &&
        updatedData.features[0].properties != null) {
          lastEventTime = updatedData.features[0].properties.time;
        map.removeLayer(earthquakesLayer);
        earthquakes.addData(updatedData);
        map.addLayer(earthquakesLayer);
      }
    });
  }, 4000);
});

map = L.map("map", {
  zoom: 3,
  center: [23.850674, -28.181526],
  layers: [cartoLight,  markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

map.on("overlayadd", function(e) {
  if (e.layer === earthquakesLayer) {
    markerClusters.addLayer(earthquakes);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === earthquakesLayer) {
    markerClusters.removeLayer(earthquakes);
  }
});

map.on("click", function(e) {
  highlight.clearLayers();
});

function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery
};

var groupedOverlays = {
  "Earthquake events": {
    "<img src='assets/img/earthquake.png' width='24' height='28'>&nbsp;Earthquakes": earthquakesLayer
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

$("#searchbox").click(function () {
  $(this).select();
});

$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();

  var earthquakesBH = new Bloodhound({
    name: "Earthquakes",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.id);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: earthquakesSearch,
    limit: 10
  });

  earthquakesBH.initialize();

  $("#searchbox").typeahead({
    minLength: 4,
    highlight: true,
    hint: false
  }, {
    name: "Earthquakes",
    displayKey: "name",
    source: earthquakesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/earthquake.png' width='24' height='28'>&nbsp;Earthquakes</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Earthquakes") {
      if (!map.hasLayer(earthquakesLayer)) {
        map.addLayer(earthquakesLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
