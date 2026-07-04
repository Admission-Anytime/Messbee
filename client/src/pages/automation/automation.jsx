import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AutomationLanding from './AutomationLanding';
import AutomationDashboard from './AutomationDashboard';
import TriggerSelectionModal from '../../components/Modol/automation/TriggerSelectionModal';
import CreateAutomationModal from '../../components/Modol/automation/CreateAutomationModal';
import AssignChannelsModal from '../../components/Modol/automation/AssignChannelsModal';
import TestAutomationModal from '../../components/Modol/automation/TestAutomationModal';
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
    const [flowDataToCreate, setFlowDataToCreate] = useState(null);

    const handleCreateAutomation = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateFlow = (data) => {
        if (!data || !data.name.trim()) return;
        setIsCreateModalOpen(false);
        setFlowDataToCreate(data);
        setIsTriggerModalOpen(true);
    };

    const handleTriggerSelect = (trigger) => {
        setIsTriggerModalOpen(false);
        navigate('/admin/automation/new', { state: { flowName: flowDataToCreate?.name || 'Untitled Automation', triggerType: trigger } });
    };

    const renderView = () => {
        switch (currentView) {
            case 'landing':
                return (
                    <AutomationLanding
                        onNavigateFlows={() => setCurrentView('flows')}
                        onCreateAutomation={handleCreateAutomation}
                        onCreatePreconfigured={() => setIsAssignModalOpen(true)}
                        onNavigateWelcomeMessage={() => setCurrentView('welcome-message')}
                        onNavigateAwayMessage={() => setCurrentView('away-message')}
                        onNavigateFallbackMessage={() => setCurrentView('fallback-message')}
                    />
                );
            case 'flows':
                return (
                    <AutomationDashboard
                        onCreateAutomation={handleCreateAutomation}
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