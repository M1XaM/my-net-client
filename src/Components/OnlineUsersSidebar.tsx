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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="border-b border-gray-200 px-7 py-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">Messages</h3>
          <span className="text-sm bg-[#EDF2F7] px-3 py-1 rounded-full font-semibold text-gray-700">{users.length}</span>
        </div>
      </div>

      <div className="px-4 py-3 flex-shrink-0">
        <input 
          type="text" 
          className="w-full border-none outline-none rounded-lg bg-[#F3F3F3] px-4 py-2 text-sm" 
          placeholder="Search users" 
        />
      </div>

      <div className="overflow-y-auto flex-1 px-4">
        {users.map(u => {
          const isSelf = u.id === currentUser?.id;
          
          return (
            <div
              key={u.id}
              className={`cursor-pointer select-none px-4 rounded-lg flex items-center gap-4 py-3 w-full ${
                selectedUser?.id === u.id ? 'bg-[#615EF02F]' : 'hover:bg-[#615EF010]'
              } transition-colors mb-1`}
              onClick={() => onSelectUser(u)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] text-white flex-shrink-0">
                {isSelf ? (
                  // Saved messages icon
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 4C5.44772 4 5 4.44772 5 5V20L12 16L19 20V5C19 4.44772 18.5523 4 18 4H6Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  u.username.charAt(0).toUpperCase()
                )}
              </div>

              {/* Username + status */}
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="font-bold text-[15px] text-gray-900">
                  {isSelf ? "Saved Messages" : u.username}
                </span>

                {!isSelf && (
                  <div className="flex items-center gap-1">
                    <div className="bg-green-400 rounded-full w-2 h-2"></div>
                    <span className="text-[12px] text-gray-500 font-semibold">Online</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsersSidebar;
