//Different renderings require different data formats
self.addEventListener("message", e => {
    dealJSONData(e.data);
    postMessage(e.data);
    close();
});

/**
 * @function
 * @name dealJSONData
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function dealJSONData(JSONData){
    arrayDeduplication(JSONData.nodes, ["id"]);
    addFlatNodes(JSONData);

    changeInterfaceID(JSONData);
    arrayDeduplication(JSONData.links, ["source", "target"], false);
    addNodeLinks(JSONData);
}

/**
 * @function
 * @name addFlatNodes
 *
 * Generate the data needed for graph rendering
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function addFlatNodes(JSONData){
    JSONData.flatNodes = {};
    JSONData.nodeInterfaces = {};

    JSONData.nodes.map(function(node){
        JSONData.flatNodes[node.id] = JSON.parse(JSON.stringify(node));

        if(node.local_addresses){
            node.local_addresses.map(address => {
                JSONData.nodeInterfaces[address] = node;
            })
        }
    });
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
    let nodeLinks = {};

    JSONData.links.map(function(link){
        let sourceNode = JSONData.flatNodes[link.source],
            targetNode = JSONData.flatNodes[link.target];
        if(sourceNode && targetNode && sourceNode.id !== targetNode.id){
            if(!nodeLinks[sourceNode.id]){
                nodeLinks[sourceNode.id] = 0;
            }
            if(!nodeLinks[targetNode.id]){
                nodeLinks[targetNode.id] = 0;
            }
            nodeLinks[sourceNode.id]++;
            nodeLinks[targetNode.id]++;
        }
    });
    JSONData.nodes.map(function(node){
        node.linkCount = nodeLinks[node.id] || 0;
    });
}

/**
 * @function
 * @name changeInterfaceID
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {object}  JSONData     NetJSONData
 * 
 */
function changeInterfaceID(JSONData){
    for(let i = JSONData.links.length - 1;i >= 0;i--){
        let link = JSONData.links[i];

        if(link.source && link.target){
            if(JSONData.nodeInterfaces[link.source]){
                link.source = JSONData.nodeInterfaces[link.source].id;
            }
            if(JSONData.nodeInterfaces[link.target]){
                link.target = JSONData.nodeInterfaces[link.target].id;
            }
            if(link.source === link.target){
                JSONData.links.splice(i, 1);
            }
        }
    }
}

/**
 * @function
 * @name arrayDeduplication
 *
 * Data Flattening, Data deduplication and detection of dirty data, etc.
 * @param  {array}  arrData     
 * @param  {array}  eigenvalues     arrData performs deduplication based on these eigenvalues
 * @param {boolean} ordered         eigenvalues are ordered ?
 * 
 */
function arrayDeduplication(arrData, eigenvalues = [], ordered = true){
    let tempStack = [];
    for(let i = arrData.length - 1;i >= 0;i--){
        let tempValueArr = [], flag = 0;
        for(let key of eigenvalues){
            if(!arrData[i][key]){
                flag = 1;
                break;
            }
            tempValueArr.push(arrData[i][key]);
        }
        if(flag){
            arrData.splice(i, 1);
        }
        else{
            let value = ordered ? tempValueArr.join('') : tempValueArr.sort().join('');
            if(tempStack.indexOf(value) !== -1){
                arrData.splice(i, 1);
            }
            else{
                tempStack.push(value);
            }   
        }
    }
}
