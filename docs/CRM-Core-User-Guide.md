# CRM Core Module - User Guide
# SalesTracker Application

## Table of Contents
1. [Getting Started](#getting-started)
2. [Managing Contacts](#managing-contacts)
3. [Managing Companies](#managing-companies)
4. [Deal Pipeline Management](#deal-pipeline-management)
5. [Activity Tracking](#activity-tracking)
6. [Data Export](#data-export)
7. [Tips & Best Practices](#tips-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 1. Getting Started

### 1.1 Accessing CRM Core
1. Log into SalesTracker
2. Click on **"CRM Core"** in the left sidebar (Database icon)
3. You'll see four main tabs: Contacts, Companies, Deals, and Activities

### 1.2 Understanding the Dashboard
When you first open CRM Core, you'll see:
- **Statistics Cards**: Total Value, Won Deals, Active Contacts, Pending Tasks
- **Navigation Tabs**: Switch between different sections
- **Action Buttons**: Export data and perform bulk actions

### 1.3 Quick Navigation
- Use keyboard shortcut **Cmd/Ctrl + K** to open voice assistant
- Say "CRM", "Contacts", "Companies", "Deals", or "Activities" to navigate

---

## 2. Managing Contacts

### 2.1 Adding a New Contact

#### Step-by-Step Process:
1. Click the **"Contacts"** tab
2. Click the **"+ Add Contact"** button (top right)
3. Fill in the form:
   - **Name*** (Required): Contact's full name
   - **Email*** (Required): Valid email address
   - **Phone**: Contact number (optional)
   - **Title**: Job title (optional)
   - **Company**: Select existing or type new company name
   - **Status**: Active, Inactive, Lead, or Customer
   - **Tags**: Add relevant tags for categorization
   - **Address**: Physical address (optional)
   - **Notes**: Any additional information
4. Click **"Add Contact"** to save

#### Pro Tips:
- Use tags like "VIP", "Decision Maker", "Technical Contact"
- Link contacts to companies for better organization
- Add notes about preferences or important details

### 2.2 Viewing and Editing Contacts

#### To View Contact Details:
1. Click on any contact card in the list
2. A detailed view will open showing:
   - Basic information
   - Contact information
   - Activity history
   - Related company

#### To Edit Contact:
1. Open contact details
2. Click the **Edit** icon (pencil)
3. Modify any fields
4. Click **"Save"** to confirm changes

### 2.3 Searching and Filtering Contacts

#### Search Options:
- **Search Bar**: Type name or email to find contacts quickly
- **Filter Button**: Advanced filtering options
- **Tag Filter**: Click on tags to filter by category

#### Bulk Operations:
1. Select multiple contacts using checkboxes
2. Use bulk actions menu to:
   - Delete selected contacts
   - Export selected contacts
   - (Future: Bulk tag assignment)

### 2.4 Contact Activities

#### Adding Activities to Contacts:
1. Open contact details
2. Click **"+ Add Activity"**
3. Choose activity type:
   - Note: General notes
   - Call: Phone conversations
   - Email: Email interactions
   - Meeting: In-person or virtual meetings
   - Task: Action items
4. Fill in subject and description
5. Click **"Add"**

---

## 3. Managing Companies

### 3.1 Adding a New Company

#### Step-by-Step Process:
1. Click the **"Companies"** tab
2. Click **"+ Add Company"** button
3. Complete the form:
   - **Company Name*** (Required)
   - **Industry**: Select from dropdown
   - **Website**: Company URL
   - **Phone**: Main contact number
   - **Email**: General company email
   - **Employees**: Select range (1-10, 11-50, etc.)
   - **Annual Revenue**: Estimated revenue in USD
   - **Status**: Prospect, Customer, Partner, Vendor, Inactive
   - **Address**: Company headquarters
   - **Description**: Brief company overview
4. Click **"Add Company"**

### 3.2 Company Intelligence

#### Company Profile Includes:
- **Revenue Tracking**: Annual revenue estimates
- **Employee Count**: Company size indicator
- **Deal Count**: Number of associated deals
- **Contact Count**: Employees/contacts at company
- **Last Contact Date**: Most recent interaction

#### Related Information:
- **Contacts Tab**: All employees/contacts
- **Deals Tab**: All opportunities with this company
- **Activity Timeline**: Historical interactions

### 3.3 Industry Filtering

Use the industry dropdown to filter companies by:
- Technology
- Healthcare
- Finance
- Retail
- Manufacturing
- Education
- Real Estate
- And more...

---

## 4. Deal Pipeline Management

### 4.1 Understanding the Pipeline

The deal pipeline consists of 6 stages:

1. **Prospecting** (20% probability)
   - Initial opportunities
   - Early-stage discussions
   
2. **Qualification** (40% probability)
   - Needs assessment complete
   - Budget confirmed
   
3. **Proposal** (60% probability)
   - Proposal submitted
   - Pricing discussed
   
4. **Negotiation** (80% probability)
   - Terms being finalized
   - Close to agreement
   
5. **Closed Won** (100% probability)
   - Deal successfully closed
   - Contract signed
   
6. **Closed Lost** (0% probability)
   - Opportunity lost
   - Record reason for loss

### 4.2 Creating a New Deal

#### Step-by-Step Process:
1. Click **"Deals"** tab
2. Click **"+ Add Deal"** button
3. Fill in deal information:
   - **Deal Name***: Descriptive title
   - **Company***: Select associated company
   - **Primary Contact**: Choose main contact
   - **Deal Value***: Amount in USD
   - **Expected Close Date**: Target date
   - **Stage**: Current pipeline stage
   - **Probability**: Win likelihood (auto-fills based on stage)
   - **Assigned To**: Deal owner
   - **Description**: Deal details
   - **Notes**: Internal notes
4. Click **"Add Deal"**

### 4.3 Managing Deals

#### Moving Deals Between Stages:
1. **Drag and Drop**: Click and drag deal cards between stages
2. **Automatic Updates**: Probability updates based on new stage
3. **Activity Logging**: Add notes about stage changes

#### Updating Deal Information:
1. Click on any deal card
2. Click **Edit** icon
3. Update fields as needed
4. Save changes

### 4.4 Pipeline Analytics

Monitor your pipeline health:
- **Total Pipeline Value**: Sum of all active deals
- **Stage Distribution**: Value breakdown by stage
- **Win Rate**: Percentage of won vs. lost deals
- **Average Deal Size**: Typical deal value

---

## 5. Activity Tracking

### 5.1 Activity Types

#### Available Activities:
- **Call**: Phone conversations
  - Log call duration
  - Note key discussion points
  
- **Email**: Email communications
  - Track email subjects
  - Summary of content
  
- **Meeting**: In-person/virtual meetings
  - Meeting agenda
  - Attendees and outcomes
  
- **Task**: Action items
  - Due dates
  - Assignment to team members
  
- **Note**: General observations
  - Quick thoughts
  - Important information

### 5.2 Creating Activities

#### Quick Add Activity:
1. Click **"Activities"** tab
2. Click **"+ Add Activity"**
3. Select activity type
4. Enter details:
   - **Subject**: Brief description
   - **Description**: Detailed notes
   - **Due Date**: For tasks and follow-ups
5. Click **"Create Activity"**

#### Adding Activities to Specific Records:
- From Contact Detail: Activities appear in timeline
- From Deal Detail: Track deal-specific activities
- From Company Detail: Log company-wide activities

### 5.3 Managing Activities

#### Filtering Activities:
- **By Type**: Show only calls, emails, etc.
- **By Status**: Pending or Completed
- **By Date**: Today, This Week, This Month, All Time

#### Completing Activities:
1. Find the activity in the list
2. Click **"Mark Complete"**
3. Activity moves to completed status

### 5.4 Activity Best Practices

1. **Log Immediately**: Record activities right after they happen
2. **Be Detailed**: Include outcomes and next steps
3. **Set Follow-ups**: Create task activities for future actions
4. **Link Properly**: Associate activities with correct contacts/deals

---

## 6. Data Export

### 6.1 Export Options

#### What You Can Export:
- **Contacts**: All contact information
- **Companies**: Company profiles and metrics
- **Deals**: Pipeline data and deal details
- **Activities**: Activity logs and task lists

### 6.2 How to Export

#### Standard Export:
1. Navigate to desired tab (Contacts, Companies, etc.)
2. Apply any filters you want
3. Click **"Export"** button
4. File downloads as CSV with current date

#### Export Contents:
- **Contacts Export Includes**:
  - Name, Email, Phone
  - Title, Company
  - Status, Tags
  - Address, Notes
  - Created/Updated dates

- **Companies Export Includes**:
  - Company Name, Industry
  - Website, Contact Info
  - Employee Count, Revenue
  - Status, Description
  - Timestamps

- **Deals Export Includes**:
  - Deal Name, Company
  - Value, Stage, Probability
  - Close Date, Assignee
  - Description, Notes
  - Timestamps

### 6.3 Using Exported Data

#### Common Use Cases:
- Import into Excel for analysis
- Email marketing campaigns
- Backup/archive purposes
- Share with team members
- Create custom reports

---

## 7. Tips & Best Practices

### 7.1 Data Hygiene

1. **Regular Updates**: Review and update records monthly
2. **Complete Profiles**: Fill in all available fields
3. **Consistent Naming**: Use standard formats for companies
4. **Tag Strategy**: Create consistent tag taxonomy
5. **Duplicate Check**: Avoid creating duplicate records

### 7.2 Workflow Optimization

#### Daily Routine:
1. **Morning**: Review pending activities
2. **Throughout Day**: Log activities in real-time
3. **End of Day**: Update deal stages, plan tomorrow

#### Weekly Tasks:
1. **Pipeline Review**: Check all deals for accuracy
2. **Contact Cleanup**: Remove inactive contacts
3. **Activity Analysis**: Review team activity levels
4. **Export Backup**: Weekly data export

### 7.3 Team Collaboration

1. **Standardize Status**: Agree on status definitions
2. **Tag Conventions**: Document tag meanings
3. **Deal Stages**: Clear criteria for each stage
4. **Activity Logging**: Set expectations for detail level

### 7.4 Power User Tips

#### Keyboard Shortcuts:
- **Escape**: Close modals
- **Enter**: Submit forms
- **Tab**: Navigate form fields

#### Search Tips:
- Search by email domain: "@company.com"
- Use tags for quick filtering
- Combine filters for precise results

#### Pipeline Management:
- Review stuck deals weekly
- Update probabilities based on reality
- Log reasons for lost deals
- Celebrate wins with the team

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: Cannot create contact
**Solution**: Ensure Name and Email are filled (required fields)

#### Issue: Drag and drop not working
**Solution**: 
- Refresh the page
- Check browser compatibility
- Ensure JavaScript is enabled

#### Issue: Export not downloading
**Solution**:
- Check browser download settings
- Try different browser
- Ensure pop-ups aren't blocked

#### Issue: Data not saving
**Solution**:
- Check internet connection
- Look for validation errors
- Try logging out and back in

### 8.2 Data Recovery

#### If you accidentally delete:
1. Deleted data cannot be recovered currently
2. Always confirm before bulk deletions
3. Regular exports serve as backups

### 8.3 Performance Issues

#### If CRM is running slowly:
1. Clear browser cache
2. Close unnecessary tabs
3. Check internet speed
4. Try different browser

### 8.4 Getting Help

#### Support Channels:
1. Click Help icon in app
2. Check documentation
3. Contact your administrator
4. Submit support ticket

---

## Quick Reference Card

### Essential Actions:
- **Add Contact**: Contacts tab → + Add Contact
- **Add Company**: Companies tab → + Add Company  
- **Create Deal**: Deals tab → + Add Deal
- **Log Activity**: Activities tab → + Add Activity
- **Export Data**: Any tab → Export button

### Status Definitions:
- **Contact Status**:
  - Active: Currently engaged
  - Inactive: No recent activity
  - Lead: Potential customer
  - Customer: Existing customer

- **Company Status**:
  - Prospect: Potential customer
  - Customer: Active customer
  - Partner: Business partner
  - Vendor: Supplier
  - Inactive: No longer engaged

- **Deal Stages**:
  - Prospecting: 20% win probability
  - Qualification: 40% win probability
  - Proposal: 60% win probability
  - Negotiation: 80% win probability
  - Closed Won: 100% - Success!
  - Closed Lost: 0% - Learn and move on

---

**Remember**: The CRM is only as good as the data you put in. Keep it updated, accurate, and complete for best results!

**Happy Selling!** 🚀