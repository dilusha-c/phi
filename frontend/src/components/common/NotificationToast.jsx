import useNotification from '../../hooks/useNotification';

const typeStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
};

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto rounded-2xl border p-4 shadow-soft backdrop-blur ${typeStyles[notification.type] || typeStyles.info}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {notification.title ? (
                <p className="text-sm font-semibold">{notification.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-6">{notification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide text-current opacity-70 transition hover:opacity-100"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
