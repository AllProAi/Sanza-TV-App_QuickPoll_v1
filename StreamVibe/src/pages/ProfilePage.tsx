import React from 'react';
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

const ProfileSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #E50914;
`;

const ProfileCard = styled.div`
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  max-width: 800px;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const UserDetail = styled.p`
  color: #aaa;
  margin-bottom: 0.5rem;
`;

const Button = styled.button`
  background-color: #E50914;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  margin-right: 1rem;
  cursor: pointer;
  &:hover, &:focus {
    background-color: #F40612;
    outline: 3px solid #fff;
  }
`;

const WatchHistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
`;

const HistoryItem = styled.div`
  background-color: #1f1f1f;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  &:focus, &:hover {
    transform: scale(1.05);
    outline: 3px solid #fff;
  }
`;

const ItemImage = styled.div`
  background-color: #333;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemTitle = styled.h4`
  padding: 1rem;
  font-size: 1rem;
`;

interface ProgressBarProps {
  progressPercent: string;
}

const ProgressBar = styled.div<ProgressBarProps>`
  height: 4px;
  background-color: #333;
  margin: 0 1rem 1rem 1rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progressPercent};
    background-color: #E50914;
  }
`;

const ProfilePage: React.FC = () => {
  // Placeholder watch history items
  const watchHistoryItems = Array(6).fill(null).map((_, i) => (
    <HistoryItem key={i} tabIndex={0}>
      <ItemImage>Content {i + 1}</ItemImage>
      <ItemTitle>Watched Content {i + 1}</ItemTitle>
      <ProgressBar progressPercent={`${(i + 2) * 10}%`} />
    </HistoryItem>
  ));

  return (
    <PageContainer>
      <Title>My Profile</Title>
      
      <ProfileSection>
        <ProfileCard>
          <ProfileRow>
            <Avatar>JD</Avatar>
            <UserInfo>
              <UserName>John Doe</UserName>
              <UserDetail>john.doe@example.com</UserDetail>
              <UserDetail>Premium Member</UserDetail>
              <div style={{ marginTop: '1rem' }}>
                <Button autoFocus>Edit Profile</Button>
                <Button>Change Password</Button>
              </div>
            </UserInfo>
          </ProfileRow>
        </ProfileCard>
      </ProfileSection>
      
      <ProfileSection>
        <SectionTitle>Continue Watching</SectionTitle>
        <WatchHistoryGrid>
          {watchHistoryItems}
        </WatchHistoryGrid>
      </ProfileSection>
      
      <ProfileSection>
        <SectionTitle>My List</SectionTitle>
        <WatchHistoryGrid>
          {watchHistoryItems.slice(0, 4)}
        </WatchHistoryGrid>
      </ProfileSection>
    </PageContainer>
  );
};

export default ProfilePage; 