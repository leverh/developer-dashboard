import React from 'react';

const ProfileEnhancements = () => {
  const skills = [
    { name: 'React', level: 'Advanced', category: 'Frontend' },
    { name: 'CSS Grid', level: 'Advanced', category: 'Styling' },
    { name: 'JavaScript', level: 'Advanced', category: 'Language' },
    { name: 'GitHub API', level: 'Intermediate', category: 'Integration' },
    { name: 'Responsive Design', level: 'Advanced', category: 'Design' },
    { name: 'Python', level: 'Intermediate', category: 'Backend' },
    { name: 'REST APIs', level: 'Intermediate', category: 'Integration' },
    { name: 'Git', level: 'Advanced', category: 'Tools' }
  ];

  const contactLinks = [
    { 
      platform: 'Portfolio', 
      url: 'https://pixelsummit.dev', 
      icon: '🌐',
      label: 'View Work'
    },
    { 
      platform: 'LinkedIn', 
      url: 'https://linkedin.com/in/pixel-summit-947220349', 
      icon: '💼',
      label: 'Connect'
    },
    { 
      platform: 'Email', 
      url: 'mailto:contact@pixelsummit.dev', 
      icon: '📧',
      label: 'Get in Touch'
    },
    { 
      platform: 'GitHub', 
      url: 'https://github.com/leverh', 
      icon: '🐙',
      label: 'View Code'
    }
  ];

  return (
    <div className="profile-enhancements">
      {/* Skills Section */}
      <div className="skills-section">
        <h3 className="section-title">
          <span className="title-icon">⚡</span>
          Technologies & Skills
        </h3>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div 
              key={skill.name} 
              className="skill-tag"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="skill-name">{skill.name}</span>
              <span className="skill-level">{skill.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h3 className="section-title">
          <span className="title-icon">🤝</span>
          Let's Connect
        </h3>
        <div className="contact-links">
          {contactLinks.map((link, index) => (
            <a 
              key={link.platform}
              href={link.url}
              className="contact-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <span className="contact-icon">{link.icon}</span>
              <div className="contact-content">
                <span className="contact-platform">{link.platform}</span>
                <span className="contact-label">{link.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhancements;