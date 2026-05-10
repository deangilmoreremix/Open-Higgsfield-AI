import React, { useState } from 'react';

const Personalizer = ({ onTokenChosen }) => {
  const TOKENS = [
    'FIRSTNAME',
    'LASTNAME',
    'EMAIL',
    'GEOCOUNTRY',
    'GEOCITY',
    'GEOSTATE',
    'NAME',
    'GENDER',
    'CUSTOM',
  ];

  const TOKEN_MODE = {
    PLAIN: 'PLAIN',
    FALLBACK: 'FALLBACK',
    UPPERCASE: 'UPPERCASE',
  };

  const [currentToken, setCurrentToken] = useState(TOKENS[0]);
  const [tokenMode, setTokenMode] = useState(TOKEN_MODE.PLAIN);
  const [fallbackValue, setFallbackValue] = useState('');
  const [customTokenValue, setCustomTokenValue] = useState('CUSTOM');

  const onTokenChange = (token) => {
    setCurrentToken(token);
    setTokenMode(TOKEN_MODE.PLAIN);
    setFallbackValue('');
    setCustomTokenValue('CUSTOM');
  };

  const onCustomTokenChange = (e) => {
    const searchValue = /\s|!|"|#|%|&|'|\(|\)|\*|\+|,|\.|\/|;|:|<|=|>|@|\[|\\|]|\^|ˆ|`|{|\||}|-|\$|\?|~/g;
    const value = e.target.value ? e.target.value.toUpperCase().replace(searchValue, '') : '';
    setCustomTokenValue(value);
  };

  const buildToken = () => {
    const actualToken = currentToken !== 'CUSTOM' ? currentToken : customTokenValue;
    switch (tokenMode) {
      case TOKEN_MODE.FALLBACK:
        return `{{d ${actualToken} "${fallbackValue.replace(/'/g, '\\"')}"}}`;
      case TOKEN_MODE.UPPERCASE:
        return `{{up ${actualToken}}}`;
      case TOKEN_MODE.PLAIN:
        return `{{${actualToken}}}`;
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg" style={{ width: '600px', height: '300px' }}>
      <div className="flex gap-6 h-full">
        <ul className="token-list flex-1 space-y-2">
          {TOKENS.map((token, idx) => (
            <li 
              key={idx} 
              onClick={() => onTokenChange(token)}
              className={`cursor-pointer p-2 rounded flex items-center gap-2 ${token === currentToken ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
            >
              <span className={`w-3 h-3 rounded-full ${token === currentToken ? 'bg-red-500' : 'bg-gray-300'}`} />
              {token}
            </li>
          ))}
        </ul>
        
        <div className="w-px bg-gray-300" />
        
        <div className="setup-area flex-2 flex flex-col gap-4">
          <span className="text-lg font-semibold">
            {currentToken !== 'CUSTOM' ? (
              <span>{currentToken}</span>
            ) : (
              <input
                type="text"
                value={customTokenValue}
                onChange={onCustomTokenChange}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            )}
          </span>
          
          <div className="w-full h-px bg-gray-300" />
          
          <ul className="configuration-list space-y-2">
            <li>
              <span
                className={`cursor-pointer p-2 rounded flex items-center gap-2 ${tokenMode === TOKEN_MODE.PLAIN ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                onClick={() => setTokenMode(TOKEN_MODE.PLAIN)}
              >
                <span className={`w-3 h-3 rounded-full ${tokenMode === TOKEN_MODE.PLAIN ? 'bg-red-500' : 'bg-gray-300'}`} />
                plain
              </span>
            </li>
            <li>
              <span
                className={`cursor-pointer p-2 rounded flex items-center gap-2 ${tokenMode === TOKEN_MODE.FALLBACK ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                onClick={() => setTokenMode(TOKEN_MODE.FALLBACK)}
              >
                <span className={`w-3 h-3 rounded-full ${tokenMode === TOKEN_MODE.FALLBACK ? 'bg-red-500' : 'bg-gray-300'}`} />
                Fallback value:
                <input
                  type="text"
                  className="fallback-input border border-gray-300 rounded px-2 py-1 ml-2"
                  disabled={tokenMode !== TOKEN_MODE.FALLBACK}
                  value={fallbackValue}
                  onChange={e => setFallbackValue(e.target.value)}
                />
              </span>
            </li>
            <li>
              <span
                className={`cursor-pointer p-2 rounded flex items-center gap-2 ${tokenMode === TOKEN_MODE.UPPERCASE ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                onClick={() => setTokenMode(TOKEN_MODE.UPPERCASE)}
              >
                <span className={`w-3 h-3 rounded-full ${tokenMode === TOKEN_MODE.UPPERCASE ? 'bg-red-500' : 'bg-gray-300'}`} />
                UPPERCASE
              </span>
            </li>
          </ul>
          
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => onTokenChosen(buildToken())}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Personalizer;
