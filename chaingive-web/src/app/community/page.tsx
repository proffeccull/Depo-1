import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Components
import CommunityFeed from '../../components/CommunityFeed';
import EventManager from '../../components/EventManager';
import ProtectedRoute from '../../components/ProtectedRoute';

// Styles
import styles from './community.module.css';

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'events'>('feed');

  const tabs = [
    { id: 'feed', label: 'Community Feed', icon: 'users' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ];

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Community</h1>
            <p className={styles.subtitle}>
              Connect with your community and discover local events
            </p>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className={styles.tabNavigation}>
          <div className={styles.tabContainer}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? styles.tabButtonActive : ''
                }`}
                onClick={() => setActiveTab(tab.id as 'feed' | 'events')}
              >
                <span className={styles.tabIcon}>
                  {tab.icon === 'users' ? '👥' : '📅'}
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className={styles.main}>
          {activeTab === 'feed' && <CommunityFeed />}
          {activeTab === 'events' && <EventManager />}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CommunityPage;