/**
 * External Email Indicator Component
 * Shows visual indicators for emails that came from external sources (personal accounts)
 */

import React from 'react';
import { ExternalLink, UserCheck, ArrowUpRight, ArrowDownLeft, Monitor } from 'lucide-react';

const ExternalEmailIndicator = ({ email, size = 'default' }) => {
  if (!email.isExternalEmail) {
    return null;
  }

  const sizeClasses = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const iconSize = sizeClasses[size] || sizeClasses.default;

  const getDirectionIcon = () => {
    switch (email.emailDirection) {
      case 'inbound':
        return <ArrowDownLeft className={`${iconSize} text-blue-600`} />;
      case 'outbound':
        return <ArrowUpRight className={`${iconSize} text-green-600`} />;
      default:
        return <Monitor className={`${iconSize} text-gray-600`} />;
    }
  };

  const getTooltipText = () => {
    const direction = email.emailDirection === 'inbound' ? 'received from' : 'sent to';
    const source = email.externalSource || 'external account';
    return `External email ${direction} ${source}`;
  };

  return (
    <div className="flex items-center gap-1" title={getTooltipText()}>
      {getDirectionIcon()}
      <ExternalLink className={`${iconSize} text-gray-500`} />
      {size !== 'small' && (
        <span className="text-xs text-gray-500 font-medium">
          {email.externalSource?.toUpperCase() || 'EXT'}
        </span>
      )}
    </div>
  );
};

export default ExternalEmailIndicator;