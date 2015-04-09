saveAsPng = function(){
    map.once('postcompose', function(event) {
      var canvas = event.context.canvas;
      button = document.getElementById('export-as-image');
      button.href = canvas.toDataURL('image/png');
    });
    map.renderSync();
};


//=======================================================

showAttributesTable = function() {

    panels = document.getElementsByClassName('table-panel');
    if (panels.length != 0){        
        this.panel.style.display = 'block';
        return                    
    }

    this.mapListeners = [];
    this.selectedRowIndices = [];

    this.renderPanel = function() {
        interactions = map.getInteractions();
        this.selectInteraction = null;
        for (i = 0; i < interactions.length; i++){
            if (typeof interactions[i] === "ol.interaction.Select"){
                this.selectInteraction = interactions[i];
                break;
            }
        }        
        this.formContainer = document.createElement("form");
        this.formContainer.className = "form-inline"
        this.panel.appendChild(this.formContainer)
        /*text = document.createTextNode("Layer: ");
        this.container.appendChild(text);*/
        this.createSelector(map);
        this.createButtons();
        var p = document.createElement('p');
        this.panel.appendChild(p);
        this.currentLayer = map.getLayers().getArray().slice().reverse()[0];
        this.tablePanel = document.createElement('div');
        this.tablePanel.className = 'table-panel';
        this.panel.appendChild(this.tablePanel);
        this.renderTable();
    };

    this.createButtons = function() {
        this_ = this;
        zoomTo = document.createElement("button");
        zoomTo.setAttribute("type", "button");
        zoomTo.innerHTML = "Zoom to selected";
        zoomTo.className = "btn btn-default"
        zoomTo.onclick = function(){
            features = this_.currentLayer.getSource().getFeatures();
            extent = ol.extent.createEmpty()
            for (i = 0; i < this_.selectedRowIndices.length; i++){
                extent = ol.extent.extend(extent,
                    features[this_.selectedRowIndices[i]].getGeometry().getExtent())
            }
            map.getView().fitExtent(extent, map.getSize());
        };
        this.formContainer.appendChild(zoomTo)
        clear =  document.createElement("button")
        clear.setAttribute("type", "button")
        clear.innerHTML = "Clear selected"
        clear.className = "btn btn-default"
        clear.onclick = function(){
            this_.selectedRowIndices = []
            var rows = this_.table.getElementsByTagName("tr");    
            for (var i = 0; i < rows.length; i++) {
                rows[i].className = "row-unselected";
            }
        };
        this.formContainer.appendChild(clear);
    }


    this.changeVisibility = function() {
        if (this.element.className != this.shownClassName) {
            this.element.className = this.shownClassName;
            this.renderPanel();
        }
        else{
            this.element.className = this.hiddenClassName;
        }
    };


    this.renderTable = function() {    
        try{
            this.tablePanel.removeChild(this.table);
        }
        catch(err){}
        this.table = document.createElement("TABLE");
        this.table.border = "1";

        cols = this.currentLayer.getSource().getFeatures()[0].getKeys();
        var row = this.table.insertRow(-1);
        
        for (var i = 0; i < cols.length; i++) {
            if (cols[i] != 'geometry') {
                var headerCell = document.createElement("TH");
                headerCell.innerHTML = cols[i];
                row.appendChild(headerCell);
            }
        }

        this_ = this
        this.currentLayer.getSource().forEachFeature(function(feature){
            keys = feature.getKeys();
            row = this_.table.insertRow(-1);  
            for (var j = 0; j < keys.length; j++) {
                if (keys[j] != 'geometry') {
                    var cell = row.insertCell(-1);
                    cell.innerHTML = feature.get(keys[j]);                
                }            
            }
        });

        var rows = this.table.getElementsByTagName("tr");    
        for (var i = 0; i < rows.length; i++) {
            (function (idx) {
                rows[idx].addEventListener("click", 
                    function () {
                        if (this.className != "row-selected"){
                            this.className = "row-selected"
                            this_.selectedRowIndices.push(idx)
                        }
                        else{
                            arrayIdx = this_.selectedRowIndices.indexOf(idx)
                            this_.selectedRowIndices.splice(arrayIdx, 1)
                            this.className = "row-unselected"   
                        }
                    }, false);
            })(i);
        }
        this.tablePanel.appendChild(this.table);
    };


    this.createSelector = function(map) {   
        label = document.createElement("label");        
        label.innerHTML = "Layer:";   
        this.formContainer.appendChild(label);
        this.sel = document.createElement('select');    
        this.sel.className = "form-control"
        this_ = this
        this.sel.onchange = function(){
            var lyr = null;
            var lyrs = map.getLayers().getArray().slice().reverse();
            for (i = 0; i < lyrs.length; i++){
                if (lyrs[i].get('title') == this.value){
                    this_.currentLayer = lyrs[i];
                    break
                }
            }        
            this_.renderTable()};
        var lyrs = map.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title') && !(typeof l.getSource === "undefined")) {
                var option = document.createElement('option');    
                option.value = option.textContent = l.get('title');
                this.sel.appendChild(option);
            }
        }
        this.formContainer.appendChild(this.sel);
    };

    this.panel = document.getElementsByClassName('attributes-table')[0];
    this.renderPanel()
    this.panel.style.display = 'block';

    var this_ = this;
    var closer = document.getElementById('attributes-table-closer');
    closer.onclick = function() {
        this_.panel.style.display = 'none';
        closer.blur();
        return false;
    };

};

//===================

searchAddress = function(){
    var inp = document.getElementById("geocoding-search");
    if (inp.value === ""){
        document.getElementById('geocoding-results').style.display = 'none';
        return;
    }
    $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + inp.value, function(data) {
        var items = [];

        $.each(data, function(key, val) {
            bb = val.boundingbox;
            items.push("<li><a href='#' onclick='goToAddress(" + bb[0] + ", " + bb[2] + ", " + bb[1] + ", " + bb[3]  
                        + ", \"" + val.osm_type + "\");return false;'>" + val.display_name + '</a></li>');
        });

        $('#geocoding-results').empty();
        if (items.length != 0) {
            $('<ul/>', {
                'class': 'my-new-list',
                html: items.join('')
            }).appendTo('#geocoding-results');
        } else {
            $('<p>', { html: "No results found" }).appendTo('#geocoding-results');
        }
        document.getElementById('geocoding-results').style.display = 'block';
    });
};

goToAddress = function(lat1, lng1, lat2, lng2, osm_type) {
    document.getElementById('geocoding-results').style.display = 'none';
    map.getView().setCenter(ol.proj.transform([lng1, lat1], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(10);
};

//===========================================
var measureInteraction;
var measureSource = new ol.source.Vector();
var measureVector = new ol.layer.Vector({
  source: measureSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});
var measureTooltips=[];

measureTool = function(measureType){

    if (measureInteraction){
        map.removeInteraction(measureInteraction);
    }

    if (measureType == null){
        map.on('pointermove', onPointerMove);
        map.removeLayer(measureVector)
        for (i=0; i<measureTooltips.length; i++){
            map.removeOverlay(measureTooltips[i]);
        }
        measureSource.clear();
        return;
    }

    var sketch;
    var measureTooltipElement;
    var measureTooltip;

    var pointerMoveHandler = function(evt) {
      if (evt.dragging) {
        return;
      }
      var tooltipCoord = evt.coordinate;
      if (sketch) {
        var output;
        var geom = (sketch.getGeometry());
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength( /** @type {ol.geom.LineString} */ (geom));
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      }
    };

    map.on('pointermove', pointerMoveHandler);
    map.removeLayer(measureVector)
    map.addLayer(measureVector)

    var addInteraction = function(){
      var type = (measureType == 'area' ? 'Polygon' : 'LineString');
      measureInteraction = new ol.interaction.Draw({
        source: measureSource,
        type: /** @type {ol.geom.GeometryType} */ (type),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            })
          })
        })
      });
      map.addInteraction(measureInteraction);
      createMeasureTooltip();

      measureInteraction.on('drawstart',
          function(evt) {
            // set sketch
            sketch = evt.feature;
          }, this);

      measureInteraction.on('drawend',
          function(evt) {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();
          }, this);
    }


    var createMeasureTooltip = function() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'tooltip tooltip-measure';
      measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      measureTooltips.push(measureTooltip);
      map.addOverlay(measureTooltip);
    }

    var formatLength = function(line) {
      var length = Math.round(line.getLength() * 100) / 100;
      var output;
      if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
      } else {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
      }
      return output;
    };

    var formatArea = function(polygon) {
      var area = polygon.getArea();
      var output;
      if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
      } else {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
      }
      return output;
    };

    addInteraction();
};