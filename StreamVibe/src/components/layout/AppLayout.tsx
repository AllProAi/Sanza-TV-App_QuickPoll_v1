import React from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { NavigationProvider } from '../../context/NavigationContext';

interface AppLayoutProps {
  children: ReactNode;
  initialFocus?: string;
}

const LayoutContainer = styled.div`
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  overflow: hidden;
`;

const AppLayout: React.FC<AppLayoutProps> = ({ children, initialFocus }) => {
  return (
    <NavigationProvider initialFocus={initialFocus}>
      <LayoutContainer>
        <ContentArea>
          {children}
        </ContentArea>
      </LayoutContainer>
    </NavigationProvider>
  );
};

export default AppLayout; 