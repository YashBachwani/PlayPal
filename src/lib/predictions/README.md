# AI Prediction Engine

Machine learning-based predictions for cricket matches using historical data.

## Features

- ✅ **Next Ball Prediction** - Predict outcome (dot, single, boundary, wicket)
- ✅ **Wicket Probability** - Calculate dismissal chances
- ✅ **Boundary Probability** - Predict 4s and 6s
- ✅ **Win Prediction** - Calculate team win probabilities
- ✅ **Batting Order** - Recommend optimal batting lineup
- ✅ **Bowling Strategy** - Suggest best bowler
- ✅ **Weak Zones** - Identify player vulnerabilities

## Quick Start

### Basic Usage

```typescript
import { PredictionEngine } from '@/lib/predictions';

const engine = new PredictionEngine();

// Predict next ball
const prediction = await engine.predictNextBall(matchId, batsmanId, bowlerId);
console.log(prediction);
// { outcome: 'BOUNDARY', probability: 0.35, confidence: 0.82, reasoning: '...' }
```

### Predict Winner

```typescript
const winPrediction = await engine.predictWinner(matchId);
console.log(`Team A: ${winPrediction.teamAWinProbability}%`);
console.log(`Team B: ${winPrediction.teamBWinProbability}%`);
```

### Get Player Weak Zones

```typescript
const weakZones = await engine.getPlayerWeakZones(playerId);
weakZones.zones.forEach(zone => {
  console.log(`${zone.area}: ${zone.weakness * 100}% weakness`);
});
```

## API Reference

### `predictNextBall(matchId, batsmanId, bowlerId)`

Predict the outcome of the next ball.

**Returns:**
```typescript
{
  outcome: 'DOT' | 'SINGLE' | 'BOUNDARY' | 'WICKET',
  probability: number,
  confidence: number,
  reasoning: string
}
```

### `predictWicket(matchId, batsmanId, bowlerId)`

Calculate wicket probability.

**Returns:**
```typescript
{
  probability: number,
  mostLikelyType: 'CAUGHT' | 'BOWLED' | 'LBW' | 'RUN_OUT',
  confidence: number
}
```

### `predictBoundary(matchId, batsmanId, bowlerId)`

Calculate boundary probabilities.

**Returns:**
```typescript
{
  fourProbability: number,
  sixProbability: number,
  totalProbability: number,
  confidence: number
}
```

### `predictWinner(matchId)`

Predict match winner.

**Returns:**
```typescript
{
  teamAWinProbability: number,
  teamBWinProbability: number,
  drawProbability: number,
  confidence: number,
  factors: string[]
}
```

### `getBestBattingOrder(teamId)`

Get recommended batting order.

**Returns:**
```typescript
Array<{
  playerId: string,
  position: number,
  score: number,
  reasoning: string
}>
```

### `getBestBowlingOption(teamId, batsmanId)`

Get best bowler recommendation.

**Returns:**
```typescript
{
  playerId: string,
  score: number,
  reasoning: string,
  expectedWickets: number,
  expectedEconomy: number
}
```

### `getPlayerWeakZones(playerId)`

Identify player weak zones.

**Returns:**
```typescript
{
  playerId: string,
  zones: Array<{
    area: 'OFF_SIDE' | 'LEG_SIDE' | 'STRAIGHT' | 'SHORT' | 'FULL',
    weakness: number,
    dismissalRate: number
  }>
}
```

## Prediction Algorithms

### Next Ball Prediction

**Factors:**
- Batsman recent form (last 30 balls)
- Bowler recent form (last 30 balls)
- Strike rate analysis
- Wicket patterns
- Historical matchups

**Probabilities:**
- Dot ball: 20-50%
- Single: 20-40%
- Boundary: 5-25%
- Wicket: 5-20%

### Win Prediction

**Factors:**
- Current score differential
- Wickets remaining
- Run rate comparison
- Required run rate
- Historical performance

### Batting Order

**Scoring Criteria:**
- Average (30%)
- Strike rate (30%)
- Total runs (20%)
- Consistency (20%)

### Bowling Strategy

**Scoring Criteria:**
- Wickets taken (40%)
- Economy rate (30%)
- Average (30%)

## Usage Examples

### Complete Prediction Workflow

```typescript
import { PredictionEngine } from '@/lib/predictions';

const engine = new PredictionEngine();

// 1. Predict next ball
const nextBall = await engine.predictNextBall(matchId, batsmanId, bowlerId);
console.log(`Predicted: ${nextBall.outcome} (${nextBall.probability * 100}%)`);

// 2. Check wicket probability
const wicket = await engine.predictWicket(matchId, batsmanId, bowlerId);
if (wicket.probability > 0.15) {
  console.log('High wicket risk!');
}

// 3. Check boundary probability
const boundary = await engine.predictBoundary(matchId, batsmanId, bowlerId);
console.log(`Boundary chance: ${boundary.totalProbability}%`);

// 4. Predict winner
const winner = await engine.predictWinner(matchId);
console.log(`Win probability: Team A ${winner.teamAWinProbability}%`);

// 5. Get best batting order
const battingOrder = await engine.getBestBattingOrder(teamId);
battingOrder.forEach(rec => {
  console.log(`Position ${rec.position}: Player ${rec.playerId}`);
});

// 6. Get best bowler
const bowler = await engine.getBestBowlingOption(teamId, batsmanId);
console.log(`Best bowler: ${bowler.playerId} (${bowler.reasoning})`);

// 7. Analyze weak zones
const weakZones = await engine.getPlayerWeakZones(batsmanId);
const weakest = weakZones.zones.reduce((max, zone) =>
  zone.weakness > max.weakness ? zone : max
);
console.log(`Weakest zone: ${weakest.area}`);
```

### Integration with Live Broadcast

```typescript
// In LiveBroadcast component
const [prediction, setPrediction] = useState('');

useEffect(() => {
  const updatePrediction = async () => {
    const nextBall = await predictionEngine.predictNextBall(
      matchId,
      batsmanId,
      bowlerId
    );
    
    setPrediction(nextBall.reasoning);
  };
  
  updatePrediction();
  const interval = setInterval(updatePrediction, 10000); // Every 10s
  
  return () => clearInterval(interval);
}, [matchId, batsmanId, bowlerId]);
```

## Data Requirements

The prediction engine requires:
- Match history (stored in Cricket Data Layer)
- Ball-by-ball events
- Player statistics
- Team rosters

**Minimum Data:**
- 30 balls per player for reliable predictions
- 5 matches for team analysis
- 100 balls for weak zone analysis

## Accuracy

**Expected Accuracy:**
- Next ball: 60-70%
- Wicket probability: 65-75%
- Boundary probability: 70-80%
- Win prediction: 75-85%

**Confidence Scores:**
- High (0.8-1.0): Very reliable
- Medium (0.6-0.8): Moderately reliable
- Low (0.5-0.6): Less reliable

## Limitations

- Predictions based on historical patterns
- No real-time pitch/weather analysis
- Simplified zone detection
- Limited to available data

## Future Enhancements

1. **Deep Learning Models**
   - LSTM for sequence prediction
   - CNN for trajectory analysis
   - Ensemble methods

2. **Advanced Features**
   - Pitch condition analysis
   - Weather impact
   - Player fatigue modeling
   - Match situation context

3. **Real-Time Learning**
   - Update models during match
   - Adaptive predictions
   - Player form tracking

## License

Part of the PlayPal project.
