# LLM Instruction: Create Jira Ticket Modal

## Overview
Create a sophisticated ticket creation modal for a Jira time tracking application using React, TypeScript, Ant Design components, and Tailwind CSS. The modal should have a clean, modern design with dynamic tag-based field selection.

## Core Requirements

### 1. Modal Structure
- **Backdrop**: Semi-transparent gray overlay (`bg-gray-500 bg-opacity-40`)
- **Container**: White rounded modal (`rounded-3xl`) with `shadow-2xl`, `max-w-2xl`
- **Layout**: Three sections - header, form body, footer tip

### 2. Header Design (Subtle)
- **Background**: White with light gray border-bottom (`border-gray-100`)
- **Icon**: Small gray icon (`w-8 h-8`, `bg-gray-100`, `rounded-lg`) with Plus icon
- **Title**: "Create New Ticket" (`text-lg`, `font-medium`, `text-gray-900`)
- **Subtitle**: Show hostname from credentials endpoint (`text-sm`, `text-gray-500`)
- **Close Button**: Gray X icon with hover states (`hover:text-gray-600`, `hover:bg-gray-100`)

### 3. Form Fields

#### Required Fields:
- **Summary**: Text input with placeholder "Brief description of the issue"
- **Description**: TextArea (4 rows) with placeholder "Detailed description of the issue"

#### Dynamic Tag-Based Fields:
Create a tag system where users can add/remove fields dynamically:

**Available Tags:**
- Project (Folder icon) - Default: "WQLegend"
- Issue Type (FileText icon) - Options: Story, Task, Bug, Epic
- Reporter (User icon) - User dropdown
- Assignee (User icon) - User dropdown  
- Priority (Flag icon) - Options: Critical, High, Medium, Low
- Components (Folder icon) - Multi-select
- Sprint (Calendar icon) - Sprint dropdown

### 4. Tag Component Behavior

#### Visual States:
- **Unselected**: Gray background (`bg-gray-100`), gray text, gray border (`border-gray-200`)
- **Selected with value**: Blue background (`bg-blue-100`), blue text (`text-blue-700`), blue border (`border-blue-200`)
- **Hover**: Darker gray background (`hover:bg-gray-200`)

#### Interaction (Single-Click):
- Use Ant Design Select component positioned invisibly over custom-styled tag
- Select should be absolutely positioned, invisible, covering the entire tag area
- Handle dropdown open/close states with visual chevron rotation
- Support search/filter functionality through Ant Design's built-in features

#### Tag Structure:
```jsx
<div className="relative">
  <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-full...">
    {icon}
    <span>{displayValue}</span>
    <div className="flex items-center space-x-1">
      <Select 
        className="invisible absolute inset-0 w-full h-full cursor-pointer"
        // Ant Design Select props
      />
      <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      <X className="w-3 h-3" onClick={onRemove} />
    </div>
  </div>
</div>
```

### 5. Footer Layout
- **Left Side**: Project tag (if selected)
- **Right Side**: Cancel and "Create Ticket" buttons
- **Styling**: Border-top separator (`border-t border-gray-100`), space-between layout

### 6. Footer Tip Section
- **Background**: Light gray (`bg-gray-50`)
- **Content**: FileText icon + "Tip: Your field selections will be saved as defaults for next time"
- **Styling**: Small text (`text-sm`), gray colors (`text-gray-600`)

### 7. Data Management

#### Mock Data Structure:
```typescript
const mockProjects = [
  { value: 'WQLegend', label: 'WQLegend' },
  { value: 'PROJ', label: 'Project Alpha' },
  { value: 'BETA', label: 'Project Beta' },
  { value: 'GAMMA', label: 'Project Gamma' },
];

const issueTypes = [
  { value: 'Story', label: 'Story' },
  { value: 'Task', label: 'Task' },
  { value: 'Bug', label: 'Bug' },
  { value: 'Epic', label: 'Epic' },
];

const priorities = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const mockUsers = [
  { value: 'john.doe', label: 'John Doe' },
  { value: 'jane.smith', label: 'Jane Smith' },
  { value: 'alice.johnson', label: 'Alice Johnson' },
];

const mockComponents = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'api', label: 'API' },
  { value: 'database', label: 'Database' },
];

const mockSprints = [
  { value: 'sprint-1', label: 'Sprint 1' },
  { value: 'sprint-2', label: 'Sprint 2' },
  { value: 'sprint-3', label: 'Sprint 3' },
];
```

#### State Management:
- `selectedTags`: Array of active tag keys
- `tagValues`: Object mapping tag keys to selected values
- Form state managed by Ant Design Form component

#### Local Storage:
- Save form values as defaults on successful submission
- Load saved defaults when modal opens
- Key: 'jira-ticket-defaults'

### 8. Ant Design Integration

#### Required Components:
- `Select` (with search, single/multiple modes)
- `Input` and `TextArea`
- `Button` (with loading states)
- `Form` (with validation)
- `message` (for success/error notifications)

#### Custom Styling:
```css
.ant-select-selector {
  border-radius: 12px !important;
  border-color: #e5e7eb !important;
}

.ant-select-focused .ant-select-selector {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.ant-input {
  border-radius: 12px !important;
  border-color: #e5e7eb !important;
}

.ant-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.ant-btn-primary {
  border-radius: 12px !important;
}

.ant-form-item-label > label {
  font-weight: 500 !important;
}
```

### 9. TypeScript Interfaces

```typescript
interface CreateTicketData {
  project: string;
  issueType: string;
  summary: string;
  description: string;
  reporter?: string;
  assignee?: string;
  priority?: string;
  components?: string[];
  sprint?: string;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: CreateTicketData) => void;
  credentials: JiraCredentials;
}

interface TagComponentProps {
  tag: string;
  label: string;
  icon: React.ReactNode;
  value?: any;
  options: { value: string; label: string }[];
  onSelect: (value: any) => void;
  onRemove: () => void;
  multiple?: boolean;
}
```

### 10. Key Features

#### Single-Click Dropdown:
- No double-click required
- Ant Design Select handles all dropdown logic
- Custom styling maintains visual design
- Search functionality built-in

#### Smart Defaults:
- Project defaults to "WQLegend"
- Previously selected values restored from localStorage
- Form remembers user preferences

#### Responsive Design:
- Works on mobile and desktop
- Proper spacing and touch targets
- Flexible tag wrapping

#### Validation:
- Required field validation for Summary and Description
- Form submission with loading states
- Success/error message handling

### 11. Component Architecture

#### Main Modal Component:
```typescript
export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  credentials 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagValues, setTagValues] = useState<Record<string, any>>({});
  
  // Implementation...
}
```

#### Tag Component:
```typescript
const TagComponent: React.FC<TagComponentProps> = ({ 
  tag, 
  label, 
  icon, 
  value, 
  options, 
  onSelect, 
  onRemove, 
  multiple = false 
}) => {
  // Implementation with Ant Design Select overlay...
}
```

### 12. Implementation Notes

1. **Use Ant Design Select extensively** - Don't create custom dropdowns
2. **Position Select invisibly** over styled tags for single-click behavior
3. **Maintain visual consistency** with the rest of the application
4. **Handle edge cases** like empty states, loading states, and errors
5. **Ensure accessibility** through proper ARIA labels and keyboard navigation
6. **Test thoroughly** on different screen sizes and interaction patterns

### 13. Styling Guidelines

#### Colors:
- Primary: Blue gradient (`from-blue-500 to-indigo-500`)
- Gray scale: Use Tailwind's gray palette
- Success: Green tones for form submission
- Error: Red tones for validation errors

#### Spacing:
- Use consistent spacing scale (4, 6, 8 units)
- Proper padding and margins for touch targets
- Adequate white space for readability

#### Typography:
- Font weights: medium for labels, semibold for headings
- Text sizes: sm for hints, base for content, lg for titles
- Proper line heights for readability

### 14. Accessibility Requirements

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management for modal interactions
- Color contrast compliance

### 15. Performance Considerations

- Lazy loading of dropdown options if needed
- Debounced search functionality
- Efficient re-rendering with proper React keys
- Memory cleanup on component unmount

This modal should feel native to the Jira ecosystem while providing a modern, efficient user experience for ticket creation with seamless Ant Design integration and single-click interactions.
