import React, { useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: #121212;
  color: #ffffff;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
`;

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  max-width: 1200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 1.5rem;
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

interface NavButtonProps {
  active?: boolean;
}

const NavButton = styled.button<NavButtonProps>`
  background-color: ${props => props.active ? '#333' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#aaa'};
  padding: 1rem;
  border: none;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover, &:focus {
    background-color: #333;
    color: #fff;
    outline: ${props => props.active ? 'none' : '2px solid #fff'};
  }
`;

const ContentArea = styled.div`
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #E50914;
`;

const SettingGroup = styled.div`
  margin-bottom: 2rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const SettingDescription = styled.p`
  margin-bottom: 1rem;
  color: #aaa;
  font-size: 0.9rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #333;
    transition: .4s;
    border-radius: 34px;
  }

  span:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + span {
    background-color: #E50914;
  }

  input:focus + span {
    box-shadow: 0 0 1px #E50914;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SelectDropdown = styled.select`
  background-color: #333;
  color: #fff;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  width: 100%;
  max-width: 300px;

  &:focus {
    outline: 3px solid #fff;
  }
`;

const SaveButton = styled.button`
  background-color: #E50914;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover, &:focus {
    background-color: #F40612;
    outline: 3px solid #fff;
  }
`;

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <>
            <SectionTitle>General Settings</SectionTitle>
            <SettingGroup>
              <SettingItem>
                <SettingLabel htmlFor="language-select">Language</SettingLabel>
                <SettingDescription>Select your preferred language for the application</SettingDescription>
                <SelectDropdown 
                  id="language-select" 
                  name="language" 
                  defaultValue="en"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </SelectDropdown>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel htmlFor="autoplay-trailers">Autoplay Trailers</SettingLabel>
                <SettingDescription>Automatically play trailers when browsing content</SettingDescription>
                <ToggleSwitch htmlFor="autoplay-trailers">
                  <input 
                    type="checkbox" 
                    id="autoplay-trailers" 
                    name="autoplay-trailers" 
                    defaultChecked
                    aria-label="Toggle autoplay trailers" 
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>
            </SettingGroup>
            
            <SaveButton autoFocus aria-label="Save general settings">Save Changes</SaveButton>
          </>
        );
        
      case 'playback':
        return (
          <>
            <SectionTitle>Playback Settings</SectionTitle>
            <SettingGroup>
              <SettingItem>
                <SettingLabel htmlFor="quality-select">Default Quality</SettingLabel>
                <SettingDescription>Select your preferred video quality</SettingDescription>
                <SelectDropdown 
                  id="quality-select" 
                  name="quality" 
                  defaultValue="auto"
                  aria-label="Select video quality"
                >
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </SelectDropdown>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel htmlFor="autoplay-next">Auto-play Next Episode</SettingLabel>
                <SettingDescription>Automatically play the next episode in a series</SettingDescription>
                <ToggleSwitch htmlFor="autoplay-next">
                  <input 
                    type="checkbox" 
                    id="autoplay-next" 
                    name="autoplay-next" 
                    defaultChecked
                    aria-label="Toggle autoplay next episode" 
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>
            </SettingGroup>
            
            <SaveButton aria-label="Save playback settings">Save Changes</SaveButton>
          </>
        );
        
      case 'notifications':
        return (
          <>
            <SectionTitle>Notification Settings</SectionTitle>
            <SettingGroup>
              <SettingItem>
                <SettingLabel htmlFor="new-content-alerts">New Content Alerts</SettingLabel>
                <SettingDescription>Receive notifications when new content is added</SettingDescription>
                <ToggleSwitch htmlFor="new-content-alerts">
                  <input 
                    type="checkbox" 
                    id="new-content-alerts" 
                    name="new-content-alerts" 
                    defaultChecked
                    aria-label="Toggle new content alerts" 
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>
              
              <SettingItem>
                <SettingLabel htmlFor="recommendations">Recommendations</SettingLabel>
                <SettingDescription>Receive notifications for personalized recommendations</SettingDescription>
                <ToggleSwitch htmlFor="recommendations">
                  <input 
                    type="checkbox" 
                    id="recommendations" 
                    name="recommendations" 
                    defaultChecked
                    aria-label="Toggle recommendation notifications" 
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>
            </SettingGroup>
            
            <SaveButton aria-label="Save notification settings">Save Changes</SaveButton>
          </>
        );
        
      default:
        return <SectionTitle>Select a settings category</SectionTitle>;
    }
  };

  return (
    <PageContainer>
      <Title>Settings</Title>
      
      <SettingsLayout>
        <Sidebar>
          <SidebarNav aria-label="Settings navigation">
            <NavButton 
              active={activeSection === 'general'} 
              onClick={() => setActiveSection('general')}
              autoFocus={activeSection === 'general'}
              aria-pressed={activeSection === 'general'}
              aria-label="General settings"
            >
              General
            </NavButton>
            <NavButton 
              active={activeSection === 'playback'} 
              onClick={() => setActiveSection('playback')}
              autoFocus={activeSection === 'playback'}
              aria-pressed={activeSection === 'playback'}
              aria-label="Playback settings"
            >
              Playback
            </NavButton>
            <NavButton 
              active={activeSection === 'notifications'} 
              onClick={() => setActiveSection('notifications')}
              autoFocus={activeSection === 'notifications'}
              aria-pressed={activeSection === 'notifications'}
              aria-label="Notification settings"
            >
              Notifications
            </NavButton>
            <NavButton 
              active={activeSection === 'account'} 
              onClick={() => setActiveSection('account')}
              autoFocus={activeSection === 'account'}
              aria-pressed={activeSection === 'account'}
              aria-label="Account settings"
            >
              Account
            </NavButton>
          </SidebarNav>
        </Sidebar>
        
        <ContentArea role="region" aria-label={`${activeSection} settings`}>
          {renderContent()}
        </ContentArea>
      </SettingsLayout>
    </PageContainer>
  );
};

export default SettingsPage; 