import { useState } from 'react';

const ChartComparison = () => {
  const data_count = [3, 4, 5, 6, 7];
  const canny_technique = ["default", "sparse", "blur"];
  const asset = ["human", "bottle", "palm tree", "stack of coins", "castle tower", "balloon", "cactus"];
  const width_scale = ["scale0.4", "scale0.6", "scale0.8"];
  
  const [selected_match, setSelectedMatch] = useState('data_count');
  const [sharedParams, setSharedParams] = useState({
    data_count: 4,
    canny_technique: 'sparse',
    asset: 'human',
    width_scale: 'scale0.8'
  });
  
  const [comparisonValues, setComparisonValues] = useState({
    left: selected_match === 'data_count' ? 4 : 
          selected_match === 'canny_technique' ? 'sparse' : 
          selected_match === 'asset' ? 'human' : 'scale0.8',
    right: selected_match === 'data_count' ? 6 : 
          selected_match === 'canny_technique' ? 'default' : 
          selected_match === 'asset' ? 'bottle' : 'scale0.6'
  });
  
  const updateSharedParam = (param, value) => {
    setSharedParams({
      ...sharedParams,
      [param]: value
    });
  };

  return (
    <div className='image-comparison-container'>
      <div className="image-selector-container">
        <div className="match-selector">
          <label>Compare by: </label>
          <select 
            value={selected_match}
            onChange={(e) => setSelectedMatch(e.target.value)}
          >
            <option value="data_count">data_count</option>
            <option value="canny_technique">canny_technique</option>
            <option value="asset">asset</option>
            <option value="width_scale">width_scale</option>
          </select>
        </div>
        
        <div className="shared-parameter-selectors">
          {/* Data Count Selector */}
          <div className="selector-group">
            <label>Data Count:</label>
            <select 
              value={selected_match === "data_count" ? comparisonValues.left : sharedParams.data_count}
              onChange={(e) => updateSharedParam("data_count", e.target.value)}
              disabled={selected_match === "data_count"}
            >
              {data_count.map(count => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          
          {/* Canny Technique Selector */}
          <div className="selector-group">
            <label>Canny:</label>
            <select 
              value={selected_match === "canny_technique" ? comparisonValues.left : sharedParams.canny_technique}
              onChange={(e) => updateSharedParam("canny_technique", e.target.value)}
              disabled={selected_match === "canny_technique"}
            >
              {canny_technique.map(technique => (
                <option key={technique} value={technique}>{technique}</option>
              ))}
            </select>
          </div>
          
          {/* Asset Selector */}
          <div className="selector-group">
            <label>Asset:</label>
            <select 
              value={selected_match === "asset" ? comparisonValues.left : sharedParams.asset}
              onChange={(e) => updateSharedParam("asset", e.target.value)}
              disabled={selected_match === "asset"}
            >
              {asset.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          {/* Width Scale Selector */}
          <div className="selector-group">
            <label>Width:</label>
            <select 
              value={selected_match === "width_scale" ? comparisonValues.left : sharedParams.width_scale}
              onChange={(e) => updateSharedParam("width_scale", e.target.value)}
              disabled={selected_match === "width_scale"}
            >
              {width_scale.map(scale => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="image-display">
        <div className="comparison-container">

          <div className="comparison-left">
            <h3>4 Data Points</h3>
            <div className="image-grid">
              {/* Images will be dynamically loaded based on selector parameters */}
            </div>
          </div>

          <div className="comparison-right">
            <h3>6 Data Points</h3>
            <div className="image-grid">
              {/* Images will be dynamically loaded based on selector parameters */}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ChartComparison;