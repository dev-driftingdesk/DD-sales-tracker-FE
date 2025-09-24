import React, { useMemo } from 'react';
import { Building2, Users } from 'lucide-react';
import CanvasView from '../shared/CanvasView';
import useCRMStore from '../../stores/crmStore';

export default function ContactCanvas({ contacts, onContactClick }) {
  const { companies } = useCRMStore();

  // Create nodes and edges for visualization
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const companyMap = {};

    // Create company nodes
    companies.forEach((company, index) => {
      const node = {
        id: `company-${company.id}`,
        label: company.name,
        type: 'company',
        data: company,
        color: '#0891B2', // Cyan for companies
        size: 40
      };
      nodes.push(node);
      companyMap[company.name] = node.id;
    });

    // Create contact nodes and edges
    contacts.forEach((contact, index) => {
      const node = {
        id: `contact-${contact.id}`,
        label: contact.name,
        type: 'contact',
        data: contact,
        color: '#0D9488', // Teal for contacts
        size: 30
      };
      nodes.push(node);

      // Create edge to company if exists
      if (contact.company && companyMap[contact.company]) {
        edges.push({
          source: node.id,
          target: companyMap[contact.company],
          type: 'solid'
        });
      }
    });

    // Add edges between contacts in same company
    const contactsByCompany = {};
    contacts.forEach(contact => {
      if (contact.company) {
        if (!contactsByCompany[contact.company]) {
          contactsByCompany[contact.company] = [];
        }
        contactsByCompany[contact.company].push(contact);
      }
    });

    Object.values(contactsByCompany).forEach(companyContacts => {
      if (companyContacts.length > 1) {
        for (let i = 0; i < companyContacts.length - 1; i++) {
          for (let j = i + 1; j < companyContacts.length; j++) {
            edges.push({
              source: `contact-${companyContacts[i].id}`,
              target: `contact-${companyContacts[j].id}`,
              type: 'dashed'
            });
          }
        }
      }
    });

    return { nodes, edges };
  }, [contacts, companies]);

  const handleNodeClick = (node) => {
    if (node.type === 'contact') {
      onContactClick(node.data);
    }
  };

  const renderNode = (node) => {
    const isCompany = node.type === 'company';
    const Icon = isCompany ? Building2 : Users;
    
    return (
      <div 
        className={`
          p-2 bg-white rounded-lg shadow-md border-2 cursor-pointer
          hover:shadow-lg transition-shadow
          ${isCompany ? 'border-cyan-500' : 'border-teal-500'}
        `}
        style={{ minWidth: '120px' }}
      >
        <div className="flex items-center gap-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${isCompany ? 'bg-cyan-100' : 'bg-teal-100'}
          `}>
            <Icon className={`w-4 h-4 ${isCompany ? 'text-cyan-600' : 'text-teal-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {node.label}
            </p>
            {node.type === 'contact' && node.data.title && (
              <p className="text-xs text-gray-500 truncate">{node.data.title}</p>
            )}
            {node.type === 'company' && node.data.industry && (
              <p className="text-xs text-gray-500 truncate">{node.data.industry}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">Contact Network</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            Contacts
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            Companies
          </div>
          <div className="flex items-center gap-1">
            <div className="w-16 h-0.5 bg-gray-300"></div>
            Relationships
          </div>
        </div>
      </div>
      
      <CanvasView
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        renderNode={renderNode}
        height="500px"
      />
    </div>
  );
}