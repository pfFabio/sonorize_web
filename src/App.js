import React, { useState } from 'react';
import './App.css';

// Importando os componentes que criamos
import HomeScreen from './screens/Home';
import RecordScreen from './screens/RecordScreen';
import TranscriptScreen from './screens/TranscriptScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

function App() {
  // Estado para controlar a tela atual e seus parâmetros
  const [currentScreen, setCurrentScreen] = useState({ name: 'Login', params: {} });

  // Função para "navegar" entre as telas
  const navigateTo = (screenName, params = {}) => {
    setCurrentScreen({ name: screenName, params });
  };

  // Função para renderizar a tela correta
  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'Login':
        return <LoginScreen navigateTo={navigateTo} />;
      case 'Gravação':
        // A tela de gravação não precisa de parâmetros especiais por enquanto
        return <RecordScreen />;
      case 'Transcrição':
        // Passamos os parâmetros para a tela de transcrição
        return <TranscriptScreen route={{ params: currentScreen.params }} />;
      case 'Configurações':
        return <SettingsScreen />;
      case 'Home':
      default:
        // Passamos a função de navegação para a Home
        return <HomeScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">
        {renderScreen()}
      </main>
      {currentScreen.name !== 'Login' && (
        <nav className="app-nav">
          <button onClick={() => navigateTo('Home')}>Home</button>
          <button onClick={() => navigateTo('Configurações')}>Configurações</button>
        </nav>
      )}
    </div>
  );
}

export default App;
