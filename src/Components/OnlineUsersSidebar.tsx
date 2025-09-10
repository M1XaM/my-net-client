// OnlineUsersSidebar.tsx
import React from 'react';

interface User {
  id: number;
  username: string;
}

interface OnlineUsersSidebarProps {
  users: User[];
  selectedUser: User | null;
  currentUser: User | null;
  onSelectUser: (user: User) => void;
}

const OnlineUsersSidebar: React.FC<OnlineUsersSidebarProps> = ({
  users,
  selectedUser,
  currentUser,
  onSelectUser
}) => {
  return (
    <div className="w-1/4 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Online Users</h3>
      </div>
      <div className="overflow-y-auto flex-1">
        {users.map(u => (
          <div 
            key={u.id} 
            className={`p-3 border-b border-gray-100 cursor-pointer transition ${selectedUser?.id === u.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => onSelectUser(u)}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium text-gray-800">
                {u.username}
                {u.id === currentUser?.id && ' (You)'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsersSidebar;