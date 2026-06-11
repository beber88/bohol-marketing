// ROI Calculator JavaScript
const INITIAL_INVESTMENT = 32000000; // ₱32M initial property value
const ANNUAL_APPRECIATION_RATE = 0.125; // 12.5% annual property appreciation

// Format number as Philippine Peso
function formatPeso(amount) {
    return '₱ ' + amount.toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

// Format percentage
function formatPercent(value) {
    return value.toFixed(1) + '%';
}

// Get input values
function getInputValues() {
    const peakRate = parseFloat(document.querySelector('.input-column:nth-child(1) .input-row:nth-child(2) input').value) || 0;
    const peakMonths = parseFloat(document.querySelector('.input-column:nth-child(1) .input-row:nth-child(3) input').value) || 0;
    const regularRate = parseFloat(document.querySelector('.input-column:nth-child(2) .input-row:nth-child(2) input').value) || 0;
    const regularMonths = parseFloat(document.querySelector('.input-column:nth-child(2) .input-row:nth-child(3) input').value) || 0;
    const managementPercent = parseFloat(document.querySelector('.input-column:nth-child(1) .input-row:nth-child(1) input').value) || 0;
    const otherExpensesPercent = parseFloat(document.querySelector('.input-column:nth-child(2) .input-row:nth-child(1) input').value) || 0;

    return {
        peakRate,
        peakMonths,
        regularRate,
        regularMonths,
        managementPercent,
        otherExpensesPercent
    };
}

// Calculate results
function calculateResults() {
    const inputs = getInputValues();
    
    // Annual Gross Revenue = (Peak Rate × Peak Months) + (Regular Rate × Regular Months)
    const annualGrossRevenue = (inputs.peakRate * inputs.peakMonths) + (inputs.regularRate * inputs.regularMonths);
    
    // Total cost percentage
    const totalCostPercent = inputs.managementPercent + inputs.otherExpensesPercent;
    
    // Total Annual Costs = Gross Revenue × (Management % + Other Expenses %)
    const totalAnnualCosts = annualGrossRevenue * (totalCostPercent / 100);
    
    // Net Income = Gross Revenue - Total Costs
    const netIncome = annualGrossRevenue - totalAnnualCosts;
    
    // Annual ROI = (Net Rental Income + Property Appreciation) / Initial Investment × 100
    const annualAppreciation = INITIAL_INVESTMENT * ANNUAL_APPRECIATION_RATE;
    const roi = ((netIncome + annualAppreciation) / INITIAL_INVESTMENT) * 100;
    
    return {
        annualGrossRevenue,
        totalAnnualCosts,
        netIncome,
        roi,
        totalCostPercent
    };
}


// Calculate projection data for 5 years
function calculateProjection(netIncome) {
    const projectionData = [];
    
    for (let year = 1; year <= 5; year++) {
        // Cumulative Rental Income (net) over the years
        const cumulativeRental = netIncome * year;
        
        // Property Value with annual appreciation
        const propertyValue = INITIAL_INVESTMENT * Math.pow(1 + ANNUAL_APPRECIATION_RATE, year);
        
        // Total Gain = Cumulative Rental + Property Appreciation
        const propertyAppreciation = propertyValue - INITIAL_INVESTMENT;
        const totalGain = cumulativeRental + propertyAppreciation;
        
        // Total ROI = (Total Gain / Initial Investment) × 100
        const totalROI = (totalGain / INITIAL_INVESTMENT) * 100;
        
        projectionData.push({
            year,
            cumulativeRental,
            propertyValue,
            totalGain,
            totalROI
        });
    }
    
    return projectionData;
}

// Update results section
function updateResults(results) {
    document.getElementById('annual-revenue').textContent = formatPeso(results.annualGrossRevenue);
    document.getElementById('annual-costs').textContent = formatPeso(results.totalAnnualCosts);
    document.getElementById('net-income').textContent = formatPeso(results.netIncome);
    document.getElementById('roi').textContent = formatPercent(results.roi);
}

// Update projection table
function updateProjectionTable(projectionData) {
    projectionData.forEach((data, index) => {
        const year = index + 1;
        document.getElementById(`cumulative-rental-year-${year}`).textContent = formatPeso(data.cumulativeRental);
        document.getElementById(`property-value-year-${year}`).textContent = formatPeso(data.propertyValue);
        document.getElementById(`total-gain-year-${year}`).textContent = formatPeso(data.totalGain);
        document.getElementById(`total-roi-year-${year}`).textContent = formatPercent(data.totalROI);
    });
}

// Update projection summary
function updateProjectionSummary(projectionData, netIncome) {
    const year5Data = projectionData[4]; // Year 5 data
    
    // Total Rental Income over 5 years
    const totalRentalIncome = netIncome * 5;
    
    // Property Appreciation over 5 years
    const propertyAppreciation = year5Data.propertyValue - INITIAL_INVESTMENT;
    
    // Combined ROI
    const combinedROI = year5Data.totalROI;
    
    document.getElementById('total-rental-income').textContent = formatPeso(totalRentalIncome);
    document.getElementById('property-appreciation').textContent = formatPeso(propertyAppreciation);
    document.getElementById('combined-roi').textContent = formatPercent(combinedROI);
}

// Main calculation function
function recalculate() {
    const results = calculateResults();
    const projectionData = calculateProjection(results.netIncome);
    
    updateResults(results);
    updateProjectionTable(projectionData);
    updateProjectionSummary(projectionData, results.netIncome);
}

// Attach event listeners to all input fields
function attachEventListeners() {
    const inputs = document.querySelectorAll('.calculator-inputs input');
    inputs.forEach(input => {
        input.addEventListener('input', recalculate);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    attachEventListeners();
    recalculate(); // Initial calculation with default values
});
