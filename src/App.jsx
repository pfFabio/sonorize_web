import React, { useState } from "react";
import "./App.css";

import HomeScreen from "./screens/Home";
import RecordScreen from "./screens/RecordScreen";
import TranscriptScreen from "./screens/TranscriptScreen";
import SettingsScreen from "./screens/SettingsScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

const AUTH_SCREENS = ["Login", "Register"];

function isAuthenticated() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return !!user?.token;
  } catch {
    return false;
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = useState({ name: "Login", params: {} });

  const navigateTo = (screenName, params = {}) => {
    if (!AUTH_SCREENS.includes(screenName) && !isAuthenticated()) {
      setCurrentScreen({ name: "Login", params: {} });
      return;
    }
    setCurrentScreen({ name: screenName, params });
  };

  const renderScreen = () => {
    switch (currentScreen.name) {
      case "Login":
        return <LoginScreen navigateTo={navigateTo} />;
      case "Register":
        return <RegisterScreen navigateTo={navigateTo} />;
      case "Gravação":
        return <RecordScreen />;
      case "Transcrição":
        return <TranscriptScreen route={{ params: currentScreen.params }} />;
      case "Configurações":
        return <SettingsScreen />;
      case "Home":
      default:
        return <HomeScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">{renderScreen()}</main>
      {!AUTH_SCREENS.includes(currentScreen.name) && (
        <nav className="app-nav">
          <button onClick={() => navigateTo("Home")}>Home</button>
          <button onClick={() => navigateTo("Configurações")}>Configurações</button>
        </nav>
      )}
    </div>
  );
}

export default App;
