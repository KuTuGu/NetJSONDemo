# NetJSON Demo

![img](/src/data/netjsongraph.png)
![img](/src/data/netjsonmap.png)
Demo roughly reproduces the basic functions of the code base -- [netjsongraph.js](https://github.com/netjson/netjsongraph.js) using [EchartsJS](https://github.com/apache/incubator-echarts) and [LeafletJS](https://github.com/Leaflet/Leaflet). In addition, with the built-in features of the Echarts library, some small features have been added.

- ***Add loading status***. When loading data, display loading status, avoiding browser white screen.We can also do something to prompt clearer, such as pop-up box prompt when data fetch fails.

- ***Hover or click trigger information***.Highlight the target element and the node or path associated with it when hover, showing informations about the target element.Display the data panel of the target element when clicked.

- ***Switch rendering mode***. Canvas and Svg have different advantages. So I added a button to switch between two rendering modes.

- ***Browser window zoom***. Listen for events, automatically re-render when the browser window is zoomed.

- ***Element classification***. Different elements can be categorized, and small controls are added for quick display and hiding category.

- ***ToolBox***. Used to restore views and save images, there are other features that can be added, such as data views, etc.

- ***Map View Mode***. I have tried to write a [map mode demo](https://github.com/KuTuGu/NetJSONDemo/tree/master/examples/leaflet.html), but compared with the perfect [mesh viewer](https://regensburg.freifunk.net/meshviewer/#/en/graph), there are still many areas for improvement. For example, add some useful small controls for users, display more information panels, etc.I will improve it later.

- ***Date Parse***. Convert standard date string param to browser’s time zone date.

For some reason，there are still some features that are not completed or perfect.

- ***Force map algorithm parameters***. Since Encharts encapsulates the force algorithm in the underlying and exposes fewer interfaces, many of the force parameters of d3 cannot be used in Echarts.Also for this reason, the animationAtStart and onEnd functions cannot be implemented.

- ***Canvas zoom and pan***. Also due to packaging reasons, it is impossible to customize. I will rewrite it with a lower level or native method later. And the default mouse drag and drop is only performed in the element area, in order to apply to the entire canvas area, we need to add custom drag and zoom events.

- ***JSONType of NetworkCollection***.The processing is basically similar, just a little more judgment, not writing for the time being.

- ***Data deduplication***.If the input JSON data is duplicated, such as a directed edge problem, the displayed information will be incorrect.The process of data processing is likely to take a lot of time, so we want to optimize performance as much as possible. Since the JSONData format has not been determined, I just provide [an interface file](). In netjsongraphJS, we can use the web worker to reference this file and process the data.

- ***Update data in real time***. There is no api for testing, so I didn't write the function, but it is very simple to write, just replace http with ws protocol and listen data.


### Local debugging

```
npm install
npm run start

npm run build
```

### Preview online

[NetJSONGraph Demo](https://kutugu.github.io/NetJSONDemo/index.html)
[NetJSONMap Demo](https://kutugu.github.io/NetJSONDemo/index.html)