export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert data to CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle arrays and objects
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }).join('\n');

  const csv = `${csvHeaders}\n${csvRows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(link.href);
};

export const exportContactsToCSV = (contacts) => {
  const exportData = contacts.map(contact => ({
    Name: contact.name,
    Email: contact.email || '',
    Phone: contact.phone || '',
    Title: contact.title || '',
    Company: contact.company || '',
    Status: contact.status || 'active',
    Tags: contact.tags ? contact.tags.join('; ') : '',
    Address: contact.address || '',
    Notes: contact.notes || '',
    CreatedAt: new Date(contact.createdAt).toLocaleDateString(),
    UpdatedAt: new Date(contact.updatedAt).toLocaleDateString()
  }));
  
  exportToCSV(exportData, 'contacts');
};

export const exportCompaniesToCSV = (companies) => {
  const exportData = companies.map(company => ({
    Name: company.name,
    Industry: company.industry || '',
    Website: company.website || '',
    Phone: company.phone || '',
    Email: company.email || '',
    Employees: company.employees || '',
    Revenue: company.revenue || '',
    Status: company.status || 'prospect',
    Address: company.address || '',
    Description: company.description || '',
    CreatedAt: new Date(company.createdAt).toLocaleDateString(),
    UpdatedAt: new Date(company.updatedAt).toLocaleDateString()
  }));
  
  exportToCSV(exportData, 'companies');
};

export const exportDealsToCSV = (deals, dealStages) => {
  const exportData = deals.map(deal => {
    const stage = dealStages.find(s => s.id === deal.stage);
    return {
      Name: deal.name,
      Company: deal.company || '',
      Value: deal.value || 0,
      Stage: stage ? stage.name : deal.stage,
      Probability: `${deal.probability}%`,
      ExpectedCloseDate: deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : '',
      Assignee: deal.assignee || '',
      Description: deal.description || '',
      Notes: deal.notes || '',
      CreatedAt: new Date(deal.createdAt).toLocaleDateString(),
      UpdatedAt: new Date(deal.updatedAt).toLocaleDateString()
    };
  });
  
  exportToCSV(exportData, 'deals');
};

export const exportActivitiesToCSV = (activities) => {
  const exportData = activities.map(activity => ({
    Type: activity.type,
    Subject: activity.subject || '',
    Description: activity.description || '',
    Status: activity.completed ? 'Completed' : 'Pending',
    DueDate: activity.dueDate ? new Date(activity.dueDate).toLocaleString() : '',
    CompletedAt: activity.completedAt ? new Date(activity.completedAt).toLocaleString() : '',
    Assignee: activity.assignee || '',
    RelatedTo: activity.entityType ? `${activity.entityType} #${activity.entityId}` : '',
    CreatedAt: new Date(activity.createdAt).toLocaleDateString(),
    UpdatedAt: new Date(activity.updatedAt).toLocaleDateString()
  }));
  
  exportToCSV(exportData, 'activities');
};