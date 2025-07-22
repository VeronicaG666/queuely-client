// src/components/UserRow.jsx
import React from 'react';

const UserRow = ({ user, onUpdate }) => {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.status}</td>
      <td>{new Date(user.joined_at).toLocaleTimeString()}</td>
      <td>
        {user.status === 'waiting' && (
          <>
            <button onClick={() => onUpdate(user.id, 'served')}>Serve</button>
            <button onClick={() => onUpdate(user.id, 'skipped')}>Skip</button>
          </>
        )}
      </td>
    </tr>
  );
};

export default UserRow;
