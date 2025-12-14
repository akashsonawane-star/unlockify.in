
import React, { useEffect } from 'react';
import { ViewState } from '../types';
import { FEATURES } from '../constants';

interface SEOManagerProps {
  view: ViewState;
}

export const SEOManager: React.FC<SEOManagerProps> = ({ view }) => {
  useEffect(() => {
    let title = "Unlockify.in - AI Marketing for Indian Business";
    let desc = "Generate Instagram captions, WhatsApp messages, and festival posts instantly with AI tailored for Indian small businesses.";

    if (view === 'dashboard') {
      title = "Dashboard | Unlockify.in";
    } else if (view === 'landing') {
      title = "Unlockify.in - Free AI Marketing Tool";
    } else if (view === 'profile') {
      title = "My Profile | Unlockify.in";
    } else if (view === 'subscription') {
      title = "Plans & Pricing | Unlockify.in";
    } else if (view === 'saved') {
      title = "My Library | Unlockify.in";
    } else {
      // Feature views
      const feature = FEATURES.find(f => f.id === view);
      if (feature) {
        title = `${feature.label} Generator | Unlockify.in`;
        desc = `Create professional ${feature.label} for your business instantly. AI-powered marketing tool for ${feature.label}.`;
      }
    }

    // Update Document Title
    document.title = title;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = "description";
      newMeta.content = desc;
      document.head.appendChild(newMeta);
    }

  }, [view]);

  return null; // This component renders nothing visually
};
