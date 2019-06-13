"use strict";

// import PopupImage from "../../lib/css/images/marker-icon.png";

const RenderCache = {
  netjsonmap: null,
  viewIndoormap: false,
  leafLeyLayers: null
};

/**
 * @function
 * @name graphSetOption
 *
 * set option in echarts and render.
 *
 * @param  {object}  customOption    custom option determined by different render.
 * @param  {object}  _this           NetJSONGraph object
 *
 * @return {object}  graph object
 *
 */
function graphSetOption(customOption, echartsLayer, _this) {
  const configs = _this.config,
    commonOption = Object.assign(
      {
        tooltip: {
          confine: true,
          formatter: params =>
            params.dataType === "edge"
              ? _this.utils.linkInfo(params.data)
              : _this.utils.nodeInfo(params.data)
        }
      },
      configs.echartsOption
    );

  echartsLayer.setOption(Object.assign(commonOption, customOption));
  echartsLayer.on(
    "mouseup",
    function(params) {
      if (params.componentType === "series" && params.seriesType === "graph") {
        if (params.dataType === "edge") {
          configs.onClickLink.call(_this, params.data);
        } else {
          configs.onClickNode.call(_this, params.data);
        }
      }
    },
    { passive: true }
  );
  window.onresize = () => {
    echartsLayer.resize();
  };

  return echartsLayer;
}

/**
 * @function
 * @name graphRender
 *
 * Render the final graph result based on JSONData.
 * @param  {object}  graphContainer  DOM
 * @param  {object}  JSONData        Render dependent configuration
 * @param  {object}  _this           NetJSONGraph object
 *
 * @return {object}  graph object
 */
function graphRender(graphContainer, JSONData, _this) {
  let categories = JSONData.categories || [],
    configs = _this.config,
    nodes = JSONData.nodes.map(function(node) {
      let nodeResult = JSON.parse(JSON.stringify(node));

      nodeResult.itemStyle =
        typeof configs.nodeStyleProperty === "function"
          ? configs.nodeStyleProperty(node)
          : configs.nodeStyleProperty;
      nodeResult.symbolSize =
        typeof configs.nodeSize === "function"
          ? configs.nodeSize(node)
          : configs.nodeSize;
      nodeResult.name = node.name || node.id;
      nodeResult.value = node.value || node.name;
      if (node.category) {
        nodeResult.category = String(node.category);
      }
      if (categories.indexOf(node.category) === -1) {
        categories.push(node.category);
      }

      return nodeResult;
    }),
    links = JSONData.links.map(function(link) {
      let linkResult = JSON.parse(JSON.stringify(link));

      linkResult.lineStyle =
        typeof configs.linkStyleProperty === "function"
          ? configs.linkStyleProperty(link)
          : configs.linkStyleProperty;

      return linkResult;
    }),
    series = [
      Object.assign(configs.graphConfig, {
        type: "graph",
        label: Object.assign(configs.graphConfig.label || {}, {
          offset: [configs.labelDx, configs.labelDy]
        }),
        force: Object.assign(configs.graphConfig.force || {}, {
          repulsion: configs.repulsion,
          gravity: configs.gravity,
          edgeLength: configs.edgeLength
        }),
        nodes,
        links,
        categories: categories.map(category => ({ name: category }))
      })
    ],
    graph = echarts.init(graphContainer, null, {
      renderer: configs.svgRender ? "svg" : "canvas"
    });

  console.log(echarts, links, nodes);

  return graphSetOption(
    {
      legend: {
        data: categories
      },
      series: series
    },
    graph,
    _this
  );
}

/**
 * @function
 * @name mapRender
 *
 * Render the final map result based on JSONData.
 * @param  {object}  mapContainer   DOM
 * @param  {object}  JSONData       Render dependent configuration
 * @param  {object}  _this          NetJSONGraph object
 *
 * @return {object}  map object
 */
function mapRender(mapContainer, JSONData, _this) {
  let configs = _this.config;

  if (!RenderCache.netjsonmap) {
    RenderCache.netjsonmap = L.map(mapContainer, {
      // renderer: _this.config.svgRender ? L.svg() : L.canvas()
      // }).setView([42.168, 260.536], 8);
    }).setView(configs.mapCenter, configs.mapZoom);
  } else {
    RenderCache.netjsonmap = L.map(mapContainer, {
      // renderer: _this.config.svgRender ? L.svg() : L.canvas()
    }).setView(
      RenderCache.netjsonmap.getCenter(),
      RenderCache.netjsonmap.getZoom()
    );
  }

  let map = RenderCache.netjsonmap,
    editableLayers = new L.FeatureGroup(),
    MyCustomMarker = L.Icon.extend({
      options: {
        shadowUrl: null,
        iconAnchor: new L.Point(12, 12),
        iconUrl: "../../lib/css/images/marker-icon.png"
      }
    }),
    options = {
      position: "topleft",
      draw: {
        polyline: {
          shapeOptions: {
            color: "#f357a1",
            weight: 3
          }
        },
        polygon: {
          allowIntersection: false, // Restricts shapes to simple polygons
          drawError: {
            color: "#e1e100", // Color the shape will turn when intersects
            message: "<strong>Oh snap!<strong> you can't draw that!" // Message that will show when intersect
          },
          shapeOptions: {
            color: "#bada55"
          }
        },
        circle: true, // Turns off this drawing tool
        rectangle: {
          shapeOptions: {
            clickable: false
          }
        },
        marker: {
          icon: new MyCustomMarker()
        }
      },
      edit: {
        featureGroup: editableLayers, //REQUIRED!!
        remove: true
      }
    };

  map.addLayer(editableLayers);
  map.addControl(new L.Control.Draw(options));
  map.on(L.Draw.Event.CREATED, function(e) {
    var type = e.layerType,
      layer = e.layer;

    if (type === "marker") {
      layer.bindPopup("A popup!");
    }

    editableLayers.addLayer(layer);
  });

  L.easyPrint({
    title: "Awesome print button",
    position: "bottomleft",
    exportOnly: true,
    sizeModes: ["Current", "A4Portrait", "A4Landscape"]
  }).addTo(map);

  let echartsLayer3 = new L.echartsLayer3(map, echarts);
  var chartsContainer = echartsLayer3.getEchartsContainer();
  var myChart = echartsLayer3.initECharts(chartsContainer);

  if (!RenderCache.viewIndoormap) {
    let { nodes, links } = JSONData,
      flatNodes = {};

    if (JSONData.flatNodes) {
      flatNodes = JSONData.flatNodes;
    } else {
      nodes.map(node => {
        flatNodes[node.id] = JSON.parse(JSON.stringify(node));
      });
    }

    RenderCache.leafLeyLayers = [];
    RenderCache.leafLeyLayers.push(
      L.tileLayer(
        "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: configs.scaleExtent[1]
        }
      ).addTo(map)
    );

    let series = [
      {
        type: "lines",
        zlevel: 1,
        effect: {
          show: true,
          period: 6,
          trailLength: 0.7,
          color: "#fff",
          symbolSize: 3
        },
        lineStyle: {
          normal: {
            // var color = ['#a6c84c', '#ffa022', '#46bee9'];
            color: "#a6c84c",
            width: 0,
            curveness: 0.2
          }
        },
        data: links.map(link => [
          {
            coord: [
              flatNodes[link.source].location.lng,
              flatNodes[link.source].location.lat
            ]
          },
          {
            coord: [
              flatNodes[link.target].location.lng,
              flatNodes[link.target].location.lat
            ]
          }
        ])
      },
      {
        type: "lines",
        zlevel: 2,
        effect: {
          show: true,
          period: 6,
          trailLength: 0,
          symbol: configs.animatorPath,
          symbolSize: 15
        },
        lineStyle: {
          normal: {
            color: "#a6c84c",
            width: 1,
            opacity: 0.4,
            curveness: 0.2
          }
        },
        data: links.map(link => [
          {
            coord: [
              flatNodes[link.source].location.lng,
              flatNodes[link.source].location.lat
            ]
          },
          {
            coord: [
              flatNodes[link.target].location.lng,
              flatNodes[link.target].location.lat
            ]
          }
        ])
      },
      {
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 2,
        rippleEffect: {
          brushType: "stroke"
        },
        label: {
          normal: {
            show: true,
            position: "right",
            formatter: "{b}"
          }
        },
        symbolSize: function(value) {
          return value[2] / 8;
        },
        itemStyle: {
          normal: {
            color: "#a6c84c"
          }
        },
        data: JSONData.nodes.map(node => {
          return {
            name: node.name,
            value: [node.location.lng, node.location.lat, 60]
          };
        })
      }
    ];

    graphSetOption(
      {
        geo: {
          map: "",
          roam: true,
          itemStyle: {
            normal: {
              areaColor: "#323c48",
              borderColor: "#404a59"
            },
            emphasis: {
              areaColor: "#2a333d"
            }
          }
        },
        series: series
      },
      echartsLayer3,
      _this
    );
  }
  viewInputImage(map, _this);

  return map;
}

/**
 * @function
 * @name viewInputImage
 *
 * Add Input to upload indoormap image.
 *
 * @param  {object}   netjsonmap
 * @param  {object}   _this           NetJSONGraph object
 *
 * @return {object}   input DOM
 */

function viewInputImage(netjsonmap, _this) {
  let imgInput = document.getElementById("njg-indoorImgInput");
  if (RenderCache.viewIndoormap) {
    presentIndoormap(imgInput.files[0]);
  } else if (!imgInput) {
    imgInput = document.createElement("input");
    imgInput.setAttribute("type", "file");
    imgInput.setAttribute("accept", "image/*");
    imgInput.setAttribute("id", "njg-indoorImgInput");
    _this.el.appendChild(imgInput);
  }
  imgInput.onchange = e => {
    presentIndoormap(e.target.files[0]);
  };

  return imgInput;

  function presentIndoormap(img) {
    let readImg = new FileReader(),
      tempImage = new Image();
    readImg.readAsDataURL(img);
    readImg.onload = e => {
      tempImage.src = e.target.result;
      tempImage.onload = () => {
        let southWest, northEast, bounds;
        if (
          tempImage.width / tempImage.height >
          window.innerWidth / window.innerHeight
        ) {
          (southWest = netjsonmap.layerPointToLatLng(
            L.point(
              0,
              window.innerHeight -
                (window.innerHeight -
                  (window.innerWidth * tempImage.height) / tempImage.width) /
                  2 +
                60
            )
          )),
            (northEast = netjsonmap.layerPointToLatLng(
              L.point(
                window.innerWidth,
                (window.innerHeight -
                  (window.innerWidth * tempImage.height) / tempImage.width) /
                  2 +
                  60
              )
            ));
          bounds = new L.LatLngBounds(southWest, northEast);
        } else {
          (southWest = netjsonmap.layerPointToLatLng(
            L.point(
              (window.innerWidth -
                (window.innerHeight * tempImage.width) / tempImage.height) /
                2,
              window.innerHeight + 60
            )
          )),
            (northEast = netjsonmap.layerPointToLatLng(
              L.point(
                window.innerWidth -
                  (window.innerWidth -
                    (window.innerHeight * tempImage.width) / tempImage.height) /
                    2,
                60
              )
            ));
          bounds = new L.LatLngBounds(southWest, northEast);
        }
        for (let layer of RenderCache.leafLeyLayers) {
          netjsonmap.removeLayer(layer);
        }
        RenderCache.leafLeyLayers.push(
          L.imageOverlay(tempImage.src, bounds).addTo(netjsonmap)
        );
        RenderCache.viewIndoormap = true;
      };
    };
  }
}

// window.graphRender = graphRender;
// window.mapRender = mapRender;
export { graphRender, mapRender };
