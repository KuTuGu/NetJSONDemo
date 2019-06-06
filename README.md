# NetJSON Demo

[![Travis (.org) branch](https://img.shields.io/travis/kutugu/netjsondemo/master.svg)](https://travis-ci.org/KuTuGu/NetJSONDemo)
[![Coverage Status](https://coveralls.io/repos/github/KuTuGu/NetJSONDemo/badge.svg?branch=master)](https://coveralls.io/github/KuTuGu/NetJSONDemo?branch=master)
![Download](https://img.shields.io/npm/dt/npm-test-publish-netjsondemo.svg)
![NPM](https://img.shields.io/npm/v/npm-test-publish-netjsondemo.svg)
![Language](https://img.shields.io/badge/language-javascript-orange.svg)
       
[![NPM](https://nodei.co/npm/npm-test-publish-netjsondemo.png)](https://nodei.co/npm/npm-test-publish-netjsondemo/)
         
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
    - svgRender: use SVG render?
    - title: Custom graph title in echarts.
    - graphConfig: Custom graph config in echarts. Customize your colorful style.
    - scaleExtent: see d3 Zoom scaleExtent, defaults to [0.25, 5]
    - gravity: see d3 Zoom gravity, defaults to 0.1
    - edgeLength: the distance between the two nodes on the side, this distance will also be affected by repulsion
    - repulsion: the repulsion factor between nodes.
    - nodeSize: the size of nodes in pixel
    - labelDx: node labels offsetX(distance on x axis) in graph.
    - labelDy: node labels offsetY(distance on y axis) in graph.
    - onInit: callback function executed on initialization, params: url and options
    - onLoad: callback function executed after data has been loaded, params: url and options
    - nodeStyleProperty: Used to custom node style. 
    - linkStyleProperty: Used to custom link style.
    - prepareData: function used to convert NetJSON NetworkGraph to the javascript data structured used internally, you won't need to modify it in most cases
    - onClickNode: function called when a node is clicked, you can customize it if you need
    - onClickLink: function called when a link is clicked, you can customize it if you need

### Real Time Update

Since there isn't a real server for interaction, I only wrote one example for test. I built a simple local server using the express framework and nodeJS. After a period of time, the JSON change event is triggered, and the data view in the demo is also changed.

The code to build a local server can be found [here](https://github.com/KuTuGu/NetJSONDemo/tree/master/examples/data/netjsonnode/).

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
    <!-- theme can be easily customized via css -->
    <link href="../src/css/netjsongraph-theme.css" rel="stylesheet">
    <link href="../src/css/netjsongraph.css" rel="stylesheet">
</head>
<body>
    <script type="text/javascript" src="../dist/netjsongraph.min.js"></script>
    <script type="text/javascript">
        const graph = new NetJSONGraph("../src/data/netjson-multipleInterfaces.json", {
            render: graphRender,
        });
        graph.render();
    </script>
</body>
</html>
```

[introduce video](https://youtu.be/Kxhao0Dk7iw)

### Different Demos

[NetJSON graph base Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsongraph.html)
     
[NetJSON map base Demo](https://kutugu.github.io/NetJSONDemo/examples/netjsonmap.html)
      
[NetJSON sigmaJS version Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-sigma.html)
         
[NetJSON bigData Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-bigData.html)
         
[NetJSON sigma-bigData Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-sigma-bigData.html)

[NetJSON multiple interfaces Demo](https://kutugu.github.io/NetJSONDemo/examples/netjson-multipleInterfaces.html)       