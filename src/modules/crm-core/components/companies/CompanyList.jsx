import React, { useState } from 'react';
import { Search, Filter, Plus, Users, Globe, Phone, TrendingUp } from 'lucide-react';
import useCRMStore from '../../stores/crmStore';
import CompanyForm from './CompanyForm';
import CompanyDetail from './CompanyDetail';

export default function CompanyList() {
  const { 
    getFilteredCompanies, 
    setSelectedCompany, 
    companyFilters, 
    setCompanyFilters,
    selectedCompany 
  } = useCRMStore();

  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const companies = getFilteredCompanies();

  const formatRevenue = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
          <button 
            onClick={() => setShowCompanyForm(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={companyFilters.search}
              onChange={(e) => setCompanyFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={companyFilters.industry}
            onChange={(e) => setCompanyFilters({ industry: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Industries</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="retail">Retail</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="other">Other</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {companies.map((company) => (
          <div
            key={company.id}
            onClick={() => {
              setSelectedCompany(company);
              setShowCompanyDetail(true);
            }}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedCompany?.id === company.id ? 'bg-teal-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry || 'Industry not specified'}</p>
                  
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    {company.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {company.website}
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {company.phone}
                      </div>
                    )}
                    {company.employees && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {company.employees} employees
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Revenue: {formatRevenue(company.revenue)}
                      </span>
                    </div>
                    {company.deals && (
                      <span className="text-sm text-gray-500">
                        {company.deals} active deals
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  company.status === 'customer' 
                    ? 'bg-green-100 text-green-800' 
                    : company.status === 'prospect'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {company.status || 'Prospect'}
                </span>
                {company.lastContact && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last contact: {new Date(company.lastContact).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No companies found</p>
        </div>
      )}
      
      {showCompanyForm && (
        <CompanyForm onClose={() => setShowCompanyForm(false)} />
      )}
      
      {showCompanyDetail && (
        <CompanyDetail onClose={() => setShowCompanyDetail(false)} />
      )}
    </div>
  );
}