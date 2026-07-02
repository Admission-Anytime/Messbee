import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutomationLanding from './AutomationLanding';
import AutomationDashboard from './AutomationDashboard';
import TriggerSelectionModal from './components/Modals/TriggerSelectionModal';
import CreateAutomationModal from './components/Modals/CreateAutomationModal';
import AssignChannelsModal from './components/Modals/AssignChannelsModal';
import TestAutomationModal from './components/Modals/TestAutomationModal';
import WelcomeMessageSettings from './WelcomeMessageSettings';
import AwayMessageSettings from './AwayMessageSettings';
import FallbackMessageSettings from './FallbackMessageSettings';
import api from '../../context/axios';

const Automation = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('landing');
    const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState('');
    const [currentAutomationId, setCurrentAutomationId] = useState(null);
    const [nodesCount, setNodesCount] = useState(0);

    const handleCreateAutomation = () => {
        setIsTriggerModalOpen(true);
    };

    const handleTriggerSelect = (trigger) => {
        setIsTriggerModalOpen(false);
        setIsCreateModalOpen(true);
    };

    const handleCreateFlow = async (data) => {
        if (!data || !data.name.trim()) return;
        setIsCreateModalOpen(false);
        navigate('/admin/automation/new', { state: { flowName: data.name, triggerType: data.triggerType } }); // Connect to existing AutomationBuilder route
    };

    const renderView = () => {
        switch (currentView) {
            case 'landing':
                return (
                    <AutomationLanding
                        onNavigateFlows={() => setCurrentView('flows')}
                        onCreateAutomation={() => setIsTriggerModalOpen(true)}
                        onCreatePreconfigured={() => setIsAssignModalOpen(true)}
                        onNavigateWelcomeMessage={() => setCurrentView('welcome-message')}
                        onNavigateAwayMessage={() => setCurrentView('away-message')}
                        onNavigateFallbackMessage={() => setCurrentView('fallback-message')}
                    />
                );
            case 'flows':
                return (
                    <AutomationDashboard
                        onCreateAutomation={() => setIsTriggerModalOpen(true)}
                        onEditAutomation={(automation) => navigate(`/admin/automation/${automation._id}`)}
                        onTestFlow={(id) => {
                            setCurrentAutomationId(id);
                            setIsTestModalOpen(true);
                        }}
                    />
                );
            case 'welcome-message':
                return <WelcomeMessageSettings onBack={() => setCurrentView('landing')} />;
            case 'away-message':
                return <AwayMessageSettings onBack={() => setCurrentView('landing')} />;
            case 'fallback-message':
                return <FallbackMessageSettings onBack={() => setCurrentView('landing')} />;
            default:
                return <AutomationLanding />;
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* If we're not in the canvas, render the selected view */}
            <div style={{ flex: 1, padding: currentView === 'landing' ? '0' : '24px' }}>
                {renderView()}
            </div>

            {/* Modals */}
            {isTriggerModalOpen && (
                <TriggerSelectionModal 
                    onClose={() => setIsTriggerModalOpen(false)}
                    onSelectTrigger={handleTriggerSelect}
                />
            )}

            {isCreateModalOpen && (
                <CreateAutomationModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateFlow}
                />
            )}

            {isAssignModalOpen && (
                <AssignChannelsModal
                    onClose={() => setIsAssignModalOpen(false)}
                />
            )}

            {isTestModalOpen && (
                <TestAutomationModal
                    onClose={() => setIsTestModalOpen(false)}
                    automationId={currentAutomationId}
                />
            )}
        </div>
    );
};

export default Automation;