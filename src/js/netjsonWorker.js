//Different renderings require different data formats
self.addEventListener("message", e => {
    let {JSONData, mapModeRender} = e.data;
    JSONData.flatNodes = {};
    JSONData.nodes.map(function(node){
        JSONData.flatNodes[node.id] = node;
    });
    if(mapModeRender){
        mapJSONData(JSONData);
    }
    else{
        graphJSONData(JSONData);
    }
    JSONData.flatNodes = undefined;
    postMessage(JSONData);
    close();
});

/**
 * @function
 * @name graphJSONData
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function graphJSONData(JSONData){
    addNodeLinks(JSONData);
    JSONData.nodes.map(function(node){
        node.name = node.name || node.id;
        node.value = node.value || node.name;
        if(node.category){
            node.category = String(node.category);
        }
        if(!JSONData.categories){
            JSONData.categories = [];
        }
        if(JSONData.categories.indexOf(node.category) === -1){
            JSONData.categories.push(node.category)
        }
    });
}

/**
 * @function
 * @name mapJSONData
 *
 * Generate the data needed for map rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function mapJSONData(JSONData){
    addNodeLinks(JSONData);
    let nodesLength = JSONData.nodes.length;
    JSONData.nodes = JSONData.flatNodes;
    JSONData.nodes.length = nodesLength;
}

/**
 * @function
 * @name addNodeLinks
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function addNodeLinks(JSONData){
    arrayDeduplication(JSONData.nodes, ["id"]);
    arrayDeduplication(JSONData.links, ["source", "target"]);
    let nodeLinks = {};
    JSONData.links.map(function(link){
        if(JSONData.flatNodes[link.source] && JSONData.flatNodes[link.target]){
            if(!nodeLinks[link.source]){
                nodeLinks[link.source] = 0;
            }
            if(!nodeLinks[link.target]){
                nodeLinks[link.target] = 0;
            }
            nodeLinks[link.source]++;
            nodeLinks[link.target]++;
        }
    });
    JSONData.nodes.map(function(node){
        node.linkCount = nodeLinks[node.id];
    });
}

/**
 * @function
 * @name arrayDeduplication
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {array}  arrData     
 * @param  {array}  eigenvalues     arrData performs deduplication based on these eigenvalues
 * 
 */
function arrayDeduplication(arrData, eigenvalues = []){
    let tempStack = [];
    for(let i = arrData.length - 1;i >= 0;i--){
        let value = "", flag = 0;
        for(let key of eigenvalues){
            if(!arrData[i][key]){
                flag = 1;
                break;
            }
            value += arrData[i][key];
        }
        if(flag || tempStack.indexOf(value) !== -1){
            arrData.splice(i, 1);
        }
        else{
            tempStack.push(value);
        }
    }
}
