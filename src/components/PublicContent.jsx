import AboutTab from './public/AboutTab';
import FacultyTab from './public/FacultyTab';
import ResearchTab from './public/ResearchTab';
import ProjectsTab from './public/ProjectsTab';
import DocumentsTab from './public/PublicTab';
import TermsTab from './public/TermsTab';
import PrivacyTab from './public/PrivacyTab';

export default function PublicContent({ currentView, onBack }) {
    switch (currentView) {
        case 'about':
            return <AboutTab onBack={onBack} />;
        case 'faculty':
            return <FacultyTab onBack={onBack} />;
        case 'research':
            return <ResearchTab onBack={onBack} />;
        case 'projects_info':
            return <ProjectsTab onBack={onBack} />;
        case 'public_documents':
            return <PublicTab onBack={onBack} />;
        case 'terms':
            return <TermsTab onBack={onBack} />;
        case 'privacy':
            return <PrivacyTab onBack={onBack} />;
        default:
            return null;
    }
}