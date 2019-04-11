# NetJSON Demo

![img](/src/data/netjsongraph.png)
![img](/src/data/netjsonmap.png)
![img](/src/data/netjsonindoormap.png)
Demo roughly reproduces the basic functions of the code base -- [netjsongraph.js](https://github.com/netjson/netjsongraph.js) using [EchartsJS](https://github.com/apache/incubator-echarts) and [LeafletJS](https://github.com/Leaflet/Leaflet). In addition, with the built-in features of the Echarts library, some small features have been added.

### Install

```
npm install
npm run start

npm run build
```

### Arguments

netjsongraph.js accepts two arguments.

- url (required, string): URL to fetch the JSON data from
- options (optional, object): custom options described below
    - el: container element, defaults to "body"
    - metadata: whether to show NetJSON NetworkGraph metadata or not, defaults to true
    - defaultStyle: whether to use the default style or not, defaults to true
    - svgRender: switch to Svg mode render?
    - listenUpdateUrl: listen the url to update JSONData.
    - scaleExtent: see d3 Zoom scaleExtent, defaults to [0.25, 5]
    - dateRegular: analyze date format.The exec result must be [date, year, month, day, hour, minute, second, millisecond?]
    - gravity: see d3 Zoom gravity, defaults to 0.1
    - edgeLength: the distance between the two nodes on the side, this distance will also be affected by repulsion
    - repulsion: the repulsion factor between nodes.
    - circleRadius: the radius of circles (nodes) in pixel
    - labelDx: node labels offsetX(distance on x axis) in graph.
    - labelDy: node labels offsetY(distance on y axis) in graph.
    - nodeClassProperty: if specified, nodes will have an additional CSS class that depends on the value of a specific NetJSON node property
    - linkClassProperty: if specified, links will have an additional CSS class that depends on the value of a specific NetJSON link property
    - onInit: callback function executed on initialization, params: url and options
    - onLoad: callback function executed after data has been loaded, params: url and options
    - onEnd: callback function executed when initial animation is complete, params: url and options
    - prepareData: function used to convert NetJSON NetworkGraph to the javascript data structured used internally, you won't need to modify it in most cases
    - onClickNode: function called when a node is clicked, you can customize it if you need
    - onClickLink: function called when a link is clicked, you can customize it if you need

### Real Time Update

Since there isn't a real server for interaction, I only wrote one example for test. I built a simple local server using the express framework and nodeJS. After a period of time, the JSON change event is triggered, and the data view in the demo is also changed.

The code to build a local server can be found [here](https://github.com/KuTuGu/NetJSONDemo/tree/master/src/data/netjsonnode/).

Execute in this directory：
```
npm install

node index.js
```

Then open the demo page, you will find that the nodes and links in the view change after 5 seconds.

This is just a demo, you can also customize other events to trigger data changes.

### Example Usage

```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>netjsongraph.js: basic example</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
    integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
    crossorigin=""/>
    <!-- theme can be easily customized via css -->
    <link href="../src/css/netjsongraph-theme.css" rel="stylesheet">
    <link href="../src/css/netjsongraph.css" rel="stylesheet">
    <link href="../lib/leaflet-draw.css" rel="stylesheet">
</head>
<body>
    <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
    integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg=="
    crossorigin=""></script>
    <script src="../lib/leaflet-mapDownload.js"></script>
    <script src="../lib/leaflet-draw.js"></script>
    <script type="text/javascript" src="../lib/echarts.min.js"></script>
    <script type="text/javascript" src="../lib/socket.io.js"></script>
    <script type="text/javascript" src="../src/js/netjsongraph.js"></script>
    <script type="text/javascript">
        echarts.netGraphChart("../src/data/netjson.json");
    </script>
</body>
</html>
```

[introduce video](https://youtu.be/Kxhao0Dk7iw)

### Different Demos

[NetJSON Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson.html)

### How to migrate the previous version

Because of the different libraries used, some of the parameters of the previous version may disappear, especially some of the parameters of the Force map algorithm.But you don't have to delete them, it doesn't have a negative impact.

These parameters have been removed for this demo：
- animationAtStart: true
- charge: -130,                                
- linkStrength: 0.2,
- friction: 0.9,  // d3 default
- chargeDistance: Infinity,  // d3 default
- theta: 0.8,  // d3 default

If you want to update the data in real time, you only need to listen to a port number on the server, passing in the url as the parameter -- listenUpdateUrl.
Of course you have to customize the trigger event -- "netjsonChange".
          
