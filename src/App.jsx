import React, { useState } from "react";
import "./App.css";

const phpReservedWords = new Set([
  "abstract", "and", "array", "as", "break", "callable", "case", "catch",
  "class", "clone", "const", "continue", "declare", "default", "do", "echo",
  "else", "elseif", "empty", "enddeclare", "endfor", "endforeach", "endif",
  "endswitch", "endwhile", "eval", "exit", "extends", "final", "finally", "fn",
  "for", "foreach", "function", "global", "goto", "if", "implements", "include",
  "include_once", "instanceof", "insteadof", "interface", "isset", "list",
  "match", "namespace", "new", "or", "print", "private", "protected", "public",
  "readonly", "require", "require_once", "return", "static", "switch", "throw",
  "trait", "try", "unset", "use", "var", "while", "xor", "yield"
]);

const commonSymbols = new Set([
  "(", ")", "{", "}", "[", "]", ";", ",", ".", "+", "-", "*", "/", "=", "<",
  ">", "<=", ">=", "==", "!=", "++", "--", "?", ":", "$", "<?php", "?>","!","¡"
]);

function tokenize(code) {
  const regex = /(<\?php|\?>|\$\w+|\d+|<=|>=|==|!=|\+\+|--|\w+|\S)/g;
  const tokens = code.match(regex) || [];

  const reservedWords = new Set();
  const identifiers = new Set();
  const symbols = new Set();
  const numbers = new Set();
  const errors = [];

  tokens.forEach((token) => {
    if (phpReservedWords.has(token)) {
      reservedWords.add(token);
    } else if (/^\d+$/.test(token)) {
      numbers.add(token);
    } else if (commonSymbols.has(token)) {
      symbols.add(token);
    } else if (/^\$\w+$/.test(token)) {
      identifiers.add(token);
    } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      const likelyError = [...phpReservedWords].find(
        (word) => levenshtein(word, token) === 1
      );
      if (likelyError) {
        errors.push(`'${token}' es un error, ¿quizás quisiste decir '${likelyError}'?`);
      }
      identifiers.add(token);
    } else {
      errors.push(`Token no reconocido: '${token}'`);
    }
  });

  return {
    reservedWords: [...reservedWords],
    identifiers: [...identifiers],
    symbols: [...symbols],
    numbers: [...numbers],
    errors,
    totalTokens: tokens.length,
  };
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

function App() {
  const [code, setCode] = useState(`<?php
function sumar($a, $b) {
  return $a + $b;
}
?>`);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    const analysis = tokenize(code);
    setResult(analysis);
  };

  return (
    <div className="container">
      <h1>Analizador Léxico PHP</h1>
      <textarea
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Escribe tu código PHP aquí..."
      ></textarea>
      <button onClick={handleAnalyze}>Analizar</button>

      {result && (
        <div className="results">
          <h2>Resultados</h2>
          <p><strong>Palabras reservadas:</strong> {result.reservedWords.join(", ") || "Ninguna"}</p>
          <p><strong>Identificadores:</strong> {result.identifiers.join(", ") || "Ninguno"}</p>
          <p><strong>Símbolos:</strong> {result.symbols.join(", ") || "Ninguno"}</p>
          <p><strong>Números:</strong> {result.numbers.join(", ") || "Ninguno"}</p>
          <p><strong>Total de tokens:</strong> {result.totalTokens}</p>
          {result.errors.length > 0 && (
            <div className="errors">
              <h3>Errores encontrados:</h3>
              <ul>
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;