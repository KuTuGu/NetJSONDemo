(function () {
    /**
     * vanilla JS implementation of jQuery.extend()
     */
    echarts._extend = function(defaults, options) {
        var extended = {},
            prop;
        for(prop in defaults) {
            if(Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for(prop in options) {
            if(Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    /**
     *
     * @param  {number}      number     
     * @param  {number}      digit      min digit
     * @param  {string}      filler          
     */
    echarts._numberMinDigit = function(number, digit = 2, filler = "0") {
        return (Array(digit).join(filler) + number).slice(-digit);
    }
    
    /**
     * netjsongraph.js main function
     *
     * @constructor
     * @param  {string|object}      JSONParam       The NetJSON file or url
     * @param  {object}             opts            The object with parameters to override {@link d3.netJsonGraph.opts}
     */
    echarts.netGraphChart = function(JSONParam, opts) {
        /**
         * Default options
         *
         * @param  {string}            el                  body        The container element                                  el: "body" [description]
         * @param  {bool}              metadata            true        Display NetJSON metadata at startup?
         * @param  {bool}              defaultStyle        true        Does node use default css style? If not, you can income the style with JSON. 
         * @param  {bool}              switchSvgRenderMode true        Can switch Svg mode render?
         * @param  {string}            date                            Convert standard date to browser's time zone date.
         * @param  {object(RegExp)}    dateRegular         /(?:)/      Analyze date format.The exec result must be [date, year, month, day, hour, minute, second, millisecond?]
         * @param  {float}             gravity             0.1         The gravitational strength to the specified numerical value. @see {@link https://github.com/mbostock/d3/wiki/Force-Layout#gravity}
         * @param  {int|array}         edgeLength          [20, 60]    The distance between the two nodes on the side, this distance will also be affected by repulsion. @see {@link https://echarts.apache.org/option.html#series-graph.force.edgeLength}
         * @param  {int|array}         repulsion           200         The repulsion factor between nodes. @see {@link https://echarts.apache.org/option.html#series-graph.force.repulsion}
         * @param  {int}               circleRadius        8           The radius of circles (nodes) in pixel
         * @param  {int}               labelDx             0           node labels offsetX(distance on x axis) in graph. @see {@link https://echarts.apache.org/option.html#series-graph.label.offset}
         * @param  {int}               labelDy             -10         node labels offsetY(distance on y axis) in graph.
         * @param  {object}            nodeStyleProperty   {}          Used to custom node style. @see {@link https://echarts.apache.org/option.html#series-graph.data.itemStyle}
         * @param  {object}            linkStyleProperty   {}          Used to custom link style. @see {@link https://echarts.apache.org/option.html#series-graph.links.lineStyle}
         * @param  {function}          onInit                          Callback function executed on initialization
         * @param  {function}          onLoad                          Callback function executed after data has been loaded
         * @param  {function}          prepareData                     Used to convert NetJSON NetworkGraph to the javascript data
         * @param  {function}          onClickNode                     Called when a node is clicked
         * @param  {function}          onClickLink                     Called when a link is clicked
         */

        opts = echarts._extend({
            metadata: true,
            defaultStyle: true,
            // animationAtStart: true,
            switchSvgRenderMode: true,
            // scaleExtent: [0.25, 5],
            // charge: -130,
            // linkDistance: 50,
            // linkStrength: 0.2,
            // friction: 0.9,  // d3 default
            // chargeDistance: Infinity,  // d3 default
            // theta: 0.8,  // d3 default
            gravity: 0.1,
            edgeLength: [20, 60],
            repulsion: 120,
            circleRadius: 8,
            labelDx: 0,
            labelDy: -10,
            nodeStyleProperty: null,
            linkStyleProperty: null,
            /**
             * @function
             * @name onInit
             *
             * Callback function executed on initialization
             * @param  {string|object}  JSONParam     The netJson remote url or object
             * @param  {object}         opts          The object of passed arguments
             * @return {function}
             */
            onInit: function(JSONParam, opts) {},
            /**
             * @function
             * @name onLoad
             *
             * Callback function executed after data has been loaded
             * @param  {string|object}  JSONParam     The netJson remote url or object
             * @param  {object}         opts          The object of passed arguments
             * @return {function}
             */
            onLoad: function(JSONParam, opts) {},
            /**
             * @function
             * @name prepareData
             *
             * Convert NetJSON NetworkGraph to the data structure consumed by d3
             *
             * @param JSONData  {object}
             */
            prepareData: function(JSONData) {
                const nodeLinks = {};
                JSONData.links.map(function(link){
                    link.lineStyle = opts.linkStyleProperty;
                    if(!nodeLinks[link.source]){
                        nodeLinks[link.source] = 0;
                    }
                    if(!nodeLinks[link.target]){
                        nodeLinks[link.target] = 0;
                    }
                    nodeLinks[link.source]++;
                    nodeLinks[link.target]++;
                });
                JSONData.nodes.map(function(node){
                    if(opts.nodeStyleProperty){
                        node.itemStyle = opts.nodeStyleProperty;
                    }
                    else if(!opts.defaultStyle){
                        node.itemStyle = node.attributes.itemStyle;
                    }
                    node.name = node.id;
                    node.value = node.id;
                    if(node.attributes && node.attributes.modularity_class){
                        node.category = String(node.attributes.modularity_class);
                    }
                    node.linkCount = nodeLinks[node.id];
                    if(!JSONData.categories){
                        JSONData.categories = [];
                    }
                    else if(JSONData.categories.indexOf(node.category) === -1){
                        JSONData.categories.push(node.category)
                    }
                });
            },
            /**
             * @function
             * @name onClickNode
             *
             * Called when a node is clicked
             */
            onClickNode: function(node) {
                if(!nodeLinkOverlay){
                    nodeLinkOverlay = document.createElement("div");
                    nodeLinkOverlay.setAttribute("class", "njg-overlay");
                    netGraphContainer.appendChild(nodeLinkOverlay);
                }
                nodeLinkOverlay.style.display = "block";
                nodeLinkOverlay.innerHTML = `
                    <div class="njg-inner">
                        ${nodeInfo(node)}
                    </div>
                `;
                const closeA = document.createElement("a");
                closeA.setAttribute("class", "njg-close");
                closeA.onclick = () => {
                    nodeLinkOverlay.style.display = "none";
                }
                nodeLinkOverlay.appendChild(closeA); 
            },
            /**
             * @function
             * @name onClickLink
             *
             * Called when a node is clicked
             */
            onClickLink: function(link) {
                if(!nodeLinkOverlay){
                    nodeLinkOverlay = document.createElement("div");
                    nodeLinkOverlay.setAttribute("class", "njg-overlay");
                    netGraphContainer.appendChild(nodeLinkOverlay);
                }
                nodeLinkOverlay.style.display = "block";
                nodeLinkOverlay.innerHTML = `
                    <div class="njg-inner">
                        ${linkInfo(link)}
                    </div>
                `;
                const closeA = document.createElement("a");
                closeA.setAttribute("class", "njg-close");
                closeA.onclick = () => {
                    nodeLinkOverlay.style.display = "none";
                }
                nodeLinkOverlay.appendChild(closeA);
            }
        }, opts);

        // Init Callback
        opts.onInit(JSONParam, opts);

        const netGraphContainer = document.getElementById(opts.el) || document.getElementsByTagName("body")[0];    
        // optionCacheStack store option configuration, nodeLinkOverlay store informationCard DOM.     
        let optionCacheStack = null, nodeLinkOverlay;

        if(opts.switchSvgRenderMode){
            switchRenderMode(JSONParam);
        }
        if(opts.date !== ""){
            const dateNode = document.createElement("span"),
                  dateResult = dateParse(opts.date, opts.dateRegular);
            dateNode.setAttribute("title", dateResult);
            dateNode.setAttribute("class", "njg-date");
            dateNode.innerHTML = "Incoming Time: " + dateResult;
            netGraphContainer.appendChild(dateNode);
        }
        NetJSONRender(JSONParam);

        /**
         * @function
         * @name NetJSONDataParse
         *
         * Callback function executed when fetched data. Parse JSON data and construct the option.
         * @param  {object}  JSONData     NetJSONData
         * 
         * @return {object}  option -- render dependent configuration
         */

        function NetJSONDataParse(JSONData){
            // JSON Load Callback
            opts.onLoad(JSONParam, opts);

            opts.prepareData(JSONData);

            if(opts.metadata){
                NetJSONMetadata(JSONData);
            }

            optionCacheStack = {
                title: {
                    text: "NetGraph Demo",
                    link: "",
                    textStyle: {
                        color: "grey",
                        fontWeight: "bold",
                        fontSize: 30
                    },
                    left: "center",
                    top: "5%"
                },
                aria: {
                    show: true,
                    description: "This is a force-oriented graph chart that depicts the relationship between ip nodes."
                },
                toolbox:{
                    show:true,
                    feature:{
                        // dataView:{
                        //     show:true
                        // },
                        restore:{
                            show:true
                        },
                        saveAsImage:{
                            show:true
                        },
                    }
                },
                tooltip: {
                    confine: true,
                    formatter: (params, ticket, callback) => params.dataType === "edge" ? linkInfo(params.data) : nodeInfo(params.data)
                },
                legend: {
                    data: JSONData.categories
                },
                series:[{
                    type: "graph",
                    name: "NetGraph Demo",
                    layout: "force",
                    cursor:"pointer",           
                    label:{     
                        show: true,   
                        color: "#000000",
                        offset: [opts.labelDx, opts.labelDy],
                    },
                    force: {
                        initLayout: "circular",
                        repulsion: opts.repulsion,
                        gravity: opts.gravity,
                        edgeLength: opts.edgeLength,
                    },
                    symbolSize: opts.circleRadius,
                    roam: true,
                    draggable: true,
                    focusNodeAdjacency: true,
                    data: JSONData.nodes,
                    links: JSONData.links,
                    categories: JSONData.categories.map(category => ({name: category})),
                }]
            };

            return optionCacheStack;
        }

        /**
         * @function
         * @name JSONParamParse
         *
         * Perform different operations to call NetJSONDataParse function according to different Param types.
         * @param  {object|string}  JSONParam   Url or JSONData
         * 
         * @return {object}    A promise object 
         */

        function JSONParamParse(JSONParam){
            if(typeof JSONParam === "string"){
                return fetch(JSONParam, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                })
                .then(response => {
                    if(response.status === 200){
                        return response.json()
                    }
                })
                .then(data => NetJSONDataParse(data))
                .catch(msg => {
                    console.error(msg);
                })
            }
            else{
                return new Promise(NetJSONDataParse(JSONParam));
            }
        }

        /**
         * @function
         * @name NetJSONRender
         *
         * Perform different operations to call NetJSONDataParse function according to different Param types.
         * @param  {object|string}  JSONParam   url or JSONData
         */

        function NetJSONRender(JSONParam, renderMode = "canvas"){
            let graphChartContainer = document.getElementById("graphChartContainer");
            if(graphChartContainer){
                netGraphContainer.removeChild(graphChartContainer);
            }
            graphChartContainer = document.createElement("div");
            graphChartContainer.setAttribute("id", "graphChartContainer");
            netGraphContainer.appendChild(graphChartContainer);
            
            const graphChart = echarts.init(graphChartContainer, null, {renderer: renderMode});
            if(optionCacheStack !== null){
                presentRenderResult(graphChart, optionCacheStack);
            }
            else{
                graphChart.showLoading();
                JSONParamParse(JSONParam).then(options => {
                    graphChart.hideLoading();
                    presentRenderResult(graphChart, options);
                })
            }
        }

        /**
         * @function
         * @name presentRenderResult
         *
         * Render the final result based on options.
         * @param  {object}  chart        Echarts
         * @param  {object}  options      Render dependent configuration
         */
        function presentRenderResult(chart, options){
            chart.setOption(options);
            chart.on("mouseup", function(params){
                if (params.componentType === "series" && params.seriesType === "graph") {
                    if (params.dataType === "edge") {
                        opts.onClickLink(params.data); 
                    }
                    else {
                        opts.onClickNode(params.data); 
                    }
                }
            }, {passive: true});
            window.onresize = () => {
                chart.resize();
            }
        }

        /**
         * @function
         * @name NetJSONMetadata
         *
         * Display metadata of NetJSON.
         * @param  {object}  metadata     
         */

        function NetJSONMetadata(metadata){
            const attrs = ["protocol",
                "version",
                "revision",
                "metric",
                "router_id",
                "topology_id"];
            let html = "";
            
            if(metadata.label) {
                html += "<h3>" + metadata.label + "</h3>";
            }
            for(var i in attrs) {
                var attr = attrs[i];
                if(metadata[attr]) {
                    html += "<p><b>" + attr + "</b>: <span>" + metadata[attr] + "</span></p>";
                }
            }
            html += "<p><b>nodes</b>: <span>" + metadata.nodes.length + "</span></p>";
            html += "<p><b>links</b>: <span>" + metadata.links.length + "</span></p>";

            const metadataDiv = document.createElement("div"),
                innerDiv = document.createElement("div"),
                closeA = document.createElement("a");
            metadataDiv.setAttribute("class", "njg-metadata");
            metadataDiv.setAttribute("style", "display: block");
            innerDiv.setAttribute("class","njg-inner" );
            closeA.setAttribute("class", "njg-close");

            closeA.onclick = () => {
                metadataDiv.classList.add("njg-hidden");
            }
            innerDiv.innerHTML = html;
            metadataDiv.appendChild(innerDiv);
            metadataDiv.appendChild(closeA);
            
            netGraphContainer.appendChild(metadataDiv);
        } 

        /**
         * @function
         * @name switchRenderMode
         *
         * Switch rendering mode -- Canvas or Svg, re-render JSONData.
         * @param  {object|string}  JSONParam   
         */

        function switchRenderMode(JSONParam){
            const switchWrapper = document.createElement("div"),
                checkInput = document.createElement("input"),
                checkLabel = document.createElement("label"),
                canvasMode = document.createElement("b"),
                svgMode = document.createElement("b");
                
            switchWrapper.setAttribute("class", "switch-wrap");
            checkInput.setAttribute("id", "switch");
            checkInput.setAttribute("type", "checkbox");
            checkLabel.setAttribute("for", "switch");
            canvasMode.innerHTML = "Canvas";
            svgMode.innerHTML = "Svg";
            checkInput.onchange = e => {
                if(e.target.checked){
                    NetJSONRender(JSONParam, "svg");
                }
                else{
                    NetJSONRender(JSONParam, "canvas");
                }
            }
            switchWrapper.appendChild(canvasMode);
            switchWrapper.appendChild(checkInput);
            switchWrapper.appendChild(checkLabel);
            switchWrapper.appendChild(svgMode);
            netGraphContainer.appendChild(switchWrapper);
        }

        /**
         * @function
         * @name dateParse
         *
         * Parse the time in the browser's current time zone based on the incoming matching rules.
         * @param  {string}          dateString 
         * @param  {object(RegExp)}  parseRegular
         * 
         * @return {string}    Date string 
         */

        function dateParse(dateString, parseRegular = /^([1-9]\d{3})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?Z$/){
            const dateParseArr = parseRegular.exec(dateString);
            if(!dateParseArr || dateParseArr.length < 7){
                console.error("Date doesn't meet the specifications.");
                return "";
            }
            const hourDiffer = new Date().getTimezoneOffset() / 60,
                  dateNumerFields = ["dateYear", "dateMonth", "dateDay", "dateHour"],
                  dateNumberObject = {},
                  leapYear = (dateParseArr[1] % 4 === 0 && dateParseArr[1] % 100 !== 0) || dateParseArr[1] % 400 === 0,
                  limitBoundaries = new Map([
                    ["dateMonth", 12],
                    ["dateDay", [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]],
                    ["dateHour", 24],
                  ]);

            for(let i = dateNumerFields.length;i > 0;i--){
                dateNumberObject[dateNumerFields[i - 1]] = parseInt(dateParseArr[i], 10);
            }

            let carry = hourDiffer;
            for(let i = dateNumerFields.length;i > 0;i--){
                if(dateNumerFields[i - 1] === "dateYear"){
                    dateNumberObject[dateNumerFields[i - 1]] += carry;
                    break;
                }
                else if(dateNumerFields[i - 1] === "dateDay"){
                    limitBoundary = limitBoundaries.get("dateDay")[dateNumberObject[dateNumerFields[i - 1]] - 1];
                }
                else{
                    limitBoundary = limitBoundaries.get(dateNumerFields[i - 1]);
                }

                let calculateResult = dateNumberObject[dateNumerFields[i - 1]] + carry;

                if(dateNumerFields[i - 1] === "dateHour"){
                    carry = calculateResult < 0 ? -1 : (calculateResult > limitBoundary ? 1 : 0);
                }
                else{
                    carry = calculateResult <= 0 ? -1 : (calculateResult > limitBoundary ? 1 : 0);
                }

                if(carry === 1){
                    calculateResult -= limitBoundary;
                }
                else if(carry < 0){
                    if(dateNumerFields[i - 1] === "dateDay"){
                        limitBoundary = limitBoundaries.get("dateDay")[(dateNumberObject[dateNumerFields[i - 1]] + 10) % 11];
                    }
                    calculateResult += limitBoundary;
                }

                dateNumberObject[dateNumerFields[i - 1]] = calculateResult;
            }

            return dateNumberObject["dateYear"] + "." + echarts._numberMinDigit(dateNumberObject["dateMonth"]) + "." + echarts._numberMinDigit(dateNumberObject["dateDay"]) + " " + echarts._numberMinDigit(dateNumberObject["dateHour"]) + ":" + echarts._numberMinDigit(dateParseArr[5]) + ":"+ echarts._numberMinDigit(dateParseArr[6]) + "." + (dateParseArr[7] ? echarts._numberMinDigit(dateParseArr[7], 3) : "");
        }

        /**
         * @function
         * @name nodeInfo
         *
         * Parse the infomation of incoming node data.
         * @param  {object}    node 
         * 
         * @return {string}    html string 
         */

        function nodeInfo(node){
            let html = `<p><b>id</b>: ${node.id}</p>`;
            if(node.label) { html += "<p><b>label</b>: " + node.label + "</p>"; }
            if(node.properties) {
                for(let key in node.properties) {
                    if(!node.properties.hasOwnProperty(key)) { continue; }
                    html += "<p><b>"+key.replace(/_/g, " ")+"</b>: " + node.properties[key] + "</p>";
                }
            }
            if(node.linkCount) { html += "<p><b>links</b>: " + node.linkCount + "</p>";}
            if(node.local_addresses) {
                html += "<p><b>local addresses</b>:<br>" + node.local_addresses.join('<br>') + "</p>";
            }

            return html;
        }

        /**
         * @function
         * @name linkInfo
         *
         * Parse the infomation of incoming link data.
         * @param  {object}    link
         * 
         * @return {string}    html string 
         */

        function linkInfo(link){
            let html = `
                <p><b>source</b>: ${link.source}</p>
                <p><b>target</b>: ${link.target}</p>
                <p><b>cost</b>: ${link.cost}</p>
            `;
            if(link.properties) {
                for(var key in link.properties) {
                    if(!link.properties.hasOwnProperty(key)) { continue; }
                    html += "<p><b>"+ key.replace(/_/g, " ") +"</b>: " + link.properties[key] + "</p>";
                }
            }

            return html;
        }
    }
})()