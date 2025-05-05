import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import './ChartGallery.scss';
import ImageModal from './ImageModal';

const dataCountOptions = [3, 4, 5, 6, 7];
const cannyOptions = ["default", "sparse", "blur"];
const assetOptions = ["thin_man", "bottle", "palm_tree", "stack_of_coins", "castle_tower", "balloon", "cactus"];
const assetSizeOptions = [0.4, 0.6, 0.8];
const condScaleOptions = [0.6, 0.8, 1.0, 1.2, 1.4];

const initialFilters = {
    data_count: '',
    asset: '',
    canny: '',
    asset_size: '',
    cond_scale: '', // Added cond_scale here if it wasn't already
    success: '', // Add success filter state
};

const ChartGallery = () => {
    const [metrics, setMetrics] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    });
    const [selectedImages, setSelectedImages] = useState({ original: null, compare: null });

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [visibleData, setVisibleData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    // 이미지 로딩
    const [loadedImages, setLoadedImages] = useState({});

    const [filters, setFilters] = useState(initialFilters);
    const [successCount, setSuccessCount] = useState(0);
    const [successRate, setSuccessRate] = useState(0);

    const S3_BASE_URL = "https://grounded-chart-generation.s3.ap-northeast-2.amazonaws.com/";

    // Fetch initial data
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
                            asset_size: parseFloat(row.asset_size),
                            cond_scale: parseFloat(row.cond_scale).toFixed(1),
                            img_idx: parseInt(row.img_idx, 10),
                            Det_count: parseInt(row.Det_count, 10),
                            Match_count: parseInt(row.Match_count, 10),
                            //Y_top_err: row.Y_top_err === 'inf' ? Infinity : parseFloat(row.Y_top_err).toFixed(4),
                            //Y_bot_err: row.Y_bot_err === 'inf' ? Infinity : parseFloat(row.Y_bot_err).toFixed(4),
                            // TooWide: row.TooWide === '1',
                            count_ok: row.count_ok === 'True',
                            align_ok: row.align_ok === 'True',
                            rank_ok: row.rank_ok === 'True',
                            success: row.success === 'True',
                        }));
                        setMetrics(parsedData);
                        setFilteredData(parsedData);
                    },
                    error: (error) => {
                        console.error("Error parsing CSV:", error);
                    }
                });
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };

        fetchMetrics();
    }, []);

    // Handle filtering, sorting, and pagination
    useEffect(() => {
        let data = [...metrics];

        // Apply filters - Updated logic for exact match or 'All'
        data = data.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                if (filterValue === '') { // 'All' case
                    return true;
                }
                // Handle boolean 'success' filter specifically
                if (key === 'success') {
                    const successValue = filterValue === 'true'; // Convert string 'true'/'false' to boolean
                    return item[key] === successValue;
                }
                // Handle other filters
                return item[key] == filterValue;
            });
        });

        const currentSuccessCount = data.filter(item => item.success).length;
        setSuccessCount(currentSuccessCount);
        setSuccessRate((currentSuccessCount / data.length) * 100 || 0);

        setFilteredData(data); // Update filtered data count immediately

        // Apply sorting
        if (sortConfig.key !== null && sortConfig.direction !== null) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
                const strA = String(aValue).toLowerCase();
                const strB = String(bValue).toLowerCase();
                if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        const calculatedTotalPages = Math.ceil(data.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);

        const newCurrentPage = Math.min(currentPage, calculatedTotalPages) || 1;
        if (currentPage !== newCurrentPage) {
            setCurrentPage(newCurrentPage);
        }

        const startIndex = (newCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setVisibleData(data.slice(startIndex, endIndex));

    }, [metrics, filters, sortConfig, currentPage, itemsPerPage]);


    // Updated requestSort to cycle through ascending -> descending -> none
    const requestSort = (key) => {
        let direction = 'ascending';
        let newKey = key;

        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (sortConfig.direction === 'descending') {
                direction = null;
                newKey = null;
            }
        }
        setSortConfig({ key: newKey, direction: newKey === null ? null : direction });
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRowClick = (item) => {
        const imageName = `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}.png`;
        const imageUrl = `${S3_BASE_URL}origin/${item.asset}/scale${item.asset_size}/${imageName}`;
        const compareName = `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}_compare.png`;
        const compareUrl = `${S3_BASE_URL}compare/${item.asset}/scale${item.asset_size}/${compareName}`;
        // Add metric values to the state
        setSelectedImages({
            original: imageUrl,
            compare: compareUrl,
            match: item.count_ok,
            align: item.align_ok,
            rank: item.rank_ok,
            // Include Det_count and Match_count if needed in modal, otherwise remove
            // detCount: item.Det_count,
            // matchCount: item.Match_count
        });
    };

    const closeModal = () => {
        setSelectedImages({ original: null, compare: null, match: null, align: null, rank: null }); // Reset metrics too
    };

    const columns = [
        { key: 'thumbnail', label: 'Chart Image' },
        { key: 'data_count', label: 'Data Count' },
        { key: 'asset', label: 'Asset' },
        { key: 'canny', label: 'Canny' },
        { key: 'asset_size', label: 'Asset Size' },
        { key: 'cond_scale', label: 'Cond Scale' },
        { key: 'input_prompt', label: 'Prompt for Obj Det' },
        { key: 'Det_count', label: 'Det Count' },
        { key: 'Match_count', label: 'Match Count' },
        //{ key: 'Y_top_err', label: 'Y Top Err' },
        //{ key: 'Y_bot_err', label: 'Y Bot Err' },
        //{ key: 'TooWide', label: 'Too Wide' },
        { key: 'count_ok', label: 'Match' },
        { key: 'align_ok', label: 'Align' },
        { key: 'rank_ok', label: 'Rank' },
        //{ key: 'success', label: 'Success' },
    ];

    const getSortIndicator = (columnKey) => {
        if (sortConfig.key === columnKey && sortConfig.direction) {
            return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div className="image-information-container">
            <div className="filter-container">
                {/* Data Count Filter */}
                <div className="filter-item">
                    <label htmlFor="data_count">Data Count: </label>
                    <select id="data_count" name="data_count" value={filters.data_count} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {dataCountOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Asset Filter */}
                <div className="filter-item">
                    <label htmlFor="asset">Asset: </label>
                    <select id="asset" name="asset" value={filters.asset} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {assetOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Canny Filter */}
                <div className="filter-item">
                    <label htmlFor="canny">Canny: </label>
                    <select id="canny" name="canny" value={filters.canny} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {cannyOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Asset Size Filter */}
                <div className="filter-item">
                    <label htmlFor="asset_size">Asset Size: </label>
                    <select id="asset_size" name="asset_size" value={filters.asset_size} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {assetSizeOptions.map(option => (
                            <option key={option.toFixed(1)} value={option.toFixed(1)}>{option.toFixed(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Conditioning Scale Filter */}
                <div className="filter-item">
                    <label htmlFor="cond_scale">Conditioning Scale: </label>
                    <select id="cond_scale" name="cond_scale" value={filters.cond_scale} onChange={handleFilterChange}>
                        <option value="">All</option>
                        {condScaleOptions.map(option => (
                            <option key={option.toFixed(1)} value={option.toFixed(1)}>{option.toFixed(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Success Filter */}
                <div className="filter-item">
                    <label htmlFor="success">Success: </label>
                    <select id="success" name="success" value={filters.success} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="true">Success</option>
                        <option value="false">Fail</option>
                    </select>
                </div>

                {/* Reset Button */}
                <div className="filter-item">
                    <button onClick={handleResetFilters} className="reset-button">Reset Filters</button>
                </div>
            </div>


            {/* Items Per Page Selector */}
            <div className="items-per-page-selector">
                <div className="items-per-page-options">
                    <label htmlFor="itemsPerPage">Items per page: </label>
                    <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span> Total items: {filteredData.length}</span>
                    <span> Success items: {successCount}</span>
                    <span> Success rate: {successRate.toFixed(2)}%</span>
                    </div>
                <div>
                    <span className='hint'>* Click image to see details</span>
                </div>
            </div>

            {/* Table Section with conditional styling and thumbnails */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => col.key !== 'thumbnail' && requestSort(col.key)}>
                                    {col.label}
                                    {col.key !== 'thumbnail' && getSortIndicator(col.key)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleData.map((item, index) => {
                            const highlightRow = item.success;
                            const thumbName = `logarithmic-${item.data_count}-${item.canny}-${item.asset}-scale${item.asset_size}-${item.cond_scale}-${item.img_idx}-thumb.png`;
                            const thumbnailUrl = `${S3_BASE_URL}thumb/origin/${item.asset}/scale${item.asset_size}/${thumbName}`;

                            return (
                                <tr key={index} className={highlightRow ? 'row-highlight-blue' : ''} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                                    {columns.map(col => {
                                        const isBooleanCol = ['count_ok', 'align_ok', 'rank_ok', 'TooWide'].includes(col.key);
                                        const value = item[col.key];
                                        let displayValue = value;
                                        let cellClass = '';

                                        if (isBooleanCol) {
                                            displayValue = value ? 'True' : 'False';
                                            if (['count_ok', 'align_ok', 'rank_ok'].includes(col.key)) {
                                                cellClass = value ? 'text-blue' : 'text-red';
                                            }
                                        } else if (value === Infinity || value === -Infinity) {
                                            displayValue = 'inf';
                                        } else {
                                            displayValue = String(value);
                                        }

                                        return (
                                            <td key={col.key} className={cellClass}>
                                                {col.key === 'thumbnail' ? (
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt={`Thumb ${item.asset} ${item.img_idx}`}
                                                        className="thumbnail-image"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : col.key === 'count_ok' || col.key === 'align_ok' || col.key === 'rank_ok' || col.key === 'TooWide' ? (
                                                    item[col.key] ? 'True' : 'False'
                                                ) : (
                                                    displayValue
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="legend-text">
                <span className="legend-box legend-green"></span>
                Success cases&nbsp;&nbsp;&nbsp;
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    First
                </button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                    Last
                </button>
            </div>

            {/* Image Modal - Pass both URLs and metric values */}
            {selectedImages.original && selectedImages.compare && (
                <ImageModal
                    originalUrl={selectedImages.original}
                    compareUrl={selectedImages.compare}
                    onClose={closeModal}
                    match={selectedImages.match}
                    align={selectedImages.align}
                    rank={selectedImages.rank}
                />
            )}
        </div>
    );
};

export default ChartGallery;