import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --primary-color: #6200ee;
    --secondary-color: #03dac6;
    --background-color: #121212;
    --surface-color: #1e1e1e;
    --on-surface-color: #ffffff;
    --error-color: #cf6679;
    --focus-color: #bb86fc;
    --text-primary: rgba(255, 255, 255, 0.87);
    --text-secondary: rgba(255, 255, 255, 0.6);
    --spacing-unit: 8px;
  }

  html, body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--background-color);
    color: var(--text-primary);
    width: 100%;
    height: 100%;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    position: relative;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  
  button:focus, a:focus, [tabindex]:focus {
    outline: 2px solid var(--focus-color);
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

export default GlobalStyles; 