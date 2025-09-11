import { GameProvider } from './GameContext'
import SolarSystemMap from './SolarSystemMap'

function App() {
  return (
    <GameProvider>
      <SolarSystemMap />
    </GameProvider>
  )
}

export default App
