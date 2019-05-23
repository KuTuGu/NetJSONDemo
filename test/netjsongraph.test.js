'use strict';

import "../src/js/netjsongraph.core.js";

describe("Modify netjsongraph configs", () => {
  const graph = new NetJSONGraph("", {});

  test("NetJSONGraph support dynamic modification of config parameters", () => {
    graph.setConfig({circleRadius: 1});
    expect(graph.config.circleRadius).toBe(1);
  });
})

describe("Test netjsongraph function utils", () => {
  const graph = new NetJSONGraph("", {});

  const nodeInfoData = new Map([
    [
      // key
      [
        // nodeInfo
        {
          id: 0,
          label: "test",
          properties: {
            name: "Node",
            color: "red",
            update_time: "2019.5.20 14:21:07"
          },
          linkCount: 1,
          local_addresses: ["192.168.0.01", "192.168.0.02", "192.168.0.03"],
        },
      ],
      // value
      "<p><b>id</b>: 0</p>\n<p><b>label</b>: test</p>\n<p><b>name</b>: Node</p>\n<p><b>color</b>: red</p>\n<p><b>update time</b>: 2019.5.20 14:21:07</p>\n<p><b>links</b>: 1</p>\n<p><b>local addresses</b>:<br/>192.168.0.01<br/>192.168.0.02<br/>192.168.0.03</p>\n"
    ],
  ]);
  const linkInfoData = new Map([
    [
      // key
      [
        // linkInfo
        {
          source: "192.168.0.01",
          target: "192.168.1.01",
          cost: "1.000",
          properties: {
            name: "Link",
            color: "blue",
            update_time: "2019.5.20 14:21:07"
          },
        },
      ],
      // value
      `<p><b>source</b>: 192.168.0.01</p>\n<p><b>target</b>: 192.168.1.01</p>\n<p><b>cost</b>: 1.000</p>\n<p><b>name</b>: Link</p>\n<p><b>color</b>: blue</p>\n<p><b>update time</b>: 2019.5.20 14:21:07</p>\n`
    ],
  ]);
  const numberMinDigitData = new Map([
    [
      // key
      [
        // origin number
        1,
        // min digit
        3,
        // filler
        0
      ],
      // value
      "001"
    ],
  ]);
  const dateParseData = new Map([
    [
      // key
      ["2019-04-03T05:06:54.000Z"],
      // value
      "2019.04.03 05:06:54.000"         // depand on time zone!
      //"2019.04.03 13:06:54.000"
    ],
  ]);
  
  const utilsObj = {
    "Parse the infomation of incoming node data.": ["nodeInfo", nodeInfoData],
    "Parse the infomation of incoming link data.": ["linkInfo", linkInfoData],
    "Guaranteed minimum number of digits": ["numberMinDigit", numberMinDigitData],
    "Parse the time in the browser's current time zone based on the incoming matching rules.": ["dateParse", dateParseData],
  }

  for(let operationText in utilsObj){
    test(operationText, () => {
      let [operationFunc, operationDataMap] = utilsObj[operationText];
      for(let [key, value] of operationDataMap){  
        expect(graph.utils[operationFunc](...key)).toEqual(value);
      }
    });
  }
})

window.fetch = jest.fn(url => url === "true" ? 
  Promise.resolve({
    "jsonUrl": true
  }) : 
  Promise.reject("wrong")
);

describe("Test netjsongraph JSONParamParse", () => {
  const graph = new NetJSONGraph("", {});

  test("Perform different operations to call NetJSONDataParse function according to different Param types.", () => {
    const {JSONParamParse} = graph.utils;

    JSONParamParse("true").then(data => {
      expect(data).toEqual({
        "jsonUrl": true
      });
    })
    JSONParamParse("false").catch(e => {
      expect(e).toMatch('error')
    })

    let json = {
      "test": true
    };

    JSONParamParse(json).then(data => {
      expect(data).toBe(json);
    })
  })
})


describe("Test netjsongraph utils dom functions", () => {
  const graph = new NetJSONGraph("", {});

  const NetJSONMetadataData = new Map([
    [
      // key
      [
        {
          "type":"NetworkGraph",
          "label":"Ninux Roma",
          "protocol":"OLSR",
          "version":"0.6.6.2",
          "metric":"ETX",
          "nodes": [],
          "links": [],
        }
      ],
      // value
      HTMLDivElement
    ],
  ]);
  const switchRenderModeData = new Map([
    [
      // key
      [],
      // value
      HTMLDivElement
    ],
  ]);
  // const addViewEyeData = new Map([
  //   [
  //     // key
  //     [],
  //     // value
  //     HTMLDivElement
  //   ],
  // ]);
  const addSearchFuncData = new Map([
    [
      // key
      [],
      // value
      HTMLDivElement
    ],
  ]);
  
  const utilsDOMObj = {
    // "Deal JSONData by WebWorker and render.": ["dealDataByWorker", nodeInfoData],
    // "Callback function executed when data update.Update Information and view.": ["JSONDataUpdate", linkInfoData],
    "Display metadata of NetJSONGraph.": ["NetJSONMetadata", NetJSONMetadataData],
    "Switch rendering mode -- Canvas or Svg.": ["switchRenderMode", switchRenderModeData],
    // "Add viewEye icon to change graph or map mode.": ["addViewEye", addViewEyeData],
    "Add search function for elements.": ["addSearchFunc", addSearchFuncData],
  }

  for(let operationText in utilsDOMObj){
    test(operationText, () => {
      let [operationFunc, operationDataMap] = utilsDOMObj[operationText];
      for(let [key, value] of operationDataMap){  
        expect(graph.utils[operationFunc](...key)).toBeInstanceOf(value);
      }
    });
  }
})

describe("Test netjsongraph render", () => {
  const graph = new NetJSONGraph("", {
    date: "2019-04-03T05:06:54.000Z",
    nodes: [],
    links: [],
  });

  test("netjsongraph.js render function", () => {
    expect(graph.render())
    expect(graph.utils.NetJSONRender())
  })

  test("Callback function executed when data update.Update Information and view.", () => {
    expect(graph.utils.JSONDataUpdate({
      nodes: [{id: "1"}],
      links: [{id: "2"}],
    }))
  })
})

describe("Test netjsongraph dom operate", () => {
  const graph = new NetJSONGraph("", {});

  test("click a node", () => {
    expect(graph.config.onClickNode.call(graph, {
      id: "1"
    }))
  })
  test("click a link", () => {
    expect(graph.config.onClickLink.call(graph, {
      id: "2"
    }))
  })
})


