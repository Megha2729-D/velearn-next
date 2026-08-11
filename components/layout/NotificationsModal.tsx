"use client";

type Notification = {
    message: string;
    time: string;
    color?: string;
    unread?: boolean;
};

type NotificationsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    notifications?: Notification[];
};

const NotificationsModal = ({
    isOpen,
    onClose,
    notifications = [],
}: NotificationsModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="notifications_overlay"
            onClick={onClose}
        >
            <div
                className="notifications_container_lux"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="notifications_header_lux">
                    <h3>Notifications</h3>

                    <button
                        type="button"
                        className="btn_close_notif"
                        onClick={onClose}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Notifications */}
                <div className="notifications_list_lux">
                    {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                            <div
                                key={index}
                                className={`notif_item_lux ${notif.unread ? "unread" : ""
                                    }`}
                            >
                                <div
                                    className="notif_dot_lux"
                                    style={{
                                        backgroundColor:
                                            notif.color || "#24b8ec",
                                    }}
                                />

                                <div className="notif_content_lux">
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: notif.message,
                                        }}
                                    />

                                    <span>{notif.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="notif_empty_lux">
                            <i className="bi bi-bell-slash"></i>

                            <p>No new notifications</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="notif_footer_lux">
                    <button
                        type="button"
                        className="btn_notif_cancel"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="btn_notif_confirm"
                        onClick={() =>
                            console.log("Mark all read")
                        }
                    >
                        Mark All Read
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;