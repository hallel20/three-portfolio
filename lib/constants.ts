import { Code, Filter, GitBranch, Server, Smartphone } from "lucide-react";

export const categoryColors = {
  'web-development': '#3B82F6',
  'mobile-app': '#10B981', 
  'backend-api': '#EF4444',
  'open-source': '#8B5CF6',
};

export const categoryLabels = {
  'web-development': 'Web Development',
  'mobile-app': 'Mobile App',
  'backend-api': 'Backend/API',
  'open-source': 'Open Source',
};

export const categories = [
    { 
      key: 'all', 
      label: 'All Projects', 
      icon: Filter,
      color: 'from-blue-500 to-purple-500',
      count: 12 
    },
    { 
      key: 'web-development', 
      label: categoryLabels['web-development'], 
      icon: Code,
      color: 'from-green-500 to-teal-500',
      count: 5 
    },
    { 
      key: 'mobile-app', 
      label: categoryLabels['mobile-app'], 
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      count: 3 
    },
    { 
      key: 'backend-api', 
      label: categoryLabels['backend-api'], 
      icon: Server,
      color: 'from-orange-500 to-red-500',
      count: 2 
    },
    { 
      key: 'open-source', 
      label: categoryLabels['open-source'], 
      icon: GitBranch,
      color: 'from-cyan-500 to-blue-500',
      count: 2 
    },
  ];