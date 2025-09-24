# Sales Velocity Tracking Features

## Overview
Comprehensive sales velocity tracking methods have been added to the CRM store (`/src/modules/crm-core/stores/crmStore.js`) to provide detailed sales performance analysis and insights.

## New Methods Added

### 1. `getSalesVelocityMetrics(options)`
**Main velocity calculation method**
- Calculates overall sales velocity using the formula: `(Number of deals × Average deal value × Win rate) / Average sales cycle length`
- Returns comprehensive metrics including components breakdown, formatted values, and trend analysis
- Supports filtering by timeframe, assignee, stage, and source

**Options:**
- `timeframe`: '1d', '7d', '30d', '90d', '6m', '1y', 'all'
- `assignee`: specific assignee ID or 'all'
- `stage`: specific stage ID or 'all'
- `source`: specific source or 'all'

**Returns:**
```javascript
{
  salesVelocity: 1234.56,
  components: {
    numberOfDeals: 25,
    averageDealValue: 15000,
    winRate: 35.5,
    averageSalesCycle: 45.2
  },
  formattedVelocity: "$1,235 per day",
  monthlyVelocity: 37037,
  yearlyVelocity: 450568,
  trend: 15.3,
  timeframe: "30d"
}
```

### 2. `getDealCycleMetrics(options)`
**Average sales cycle analysis**
- Analyzes deal cycle lengths across different stages
- Provides distribution analysis and percentile calculations
- Tracks cycle improvement trends

**Returns:**
```javascript
{
  overallMetrics: {
    averageCycle: 45.2,
    medianCycle: 42,
    shortestCycle: 15,
    longestCycle: 180,
    totalDeals: 150,
    closedDeals: 85
  },
  stageMetrics: { /* by stage analysis */ },
  cycleDistribution: {
    "0-30": 25,
    "31-60": 35,
    "61-90": 20,
    "91-180": 15,
    "180+": 5
  },
  percentiles: { p25: 30, p50: 42, p75: 65, p90: 90 }
}
```

### 3. `getSalesVelocityByAssignee(options)`
**Individual rep velocity analysis**
- Calculates velocity metrics for each sales representative
- Provides performance rankings and team comparisons
- Includes detailed performance metrics per assignee

**Returns:**
```javascript
{
  assigneeMetrics: {
    "rep1": {
      salesVelocity: 1500,
      ranking: 1,
      performance: {
        dealsWorked: 20,
        dealsWon: 8,
        dealsLost: 5,
        totalRevenue: 120000,
        averageWonDealValue: 15000
      }
    }
  },
  teamAverages: {
    averageVelocity: 980,
    averageDeals: 15,
    averageRevenue: 85000,
    totalTeamRevenue: 500000
  },
  leaderboard: [ /* top 10 performers */ ]
}
```

### 4. `getSalesVelocityTrends(options)`
**Velocity over time analysis**
- Tracks velocity trends across different time periods
- Supports daily, weekly, monthly, and quarterly granularity
- Calculates growth rates and trend directions

**Options:**
- `granularity`: 'daily', 'weekly', 'monthly', 'quarterly'
- `periods`: number of periods to analyze (default: 12)

**Returns:**
```javascript
{
  trends: [
    {
      period: "Jan 2024",
      salesVelocity: 1200,
      dealCount: 18,
      wonDeals: 6,
      totalValue: 180000
    }
  ],
  analysis: {
    direction: "up",
    growthRate: 15.3,
    averageVelocity: 1150,
    peakVelocity: 1500,
    lowestVelocity: 800
  }
}
```

### 5. `getVelocityBreakdown(options)`
**Velocity by dimensions analysis**
- Breaks down velocity by stage, source, value ranges, or assignee
- Provides comparative analysis across different categories
- Identifies highest and lowest performing segments

**Options:**
- `breakdown`: 'stage', 'source', 'value_range', 'assignee'
- `timeframe`: standard timeframe options

**Breakdown Types:**
- **Stage**: Analyzes velocity by deal stages
- **Source**: Analyzes velocity by lead/deal sources
- **Value Range**: Analyzes velocity by deal size categories:
  - Small Deals (<$10K)
  - Medium Deals ($10K-$50K)
  - Large Deals ($50K-$100K)
  - Enterprise Deals (>$100K)
- **Assignee**: Returns `getSalesVelocityByAssignee()` results

## Helper Methods

### Private Helper Methods Added:
- `_calculateAverageSalesCycle(deals)`: Calculates average sales cycle length
- `_getTimeframeCutoff(timeframe)`: Generates date cutoffs for filtering
- `_getPreviousPeriodDeals(timeframe)`: Gets deals from previous period for trend analysis
- `_groupBy(array, key)`: Groups array items by specified key

## Integration with Existing Store

### Seamless Integration:
- Methods follow existing store patterns and conventions
- Compatible with current deal structure and stages
- Works with existing filtering and state management
- Maintains performance with efficient calculations
- Utilizes existing `dealStages` configuration

### Data Requirements:
The methods work with the existing deal structure that includes:
- `id`, `createdAt`, `updatedAt`
- `stage` (maps to existing `dealStages`)
- `value` (deal amount)
- `assigneeId` (sales rep assignment)
- `source` (lead source)

## Usage Examples

### Basic Usage:
```javascript
import useCRMStore from './modules/crm-core/stores/crmStore';

const { getSalesVelocityMetrics, getDealCycleMetrics } = useCRMStore();

// Get 30-day velocity metrics
const velocity = getSalesVelocityMetrics({ timeframe: '30d' });

// Get cycle analysis for specific assignee
const cycles = getDealCycleMetrics({ 
  timeframe: '90d', 
  assignee: 'rep123' 
});
```

### React Component Usage:
```javascript
const SalesVelocityWidget = () => {
  const { getSalesVelocityMetrics } = useCRMStore();
  
  const metrics = useMemo(() => 
    getSalesVelocityMetrics({ timeframe: '30d' }), 
    []
  );
  
  return (
    <div>
      <h3>Sales Velocity: {metrics.formattedVelocity}</h3>
      <p>Monthly Projection: ${metrics.monthlyVelocity.toLocaleString()}</p>
    </div>
  );
};
```

## Files Modified/Created

### Modified:
- `/src/modules/crm-core/stores/crmStore.js` - Added all sales velocity methods

### Created:
- `/src/examples/salesVelocityExample.js` - Usage examples and React component template

## Key Features

### Advanced Analytics:
- Comprehensive velocity calculations
- Trend analysis with period-over-period comparison
- Performance rankings and leaderboards
- Distribution and percentile analysis

### Flexible Filtering:
- Time-based filtering (1 day to 1 year)
- Assignee-specific analysis
- Stage-based filtering
- Source-based analysis

### Business Intelligence:
- Win rate calculations
- Deal cycle optimization insights
- Performance benchmarking
- Growth trend identification

### Developer-Friendly:
- Well-documented methods with JSDoc
- Consistent return formats
- Error handling for edge cases
- Performance-optimized calculations

## Implementation Notes

- All methods handle empty data gracefully
- Calculations include proper null/undefined checks
- Date handling accounts for timezone considerations
- Performance optimized for large datasets
- Maintains backward compatibility with existing store functionality