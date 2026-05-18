import React, { useState } from 'react';
import './TileCalculator.css';

export default function TileCalculator({ onClose }) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [area, setArea] = useState('');
  const [tileSize, setTileSize] = useState('');
  const [results, setResults] = useState(null);

  const handleLengthChange = (e) => { setLength(e.target.value); setArea(''); };
  const handleWidthChange = (e) => { setWidth(e.target.value); setArea(''); };
  const handleAreaChange = (e) => { setArea(e.target.value); setLength(''); setWidth(''); };

  const calculate = () => {
    let totalArea = 0;
    if (area) {
      totalArea = parseFloat(area);
    } else if (length && width) {
      totalArea = parseFloat(length) * parseFloat(width);
    }

    if (!totalArea || totalArea <= 0) {
      alert('Please enter valid dimensions or area.');
      return;
    }

    if (!tileSize) {
      alert('Please select a tile size.');
      return;
    }

    const [tWidth, tHeight] = tileSize.split('x').map(Number);
    const tileArea = (tWidth / 100) * (tHeight / 100);

    const tilesExact = Math.ceil(totalArea / tileArea);
    const tilesWithWastage = Math.ceil(tilesExact * 1.1);
    const adhesiveBags = Math.ceil(totalArea / 4); // 25kg bags
    const groutBags = Math.ceil(totalArea / 10); // 2kg bags

    setResults({
      totalArea: totalArea.toFixed(2),
      tilesExact,
      tilesWithWastage,
      adhesiveBags,
      groutBags
    });
  };

  return (
    <div className="tile-calculator">
      <div className="calculator-header">
        <h2>TILE, GROUT, & ADHESIVE <span className="highlight-text">CALCULATOR</span></h2>
        <p>Having a hard time deciding how many tiles, adhesive and grout you need?<br/>
        Use our TileMatch Calculator and get the right estimates for your projects!</p>
        {onClose && <button className="close-calculator" onClick={onClose} title="Close Calculator">&times;</button>}
      </div>

      <div className="calculator-body">
        <div className="input-group-row">
          <label>Length (m):</label>
          <input type="number" placeholder="Input number here" value={length} onChange={handleLengthChange} min="0" step="0.01" />
        </div>
        <div className="input-group-row">
          <label>Width (m):</label>
          <input type="number" placeholder="Input number here" value={width} onChange={handleWidthChange} min="0" step="0.01" />
        </div>
        
        <div className="or-divider">OR</div>

        <div className="input-group-row">
          <label>Area (m²):</label>
          <input type="number" placeholder="Input number here" value={area} onChange={handleAreaChange} min="0" step="0.01" />
        </div>

        <div className="input-group-row">
          <label>Tile Size (cm):</label>
          <select value={tileSize} onChange={e => setTileSize(e.target.value)}>
            <option value="">Select</option>
            <option value="20x20">20x20</option>
            <option value="30x30">30x30</option>
            <option value="30x60">30x60</option>
            <option value="40x40">40x40</option>
            <option value="60x60">60x60</option>
          </select>
        </div>

        <button className="calculate-btn" onClick={calculate}>CALCULATE</button>

        {results && (
          <div className="calculator-results">
            <h3>Estimated Requirements for {results.totalArea} m²</h3>
            <div className="result-grid">
              <div className="result-card">
                <div className="result-val">{results.tilesWithWastage}</div>
                <div className="result-label">Tiles (incl. 10% wastage)</div>
                <div className="result-subtext">Exact: {results.tilesExact} tiles</div>
              </div>
              <div className="result-card">
                <div className="result-val">{results.adhesiveBags}</div>
                <div className="result-label">Bags of Adhesive</div>
                <div className="result-subtext">25kg bags</div>
              </div>
              <div className="result-card">
                <div className="result-val">{results.groutBags}</div>
                <div className="result-label">Bags of Grout</div>
                <div className="result-subtext">2kg bags</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
