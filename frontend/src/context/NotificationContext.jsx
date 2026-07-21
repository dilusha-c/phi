import { createContext, useCallback, useMemo, useState } from 'react';

export const NotificationContext = createContext(null);

const normalizeNotification = (notification) => ({
  id: crypto.randomUUID(),
  type: notification.type || 'info',
  title: notification.title || '',
  message: notification.message || '',
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const pushNotification = useCallback((notification) => {
    const nextNotification = normalizeNotification(notification);
    setNotifications((current) => [...current, nextNotification]);
    window.setTimeout(() => removeNotification(nextNotification.id), 3500);
  }, [removeNotification]);

  const value = useMemo(
    () => ({ notifications, pushNotification, removeNotification }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
