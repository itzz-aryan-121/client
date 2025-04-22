import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Terminal.css';

function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'Welcome to Aryan Tomar\'s Terminal Portfolio!', type: 'system' },
    { text: 'Type "help" to see available commands.', type: 'system' }
  ]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRocket, setShowRocket] = useState(false);
  const [autoShowPortfolio, setAutoShowPortfolio] = useState(false);
  const [portfolioSection, setPortfolioSection] = useState(0);
  const [showTechProfile, setShowTechProfile] = useState(false);
  const bottomRef = useRef(null);
  const rocketRef = useRef(null);

  const portfolioSections = [
    'about',
    'skills',
    'education',
    'experience',
    'projects',
    'activities',
    'contact'
  ];

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await axios.get('/api/resume');
        setResumeData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load resume data');
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when history changes
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);


  useEffect(() => {
    let portfolioInterval;
    
    if (autoShowPortfolio && resumeData) {
      
      const initialDelay = setTimeout(() => {
        setShowTechProfile(true);
        
        // Add profile introduction
        setHistory(prev => [
          ...prev, 
          { text: '--- INITIATING PROFILE SCAN ---', type: 'system-highlight' },
          { text: 'Loading agent profile data...', type: 'system-scan' }
        ]);
        
        // Start the portfolio section display with random intervals
        portfolioInterval = setInterval(() => {
          setPortfolioSection(prevSection => {
            if (prevSection >= portfolioSections.length) {
              clearInterval(portfolioInterval);
              setHistory(prev => [
                ...prev,
                { text: '--- PROFILE SCAN COMPLETE ---', type: 'system-highlight' },
                { text: 'Type any command to continue...', type: 'system' }
              ]);
              setAutoShowPortfolio(false);
              return prevSection;
            }
            
            const command = portfolioSections[prevSection];
            const result = executeCommand(command);
            
            setHistory(prev => [
              ...prev,
              { text: `$ ${command}`, type: 'command-auto' },
              ...result
            ]);
            
            return prevSection + 1;
          });
        }, Math.floor(Math.random() * 4000) + 5000); // Random interval between 5-9 seconds
      }, 3000); // 3 seconds initial delay after rocket animation
      
      return () => {
        clearTimeout(initialDelay);
        clearInterval(portfolioInterval);
      };
    }
  }, [autoShowPortfolio, resumeData]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const executeCommand = (cmd) => {
    if (!resumeData && cmd !== 'clear' && cmd !== 'start' && cmd !== 'help') {
      return [
        { text: `${cmd}: Command not executed - Resume data is loading...`, type: 'error' }
      ];
    }

    const command = cmd.trim().toLowerCase();
    const parts = command.split(' ');
    const mainCommand = parts[0];
    const args = parts.slice(1);

    switch (mainCommand) {
      case 'help':
        return [
          { text: 'Available commands:', type: 'system' },
          { text: 'start        - Launch interactive portfolio showcase with animations', type: 'system-highlight' },
          { text: 'about        - Display basic information about me', type: 'system' },
          { text: 'skills       - List my technical skills', type: 'system' },
          { text: 'education    - Show my educational background', type: 'system' },
          { text: 'experience   - Display my work experience', type: 'system' },
          { text: 'projects     - Show my projects', type: 'system' },
          { text: 'activities   - List my extracurricular activities', type: 'system' },
          { text: 'contact      - Show my contact information', type: 'system' },
          { text: 'clear        - Clear the terminal', type: 'system' },
          { text: 'cat [file]   - View specific section in detail (e.g., cat projects)', type: 'system' },
          { text: 'ls           - List all sections available', type: 'system' },
          { text: 'exit         - "Exit" the terminal (just for fun)', type: 'system' }
        ];
      case 'start':
        setShowRocket(true);
        // Set timeout to hide rocket and start auto portfolio after animation completes
        setTimeout(() => {
          setShowRocket(false);
          setAutoShowPortfolio(true);
        }, 4000); // Rocket animation duration
        
        return [
          { text: 'Initiating launch sequence...', type: 'system-highlight' },
          { text: '3...', type: 'system-countdown' },
          { text: '2...', type: 'system-countdown' },
          { text: '1...', type: 'system-countdown' },
          { text: 'LIFTOFF!', type: 'system-liftoff' }
        ];
      case 'about':
        return [
          { text: `Name: ${resumeData.personal.name}`, type: 'output' },
          { text: `Location: ${resumeData.personal.location}`, type: 'output' },
          { text: `Objective: ${resumeData.objective}`, type: 'output' }
        ];
      case 'skills':
        return [
          { text: 'Technical Skills:', type: 'output' },
          { text: resumeData.skills.technical.join(', '), type: 'output' },
          { text: 'Databases:', type: 'output' },
          { text: resumeData.skills.databases.join(', '), type: 'output' },
          { text: 'Tools:', type: 'output' },
          { text: resumeData.skills.tools.join(', '), type: 'output' }
        ];
      case 'education':
        return resumeData.education.map(edu => ({
          text: `${edu.degree} - ${edu.institution} (${edu.duration})`,
          type: 'output'
        }));
      case 'experience':
        return resumeData.experience.flatMap(exp => [
          { text: `${exp.title} at ${exp.company}, ${exp.location}`, type: 'output' },
          { text: `Duration: ${exp.duration}`, type: 'output' },
          { text: 'Responsibilities:', type: 'output' },
          ...exp.responsibilities.map(resp => ({ text: `- ${resp}`, type: 'output' })),
          { text: '', type: 'output' }
        ]);
      case 'projects':
        return resumeData.projects.flatMap(project => [
          { text: `${project.name} ${project.isLive ? '(Live Project)' : ''}`, type: 'output' },
          { text: `- ${project.description}`, type: 'output' },
          { text: '', type: 'output' }
        ]);
      case 'activities':
        return resumeData.activities.map(activity => ({
          text: `- ${activity}`,
          type: 'output'
        }));
      case 'contact':
        return [
          { text: `Email: ${resumeData.personal.email}`, type: 'output' },
          { text: `Phone: ${resumeData.personal.phone}`, type: 'output' },
          { text: `LinkedIn: ${resumeData.personal.linkedin}`, type: 'output' },
          { text: `Portfolio: ${resumeData.personal.portfolio}`, type: 'output' }
        ];
      case 'clear':
        return 'clear';
      case 'ls':
        return [
          { text: 'about       education   experience', type: 'output' },
          { text: 'skills      projects    activities', type: 'output' },
          { text: 'contact', type: 'output' }
        ];
      case 'cat':
        if (args.length === 0) {
          return [{ text: 'Usage: cat [section]', type: 'error' }];
        }
        const section = args[0].toLowerCase();
        switch (section) {
          case 'about':
            return executeCommand('about');
          case 'skills':
            return executeCommand('skills');
          case 'education':
            return executeCommand('education');
          case 'experience':
            return executeCommand('experience');
          case 'projects':
            return executeCommand('projects');
          case 'activities':
            return executeCommand('activities');
          case 'contact':
            return executeCommand('contact');
          default:
            return [{ text: `File not found: ${section}`, type: 'error' }];
        }
      case 'exit':
        return [
          { text: 'Thank you for visiting my terminal portfolio!', type: 'system' },
          { text: '(This is just for fun, you can continue using the terminal)', type: 'system' }
        ];
      case '':
        return [];
      default:
        return [
          { text: `Command not found: ${command}`, type: 'error' },
          { text: 'Type "help" to see available commands.', type: 'system' }
        ];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Stop auto-showcase if user enters a command
    if (autoShowPortfolio) {
      setAutoShowPortfolio(false);
    }
    
    const newHistoryItem = { text: `$ ${input}`, type: 'command' };
    const result = executeCommand(input);
    
    if (result === 'clear') {
      setHistory([]);
      setShowTechProfile(false);
    } else {
      setHistory(prev => [...prev, newHistoryItem, ...result]);
    }
    
    setInput('');
  };

  const renderRocketAnimation = () => {
    return (
      <div className="rocket-animation" ref={rocketRef}>
        <div className="rocket">
          <div className="rocket-body">
            <div className="window"></div>
          </div>
          <div className="rocket-engine">
            <div className="fire-base">
              <div className="fire-center"></div>
            </div>
          </div>
          <div className="rocket-fins">
            <div className="fin-left"></div>
            <div className="fin-right"></div>
          </div>
          <div className="rocket-shadow"></div>
        </div>
        <div className="stars">
          {Array(20).fill().map((_, i) => (
            <div key={i} className="star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}></div>
          ))}
        </div>
      </div>
    );
  };

  const renderTechProfile = () => {
    if (!showTechProfile || !resumeData) return null;
    
    return (
      <div className="tech-profile">
        <div className="profile-photo">
          {/* Placeholder for profile photo - replace with actual photo URL */}
          <div className="photo-frame">
            <div className="photo-placeholder">
              <span>{resumeData.personal.name.split(' ')[0][0]}{resumeData.personal.name.split(' ')[1][0]}</span>
            </div>
          </div>
          <div className="scan-line"></div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">AGENT ID:</span>
            <span className="stat-value">DEV-{Math.floor(Math.random() * 9000) + 1000}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">STATUS:</span>
            <span className="stat-value active">ACTIVE</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">CLEARANCE:</span>
            <span className="stat-value">LEVEL 5</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SPECIALIZATION:</span>
            <span className="stat-value">FULL STACK DEVELOPMENT</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <div className="terminal-button red"></div>
            <div className="terminal-button yellow"></div>
            <div className="terminal-button green"></div>
          </div>
          <div className="terminal-title">aryan@portfolio:~</div>
        </div>
        <div className="terminal-body">
          <p className="loading-text">
            <span className="loading-spinner"></span>
            Loading portfolio data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <div className="terminal-button red"></div>
            <div className="terminal-button yellow"></div>
            <div className="terminal-button green"></div>
          </div>
          <div className="terminal-title">aryan@portfolio:~</div>
        </div>
        <div className="terminal-body">
          <p className="error-text">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <div className="terminal-button red"></div>
          <div className="terminal-button yellow"></div>
          <div className="terminal-button green"></div>
        </div>
        <div className="terminal-title">aryan@portfolio:~</div>
      </div>
      <div className="terminal-body">
        {showRocket && renderRocketAnimation()}
        {renderTechProfile()}
        {history.map((item, index) => (
          <div key={index} className={`terminal-line ${item.type}`}>
            {item.text}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="terminal-prompt">aryan@portfolio:~$</span>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            autoFocus
            className="terminal-input"
            spellCheck="false"
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default App;