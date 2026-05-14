/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Layout } from './components/Layout';
import { CodexScreen } from './components/CodexScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { syncUser } from './lib/db';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('codex');
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      syncUser(user);
    }
  }, [user]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'codex' ? <CodexScreen /> : <ExploreScreen />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
