import React, { useState } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 backdrop-blur-xl bg-[#0a0a0f]/60 border-r border-white/[0.06] flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-5 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Messages</h3>
          <span className="text-xs bg-[#7B61FF]/20 text-[#7B61FF] px-2.5 py-1 rounded-full font-semibold border border-[#7B61FF]/20">
            {users.length} online
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-transparent transition-all" 
            placeholder="Search conversations..." 
          />
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto flex-1 px-3 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers.map(u => {
            const isSelf = u.id === currentUser?.id;
            const isSelected = selectedUser?.id === u.id;
            
            return (
              <div
                key={u.id}
                className={`
                  cursor-pointer select-none px-4 rounded-xl flex items-center gap-3 py-3 w-full transition-all mb-1
                  ${isSelected 
                    ? 'bg-[#7B61FF]/20 border border-[#7B61FF]/30' 
                    : 'hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]'
                  }
                `}
                onClick={() => onSelectUser(u)}
              >
                {/* Avatar */}
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-white
                  ${isSelected 
                    ? 'bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] shadow-lg shadow-[#7B61FF]/25' 
                    : 'bg-gradient-to-br from-[#7B61FF]/80 to-[#5B47CC]/80'
                  }
                `}>
                  {isSelf ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                  <span className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {isSelf ? "Saved Messages" : u.username}
                  </span>

                  {!isSelf && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="bg-green-500 rounded-full w-1.5 h-1.5 animate-pulse" />
                      <span className="text-[11px] text-gray-500">Online now</span>
                    </div>
                  )}
                  
                  {isSelf && (
                    <span className="text-[11px] text-gray-500">Your personal space</span>
                  )}
                </div>

                {/* Arrow indicator for selected */}
                {isSelected && (
                  <svg className="w-4 h-4 text-[#7B61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status */}
      <div className="border-t border-white/[0.06] px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersSidebar;
