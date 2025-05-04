import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './ChartComparison.scss';
import ImageModal from './ImageModal';

const dataCountOptions = [3, 4, 5, 6, 7];
const cannyOptions = ["default", "sparse", "blur"];
const assetOptions = ["thin_man", "bottle", "palm_tree", "stack_of_coins", "castle_tower", "balloon", "cactus"];
const assetSizeOptions = [0.4, 0.6, 0.8];
const condScaleOptions = [0.6, 0.8, 1.0, 1.2, 1.4];

const paramOptionsMap = {
    data_count: dataCountOptions,
    canny: cannyOptions,
    asset: assetOptions,
    asset_size: assetSizeOptions.map(v => v.toFixed(1)),
};

const paramLabels = {
    data_count: 'Data Count',
    canny: 'Canny',
    asset: 'Asset',
    asset_size: 'Asset Size',
};

const S3_BASE_URL = "https://grounded-chart-generation.s3.ap-northeast-2.amazonaws.com/";
const NUM_IMG_IDX = 3;

const ChartComparison = () => {
    const [metrics, setMetrics] = useState([]);
    const [comparisonParam, setComparisonParam] = useState('data_count');
    const [fixedParams, setFixedParams] = useState({
        data_count: 3,
        canny: 'default',
        asset: 'thin_man',
        asset_size: '0.4',
    });
    const [comparisonValues, setComparisonValues] = useState(['4', '6']);
    const [displayData, setDisplayData] = useState([]);
    const [selectedImageModalData, setSelectedImageModalData] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/metrics.csv');
                const reader = response.body.getReader();
                const result = await reader.read();
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value);

                Papa.parse(csv, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const parsedData = results.data.map(row => ({
                            ...row,
                            data_count: parseInt(row.data_count, 10),
                            asset_size: parseFloat(row.asset_size).toFixed(1),
                            cond_scale: parseFloat(row.cond_scale).toFixed(1),
                            img_idx: parseInt(row.img_idx, 10),
                            count_ok: row.count_ok === 'True',
                            align_ok: row.align_ok === 'True',
                            rank_ok: row.rank_ok === 'True',
                            success: row.success === 'True',
                        }));
                        setMetrics(parsedData);
                    },
                    error: (error) => console.error("Error parsing CSV:", error)
                });
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };
        fetchMetrics();
    }, []);

    useEffect(() => {
        const options = paramOptionsMap[comparisonParam];
        if (options && options.length >= 2) {
            setComparisonValues([String(options[0]), String(options[1])]);
        } else if (options && options.length === 1) {
             setComparisonValues([String(options[0]), String(options[0])]);
        }
         else {
            setComparisonValues(['', '']);
        }
    }, [comparisonParam]);


    useEffect(() => {
        if (metrics.length === 0) return;

        const newDisplayData = comparisonValues.map(compValue => {
            if (compValue === '') return { paramValue: '', gridData: {}, successCount: 0 };

            const filteredGroupData = metrics.filter(item => {
                for (const key in fixedParams) {
                    if (paramLabels[key] && key !== comparisonParam && String(item[key]) !== String(fixedParams[key])) {
                        return false;
                    }
                }
                return String(item[comparisonParam]) === String(compValue);
            });

            const structuredGridData = {};
            let groupSuccessCount = 0;
            condScaleOptions.forEach(scale => {
                const scaleStr = scale.toFixed(1);
                structuredGridData[scaleStr] = new Array(NUM_IMG_IDX).fill(null);

                const imagesForScale = filteredGroupData.filter(item => item.cond_scale === scaleStr);

                imagesForScale.forEach(item => {
                    if (item.img_idx >= 0 && item.img_idx < NUM_IMG_IDX) {
                        structuredGridData[scaleStr][item.img_idx] = item;
                        if (item.success) {
                            groupSuccessCount++;
                        }
                    }
                });
            });

            return { paramValue: compValue, gridData: structuredGridData, successCount: groupSuccessCount };
        });

        setDisplayData(newDisplayData);

    }, [metrics, comparisonParam, fixedParams, comparisonValues]);

    const handleFixedParamChange = (param, value) => {
        setFixedParams(prev => ({ ...prev, [param]: value }));
    };

    const handleComparisonValueChange = (index, value) => {
        setComparisonValues(prev => {
            const newValues = [...prev];
            newValues[index] = value;
            return newValues;
        });
    };

     const handleThumbnailClick = (item) => {
         if (!item) return;
        const imageName = `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}.png`;
        const imageUrl = `${S3_BASE_URL}origin/${item.asset}/scale${item.asset_size}/${imageName}`;
        const compareName = `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}_compare.png`;
        const compareUrl = `${S3_BASE_URL}compare/${item.asset}/scale${item.asset_size}/${compareName}`;

        setSelectedImageModalData({
            original: imageUrl,
            compare: compareUrl,
            match: item.count_ok,
            align: item.align_ok,
            rank: item.rank_ok,
        });
    };

    const closeModal = () => {
        setSelectedImageModalData(null);
    };

    return (
        <div className="chart-comparison-container">
            <div className="comparison-selectors">
                <div className="selector-item">
                    <label htmlFor="comparisonParam">Compare by:</label>
                    <select
                        id="comparisonParam"
                        value={comparisonParam}
                        onChange={(e) => setComparisonParam(e.target.value)}
                    >
                        {Object.keys(paramLabels).map(key => (
                            <option key={key} value={key}>{paramLabels[key]}</option>
                        ))}
                    </select>
                </div>

                {Object.keys(paramLabels).map(key => (
                    <div className="selector-item" key={key}>
                        <label htmlFor={`fixed-${key}`}>{paramLabels[key]}:</label>
                        <select
                            id={`fixed-${key}`}
                            value={fixedParams[key]}
                            onChange={(e) => handleFixedParamChange(key, e.target.value)}
                            disabled={key === comparisonParam}
                        >
                            {paramOptionsMap[key].map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div className="comparison-groups-container">
                {displayData.map((group, index) => (
                    <div className="comparison-group" key={index}>
                        <div className="comparison-value-selector">
                             <label>{paramLabels[comparisonParam]} :</label>
                             <select
                                value={group.paramValue}
                                onChange={(e) => handleComparisonValueChange(index, e.target.value)}
                             >
                                <option value="">Select...</option>
                                {paramOptionsMap[comparisonParam].map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                             </select>
                             <span className="success-rate-display">
                                 Success: {group.successCount} / {NUM_IMG_IDX * condScaleOptions.length}
                             </span>
                        </div>

                        <div className="inner-comparison-grid">
                            <table>
                                <thead>
                                    <tr>
                                        <th colSpan={condScaleOptions.length} className="grid-title-header">
                                            Conditioning Scale
                                        </th>
                                    </tr>
                                    <tr>
                                        {condScaleOptions.map(scale => (
                                            <th key={scale} className="header-cell">
                                                {scale.toFixed(1)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: NUM_IMG_IDX }).map((_, imgIdx) => (
                                        <tr key={imgIdx}>
                                            {condScaleOptions.map(scale => {
                                                const scaleStr = scale.toFixed(1);
                                                const item = group.gridData && group.gridData[scaleStr] ? group.gridData[scaleStr][imgIdx] : null;
                                                const thumbName = item ? `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}-thumb.png` : '';
                                                const thumbnailUrl = item ? `${S3_BASE_URL}thumb/origin/${item.asset}/scale${item.asset_size}/${thumbName}` : '';
                                                let cellClassName = 'image-cell';
                                                if (item) {
                                                    if (item.success) {
                                                        cellClassName += ' success-indicator';
                                                    } else {
                                                        cellClassName += ' failure-indicator';
                                                    }
                                                }

                                                return (
                                                    <td key={`${scaleStr}-${imgIdx}`} className={cellClassName}>
                                                        {item ? (
                                                            <>
                                                                <img
                                                                    src={thumbnailUrl}
                                                                    alt={`Thumb ${item?.asset} ${scaleStr} ${imgIdx}`}
                                                                    className="thumbnail-image"
                                                                    loading="lazy"
                                                                    onClick={() => handleThumbnailClick(item)}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.style.display = 'none';
                                                                        const placeholder = e.target.closest('td')?.querySelector('.thumbnail-placeholder');
                                                                        if (placeholder) placeholder.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div className="thumbnail-placeholder" style={{ display: 'none' }}>No Image</div>
                                                            </>
                                                        ) : (
                                                            <div className="thumbnail-placeholder">No Image</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImageModalData && (
                <ImageModal
                    originalUrl={selectedImageModalData.original}
                    compareUrl={selectedImageModalData.compare}
                    onClose={closeModal}
                    match={selectedImageModalData.match}
                    align={selectedImageModalData.align}
                    rank={selectedImageModalData.rank}
                />
            )}
        </div>
    );
};

export default ChartComparison;