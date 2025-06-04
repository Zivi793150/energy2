import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Не авторизован');
        }

        console.log('Запрос на получение пользователей:', `${config.apiUrl}/admin/users`);
        const response = await axios.get(`${config.apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Полученные пользователи:', response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const response = await axios.put(
        `${config.apiUrl}/admin/change-role`,
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновляем пользователя в списке
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));

      alert('Роль пользователя успешно изменена');
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="admin-loading">Загрузка списка пользователей...</div>;
  }

  if (error) {
    return <div className="admin-error">Ошибка: {error}</div>;
  }

  return (
    <div className="user-management">
      <h1>Управление пользователями</h1>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Роль</th>
              <th>Подтвержден</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td className={`role-${user.role}`}>{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                <td>{user.isVerified ? 'Да' : 'Нет'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement; 