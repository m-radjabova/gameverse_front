import React from 'react';
import type { FieldValues } from 'react-hook-form';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: FieldValues) => void;
    children?: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

const UseModal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    children, 
    title, 
    size = 'md',
    showCloseButton = true 
}) => {
    if (!isOpen) return null;
    
    // Animation styles
    const modalStyle = {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
    };

    const contentStyle = {
        background: '#fff',
        padding: '0',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        position: 'relative' as const,
        animation: 'slideUp 0.3s ease-out',
        overflow: 'hidden',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column' as const,
        width: getWidthBySize(size),
    };

    function getWidthBySize(size: string) {
        switch (size) {
            case 'sm': return '400px';
            case 'md': return '500px';
            case 'lg': return '600px';
            case 'xl': return '800px';
            default: return '500px';
        }
    }

    return (
        <div
            style={modalStyle}
            onClick={onClose}
            className="modal-overlay"
        >
            <div
                style={contentStyle}
                onClick={e => e.stopPropagation()}
                className="modal-content"
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div style={headerStyle}>
                        {title && <h2 style={titleStyle}>{title}</h2>}
                        {showCloseButton && (
                            <button
                                style={closeButtonStyle}
                                onClick={onClose}
                                aria-label="Close"
                                className="modal-close-btn"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path 
                                        d="M18 6L6 18M6 6l12 12" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div style={bodyStyle}>
                    {children}
                </div>
            </div>
        </div>
    );
};

const headerStyle = {
    padding: '24px 24px 0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
};

const titleStyle = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a202c',
    lineHeight: 1.3,
};

const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '1.25rem',
    fontWeight: 'normal',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    marginLeft: '16px',
};

const bodyStyle = {
    padding: '0 24px 24px 24px',
    overflowY: 'auto' as const,
    flex: 1,
};

export default UseModal;