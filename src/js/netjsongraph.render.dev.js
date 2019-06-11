"use strict";

const RenderCache = {
  netjsonmap: null,
  viewIndoormap: false,
  leafLeyLayers: null
};

/**
 * @function
 * @name generateOption
 *
 * generate option in echarts.
 *
 * @param  {object}  JSONData        Render dependent configuration
 * @param  {object}  config          NetJSONGraph config
 * @param  {array}   series          series in option
 *
 * @return {object}  echarts option
 */
function generateOption(JSONData, configs, series) {
  let categories = JSONData.categories || [];

  return {
    title: configs.title,
    coordinateSystem: "leaflet",
    aria: {
      show: true,
      description:
        "This is a force-oriented graph chart that depicts the relationship between ip nodes."
    },
    toolbox: {
      show: true,
      feature: {
        restore: {
          show: true
        },
        saveAsImage: {
          show: true
        }
      }
    },
    tooltip: {
      confine: true,
      formatter: (params, ticket, callback) =>
        params.dataType === "edge"
          ? _this.utils.linkInfo(params.data)
          : _this.utils.nodeInfo(params.data)
    },
    legend: {
      data: categories
    },
    series: series
  };
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

  graph.setOption(generateOption(JSONData, configs, series));
  graph.on(
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
    graph.resize();
  };

  return graph;
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
  JSONData = BJData;
  if (!RenderCache.netjsonmap) {
    RenderCache.netjsonmap = L.map(mapContainer, {
      // renderer: _this.config.svgRender ? L.svg() : L.canvas()
      // }).setView([42.168, 260.536], 8);
    }).setView([37.550339, 104.114129], 4);
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
    // const nodeElements = [],
    //   linkElements = [],
    //   drawElements = [];
    // let { nodes, links } = JSONData,
    //   flatNodes = {};
    // if (JSONData.flatNodes) {
    //   flatNodes = JSONData.flatNodes;
    // } else {
    //   nodes.map(node => {
    //     flatNodes[node.id] = JSON.parse(JSON.stringify(node));
    //   });
    // }

    let configs = _this.config;

    RenderCache.leafLeyLayers = [];
    RenderCache.leafLeyLayers.push(
      L.tileLayer(
        "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"
        // {
        //   attribution:
        //     'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        //   // maxZoom: configs.scaleExtent[1],
        //   key: "BC9A493B41014CAABB98F0471D759707",
        //   styleId: 22677
        // }
      ).addTo(map)
    );

    // for (let node_id in flatNodes) {
    //   if (flatNodes[node_id].location) {
    //     let { location, ...res } = flatNodes[node_id];
    //     nodeElements.push(
    //       L.circleMarker(
    //         [location.lng, location.lat],
    //         Object.assign(
    //           {
    //             radius:
    //               typeof configs.nodeSize === "function"
    //                 ? configs.nodeSize(flatNodes[node_id])
    //                 : configs.nodeSize
    //           },
    //           typeof configs.nodeStyleProperty === "function"
    //             ? configs.nodeStyleProperty(flatNodes[node_id])
    //             : configs.nodeStyleProperty,
    //           { params: JSON.parse(JSON.stringify(res)) }
    //         )
    //       ).bindTooltip(_this.utils.nodeInfo(res))
    //     );
    //   }
    // }
    // for (let link of links) {
    //   if (flatNodes[link.source] && flatNodes[link.target]) {
    //     linkElements.push(
    //       L.polyline(
    //         [
    //           [
    //             flatNodes[link.source].location.lng,
    //             flatNodes[link.source].location.lat
    //           ],
    //           [
    //             flatNodes[link.target].location.lng,
    //             flatNodes[link.target].location.lat
    //           ]
    //         ],
    //         Object.assign(
    //           typeof configs.linkStyleProperty === "function"
    //             ? configs.linkStyleProperty(link)
    //             : configs.linkStyleProperty,
    //           { params: JSON.parse(JSON.stringify(link)) }
    //         )
    //       ).bindTooltip(_this.utils.linkInfo(link))
    //     );
    //   }
    // }
    // drawElements.push(
    //   L.featureGroup(nodeElements).on("click", function(e) {
    //     map.setView([e.latlng.lat, e.latlng.lng], map.getMaxZoom());
    //     configs.onClickNode.call(_this, e.layer.options.params);
    //   })
    // );
    // drawElements.push(
    //   L.featureGroup(linkElements).on("click", function(e) {
    //     map.setView([e.latlng.lat, e.latlng.lng]);
    //     configs.onClickLink.call(_this, e.layer.options.params);
    //   })
    // );
    // L.featureGroup(drawElements).addTo(map);
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
          data: convertData(JSONData)
        },
        {
          type: "lines",
          zlevel: 2,
          effect: {
            show: true,
            period: 6,
            trailLength: 0,
            symbol: planePath,
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
          data: convertData(JSONData)
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
          symbolSize: function(val) {
            return val[2] / 8;
          },
          itemStyle: {
            normal: {
              color: "#a6c84c"
            }
          },
          data: JSONData.map(function(dataItem) {
            return {
              name: dataItem[1].name,
              value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
            };
          })
        }
      ],
      option = {
        title: {
          text: "Leaflet扩展Echarts3之模拟迁徙",
          subtext: "Develop By WanderGIS",
          left: "center",
          textStyle: {
            color: "#fff"
          }
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          orient: "vertical",
          top: "bottom",
          left: "right",
          data: ["北京 Top10", "上海 Top10", "广州 Top10"],
          textStyle: {
            color: "#fff"
          },
          selectedMode: "single"
        },
        geo: {
          map: "",
          label: {
            emphasis: {
              show: false
            }
          },
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
      };
    // echartsLayer3.setOption(generateOption(JSONData, configs, series));
    echartsLayer3.setOption(option);
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

var geoCoordMap = {
  上海: [121.4648, 31.2891],
  东莞: [113.8953, 22.901],
  东营: [118.7073, 37.5513],
  中山: [113.4229, 22.478],
  临汾: [111.4783, 36.1615],
  临沂: [118.3118, 35.2936],
  丹东: [124.541, 40.4242],
  丽水: [119.5642, 28.1854],
  乌鲁木齐: [87.9236, 43.5883],
  佛山: [112.8955, 23.1097],
  保定: [115.0488, 39.0948],
  兰州: [103.5901, 36.3043],
  包头: [110.3467, 41.4899],
  北京: [116.4551, 40.2539],
  北海: [109.314, 21.6211],
  南京: [118.8062, 31.9208],
  南宁: [108.479, 23.1152],
  南昌: [116.0046, 28.6633],
  南通: [121.1023, 32.1625],
  厦门: [118.1689, 24.6478],
  台州: [121.1353, 28.6688],
  合肥: [117.29, 32.0581],
  呼和浩特: [111.4124, 40.4901],
  咸阳: [108.4131, 34.8706],
  哈尔滨: [127.9688, 45.368],
  唐山: [118.4766, 39.6826],
  嘉兴: [120.9155, 30.6354],
  大同: [113.7854, 39.8035],
  大连: [122.2229, 39.4409],
  天津: [117.4219, 39.4189],
  太原: [112.3352, 37.9413],
  威海: [121.9482, 37.1393],
  宁波: [121.5967, 29.6466],
  宝鸡: [107.1826, 34.3433],
  宿迁: [118.5535, 33.7775],
  常州: [119.4543, 31.5582],
  广州: [113.5107, 23.2196],
  廊坊: [116.521, 39.0509],
  延安: [109.1052, 36.4252],
  张家口: [115.1477, 40.8527],
  徐州: [117.5208, 34.3268],
  德州: [116.6858, 37.2107],
  惠州: [114.6204, 23.1647],
  成都: [103.9526, 30.7617],
  扬州: [119.4653, 32.8162],
  承德: [117.5757, 41.4075],
  拉萨: [91.1865, 30.1465],
  无锡: [120.3442, 31.5527],
  日照: [119.2786, 35.5023],
  昆明: [102.9199, 25.4663],
  杭州: [119.5313, 29.8773],
  枣庄: [117.323, 34.8926],
  柳州: [109.3799, 24.9774],
  株洲: [113.5327, 27.0319],
  武汉: [114.3896, 30.6628],
  汕头: [117.1692, 23.3405],
  江门: [112.6318, 22.1484],
  沈阳: [123.1238, 42.1216],
  沧州: [116.8286, 38.2104],
  河源: [114.917, 23.9722],
  泉州: [118.3228, 25.1147],
  泰安: [117.0264, 36.0516],
  泰州: [120.0586, 32.5525],
  济南: [117.1582, 36.8701],
  济宁: [116.8286, 35.3375],
  海口: [110.3893, 19.8516],
  淄博: [118.0371, 36.6064],
  淮安: [118.927, 33.4039],
  深圳: [114.5435, 22.5439],
  清远: [112.9175, 24.3292],
  温州: [120.498, 27.8119],
  渭南: [109.7864, 35.0299],
  湖州: [119.8608, 30.7782],
  湘潭: [112.5439, 27.7075],
  滨州: [117.8174, 37.4963],
  潍坊: [119.0918, 36.524],
  烟台: [120.7397, 37.5128],
  玉溪: [101.9312, 23.8898],
  珠海: [113.7305, 22.1155],
  盐城: [120.2234, 33.5577],
  盘锦: [121.9482, 41.0449],
  石家庄: [114.4995, 38.1006],
  福州: [119.4543, 25.9222],
  秦皇岛: [119.2126, 40.0232],
  绍兴: [120.564, 29.7565],
  聊城: [115.9167, 36.4032],
  肇庆: [112.1265, 23.5822],
  舟山: [122.2559, 30.2234],
  苏州: [120.6519, 31.3989],
  莱芜: [117.6526, 36.2714],
  菏泽: [115.6201, 35.2057],
  营口: [122.4316, 40.4297],
  葫芦岛: [120.1575, 40.578],
  衡水: [115.8838, 37.7161],
  衢州: [118.6853, 28.8666],
  西宁: [101.4038, 36.8207],
  西安: [109.1162, 34.2004],
  贵阳: [106.6992, 26.7682],
  连云港: [119.1248, 34.552],
  邢台: [114.8071, 37.2821],
  邯郸: [114.4775, 36.535],
  郑州: [113.4668, 34.6234],
  鄂尔多斯: [108.9734, 39.2487],
  重庆: [107.7539, 30.1904],
  金华: [120.0037, 29.1028],
  铜川: [109.0393, 35.1947],
  银川: [106.3586, 38.1775],
  镇江: [119.4763, 31.9702],
  长春: [125.8154, 44.2584],
  长沙: [113.0823, 28.2568],
  长治: [112.8625, 36.4746],
  阳泉: [113.4778, 38.0951],
  青岛: [120.4651, 36.3373],
  韶关: [113.7964, 24.7028]
};
var BJData = [
  [{ name: "北京" }, { name: "上海", value: 95 }],
  [{ name: "北京" }, { name: "广州", value: 90 }],
  [{ name: "北京" }, { name: "大连", value: 80 }],
  [{ name: "北京" }, { name: "南宁", value: 70 }],
  [{ name: "北京" }, { name: "南昌", value: 60 }],
  [{ name: "北京" }, { name: "拉萨", value: 50 }],
  [{ name: "北京" }, { name: "长春", value: 40 }],
  [{ name: "北京" }, { name: "包头", value: 30 }],
  [{ name: "北京" }, { name: "重庆", value: 20 }],
  [{ name: "北京" }, { name: "常州", value: 10 }]
];
var SHData = [
  [{ name: "上海" }, { name: "包头", value: 95 }],
  [{ name: "上海" }, { name: "昆明", value: 90 }],
  [{ name: "上海" }, { name: "广州", value: 80 }],
  [{ name: "上海" }, { name: "郑州", value: 70 }],
  [{ name: "上海" }, { name: "长春", value: 60 }],
  [{ name: "上海" }, { name: "重庆", value: 50 }],
  [{ name: "上海" }, { name: "长沙", value: 40 }],
  [{ name: "上海" }, { name: "北京", value: 30 }],
  [{ name: "上海" }, { name: "丹东", value: 20 }],
  [{ name: "上海" }, { name: "大连", value: 10 }]
];
var GZData = [
  [{ name: "广州" }, { name: "福州", value: 95 }],
  [{ name: "广州" }, { name: "太原", value: 90 }],
  [{ name: "广州" }, { name: "长春", value: 80 }],
  [{ name: "广州" }, { name: "重庆", value: 70 }],
  [{ name: "广州" }, { name: "西安", value: 60 }],
  [{ name: "广州" }, { name: "成都", value: 50 }],
  [{ name: "广州" }, { name: "常州", value: 40 }],
  [{ name: "广州" }, { name: "北京", value: 30 }],
  [{ name: "广州" }, { name: "北海", value: 20 }],
  [{ name: "广州" }, { name: "海口", value: 10 }]
];
var planePath =
  "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";
var convertData = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    var fromCoord = geoCoordMap[dataItem[0].name];
    var toCoord = geoCoordMap[dataItem[1].name];
    if (fromCoord && toCoord) {
      res.push([
        {
          coord: fromCoord
        },
        {
          coord: toCoord
        }
      ]);
    }
  }
  return res;
};

// window.graphRender = graphRender;
// window.mapRender = mapRender;
export { graphRender, mapRender };
