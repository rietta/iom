var global_index = 10;

(function() {

  var latlng, zoom, mapOptions, map, vizjson, bounds, cartoDBLayer, currentLayer, $layerSelector;

  if (map_type === 'overview_map' || map_type === 'project_map') {
    latlng = new google.maps.LatLng(map_center[0], map_center[1]);
    zoom = map_zoom;
  } else {
    latlng = new google.maps.LatLng(0, 0);
    zoom = 1;
  }

  $layerSelector = $('#layerSelector');

  mapOptions = {
    zoom: zoom,
    center: latlng,
    scrollwheel: false,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    panControl: false,
    scaleControl: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  cartodbOptions = {
    user_name: 'simbiotica',
    type: 'cartodb',
    cartodb_logo: false,
    legends: true,
    sublayers: []
  };

  bounds = new google.maps.LatLngBounds();

  function onSelectLayer(e) {
    var $el = $(e.currentTarget);

    if (currentLayer.layers.length > 0) {
      var sublayer = currentLayer.getSubLayer(0);
      sublayer.remove();
    }

    if ($el.data('layer') === 'layer1') {
      currentLayer.createSubLayer({
        sql: 'SELECT wb_malnutrition.country_name, wb_malnutrition.code, wb_malnutrition.year,wb_malnutrition.data, ne_10m_admin_0_countries.the_geom, ne_10m_admin_0_countries.the_geom_webmercator FROM  wb_malnutrition join ne_10m_admin_0_countries on wb_malnutrition.code=ne_10m_admin_0_countries.adm0_a3',
        cartocss: $el.data('cartocss'),
        interactivity: 'data'
      });
    }
  }

  function onWindowLoad() {

    if ($('#map').length > 0) {
      map = new google.maps.Map(document.getElementById('map'), mapOptions);
    } else {
      map = new google.maps.Map(document.getElementById("small_map"), mapOptions);
    }

    google.maps.event.addListener(map, "zoom_changed", function() {
      if (map.getZoom() > 12) map.setZoom(12);
    });

    if (map_type == "administrative_map") {
      var range = max_count / 5;
    }
    var diameter = 0;

    // If region exist, reject a country object
    _.each(map_data, function(d) {
      if (d.type === 'region') {
        map_data = _.reject(map_data, function(d) {
          return d.type === 'country';
        });
        return false;
      }
    });

    // Cartodb
    cartoDBLayer = cartodb.createLayer(map, cartodbOptions);

    cartoDBLayer.on('done', function(layer) {
      currentLayer = layer;
      $layerSelector.fadeIn('fast');
    }).addTo(map);

    // Markers
    for (var i = 0; i < map_data.length; i++) {
      var image_source = '';

      if (document.URL.indexOf("force_site_id=3") >= 0 || document.URL.indexOf("hornofafrica") >= 0) {

        if (map_data[i].count < 5) {
          diameter = 20;
          image_source = "/images/themes/" + theme + '/marker_2.png';
        } else if ((map_data[i].count >= 5) && (map_data[i].count < 10)) {
          diameter = 26;
          image_source = "/images/themes/" + theme + '/marker_3.png';
        } else if ((map_data[i].count >= 10) && (map_data[i].count < 18)) {
          diameter = 34;
          image_source = "/images/themes/" + theme + '/marker_4.png';
        } else if ((map_data[i].count >= 18) && (map_data[i].count < 30)) {
          diameter = 42;
          image_source = "/images/themes/" + theme + '/marker_5.png';
        } else {
          diameter = 58;
          image_source = "/images/themes/" + theme + '/marker_6.png';
        }
      } else if (map_type == "overview_map") {
        if (map_data[i].count < 25) {
          diameter = 20;
          image_source = "/images/themes/" + theme + '/marker_2.png';
        } else if ((map_data[i].count >= 25) && (map_data[i].count < 50)) {
          diameter = 26;
          image_source = "/images/themes/" + theme + '/marker_3.png';
        } else if ((map_data[i].count >= 50) && (map_data[i].count < 90)) {
          diameter = 34;
          image_source = "/images/themes/" + theme + '/marker_4.png';
        } else if ((map_data[i].count >= 90) && (map_data[i].count < 130)) {
          diameter = 42;
          image_source = "/images/themes/" + theme + '/marker_5.png';
        } else {
          diameter = 58;
          image_source = "/images/themes/" + theme + '/marker_6.png';
        }
      } else if (map_type == "administrative_map") {
        if (map_data[i].count < range) {
          diameter = 20;
          image_source = "/images/themes/" + theme + '/marker_2.png';
        } else if ((map_data[i].count >= range) && (map_data[i].count < (range * 2))) {
          diameter = 26;
          image_source = "/images/themes/" + theme + '/marker_3.png';
        } else if ((map_data[i].count >= (range * 2)) && (map_data[i].count < (range * 3))) {
          diameter = 34;
          image_source = "/images/themes/" + theme + '/marker_4.png';
        } else if ((map_data[i].count >= (range * 3)) && (map_data[i].count < (range * 4))) {
          diameter = 42;
          image_source = "/images/themes/" + theme + '/marker_5.png';
        } else {
          diameter = 58;
          image_source = "/images/themes/" + theme + '/marker_6.png';
        }
      } else {
        diameter = 72;
        image_source = "/images/themes/" + theme + '/project_marker.png';
      }
      var marker_ = new IOMMarker(map_data[i], diameter, image_source, map);

      if (map_type != "overview_map") {
        bounds.extend(new google.maps.LatLng(map_data[i].lat, map_data[i].lon));
      }
    }

    if (map_type != "overview_map") {
      map.fitBounds(bounds);
    }

    if (map_type == "project_map") {
      map.panBy(130, 20);
    }

    // Layer selector
    $layerSelector.find('a').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      onSelectLayer(e);
    });

  }

  $(window).load(onWindowLoad);

}());
