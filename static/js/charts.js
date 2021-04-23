function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    washingFrequency = 0;
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
      
    });
    
  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samplesArray = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleObjects = samplesArray.filter(function(individualSample){
      return individualSample.id === sample;
        });

    //  5. Create a variable that holds the first sample in the array.
    var sampleObject = sampleObjects[0];
    var objList = [];

    // 6 & 7. Create variables that hold the otu_ids, otu_labels, and sample_values. 

    // To successfully sort the list, we'll break apart the data and put it in a dictionary with relevant fields used:
    for (var j= 0; j < sampleObject.otu_ids.length; j++){
      objList.push({
        'otuIds': 'OTU ' + sampleObject.otu_ids[j],
        'otuLabels': sampleObject.otu_labels[j],
        'sampleValues': sampleObject.sample_values[j]
      })
    }

    // Then we'll sort, keeping data integrity
    objList.sort((a,b) =>  b.sampleValues - a.sampleValues) ;

    var otuIds = [];
    var otuLabels = [];
    var sampleValues = [];

    // Then we'll break the data back up, into individual arrays:
    for (var i = 0 ; i < 10; i++){
      otuIds.push(objList[i]['otuIds']);
      otuLabels.push(objList[i]['otuLabels']);
      sampleValues.push(objList[i]['sampleValues']);
       
    }
    
    
    // 3. Create a variable that holds the washing frequency.

    
    var washingFrequency = null;
    // GET WASHING FREQUENCY

    var metadata = data.metadata;
    var result = metadata.filter(sampleObj => sampleObj.id == sample)[0];
    Object.entries(result).forEach(([key, value]) => {
      if (key === "wfreq"){
        washingFrequency = value;
      }
      
    });
  //  var washingFrequency = metadata.filter(sampleObj => sampleObj.id == sample);

    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: sampleValues,
      y: otuIds,
      text:otuLabels,
      type: 'bar',
      orientation: 'h'
      
  }];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      xaxis: { title: "Samples"},
      yaxis: {autorange:'reversed' }
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
        
    // DELIVERABLE 2
 
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x : sampleObject.otu_ids,
      y : sampleObject.sample_values,
      text : sampleObject.otu_labels,
      mode: 'markers',
      marker: {
        color: sampleObject.otu_ids,
        size: sampleObject.sample_values
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID"},
      height: 600,
      width: 1400
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

      
    // DELIVERABLE 3
    // Get Washing Frequency (From above)
    console.log("WFREQ:",washingFrequency);
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain:{
        x: [0,1], y: [0,1]
      },
      value: washingFrequency,
      title: {text:'<b>Belly Button Washing Frequency</b><br>Scrubs per Week'},
      type:'indicator',
      mode:"gauge+number",
      gauge: {
        axis: {range: [null, 10] },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "blue" },
          { range: [8, 10], color: "green" }
        ],
        threshold: {
          line: { color: "black", width: 4 },
          thickness: 0.75,
          value: 490
        }
      }

    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 600, height: 500, margin: { t: 0, b: 0 } 
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);

  });
}
