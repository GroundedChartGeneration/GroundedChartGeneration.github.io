import React from 'react';
import './ImageModal.scss';

const ImageModal = ({ originalUrl, compareUrl, onClose }) => {
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

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
                        <p>
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid green',
                            marginRight: '6px',
                            verticalAlign: 'middle'
                        }}></span>Matched boxes&nbsp;&nbsp;&nbsp;
                        
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid red',
                            marginRight: '6px',
                            verticalAlign: 'middle'
                        }}></span>Detected but unmatched&nbsp;&nbsp;&nbsp;

                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid gray',
                            marginRight: '6px',
                            verticalAlign: 'middle'
                        }}></span>Reference bars
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
