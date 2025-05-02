import React from 'react';
import './ImageModal.scss';

const ImageModal = ({ originalUrl, compareUrl, onClose, match, align, rank }) => {
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    const getMetricClass = (value) => (value ? 'text-blue' : 'text-red');

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={handleContentClick}>
                <button className="image-modal-close-button" onClick={onClose}>×</button>
                <div className="image-modal-images-container">
                    <div className="image-wrapper">
                        <p className='image-title'>Generated Chart Image</p>
                        <img src={originalUrl} alt="Generated Chart" />
                    </div>
                    <div className="image-wrapper">
                        <p  className='image-title'>Bar-like Object Detection & Comparison with Reference Chart</p>
                        <img src={compareUrl} alt="Comparison Chart" />
                        <p className="legend-text">
                            <span className="legend-box legend-green"></span>Matched boxes&nbsp;&nbsp;&nbsp;
                            <span className="legend-box legend-red"></span>Detected but unmatched&nbsp;&nbsp;&nbsp;
                            <span className="legend-box legend-gray"></span>Reference bars
                        </p>
                    </div>
                </div>

                <div className="image-metrics-display">
                    <div className="metrics-row">
                        <div className="metric-item">
                            <span className="metric-label">Match</span>
                            <span className={`metric-value ${getMetricClass(match)}`}>{match ? 'True' : 'False'}</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Align</span>
                            <span className={`metric-value ${getMetricClass(align)}`}>{align ? 'True' : 'False'}</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Rank</span>
                            <span className={`metric-value ${getMetricClass(rank)}`}>{rank ? 'True' : 'False'}</span>
                        </div>
                    </div>
                    <div className="metrics-descriptions">
                        <ul>
                            <li><strong>Match:</strong> Whether each detected box corresponds precisely to a bar of input chart in both position and count.</li>
                            <li><strong>Align:</strong> Whether all detected boxes are correctly aligned in terms of their top and bottom y-coordinates with the reference bars.</li>
                            <li><strong>Rank:</strong> Whether the rank between the upper y-coordinates of detected boxes and the data trends of input bar chart are identical.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
