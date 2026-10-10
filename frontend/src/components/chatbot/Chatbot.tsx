import { useEffect, useRef, useState } from "react";
import {
    MessageCircle,
    X,
    Send,
    ClipboardList,
    Calendar,
    MapPin,
    Package,
    Bell,
    User,
    Recycle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface WasteRequest {
    id: string;
    requestId: string;
    wasteType: string;
    quantity: string | number;
    preferredDate?: string;
    scheduledDate?: string;
    address?: string;
    description?: string;
    status: string;
    adminResponse?: string;
    rejectionReason?: string;
}

interface Complaint {
    id: string;
    complaintId?: string;
    category?: string;
    description?: string;
    address?: string;
    status: string;
    adminResponse?: string;
    createdAt?: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type?: string;
    isRead: boolean;
    createdAt: string;
}

interface Profile {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: string;
}

interface RecyclingCategory {
    name: string;
    items: string;
    tip: string;
}

interface Message {
    sender: "user" | "bot";
    text?: string;
    type?:
        | "text"
        | "requests"
        | "complaints"
        | "notifications"
        | "profile"
        | "recycling";

    title?: string;

    requests?: WasteRequest[];
    complaints?: Complaint[];
    notifications?: Notification[];
    profile?: Profile;
    categories?: RecyclingCategory[];
    tip?: string;
}

const Chatbot = () => {
    const { token } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "bot",
            type: "text",
            text: "Hi! 👋 I'm EcoWaste Assistant. How can I help you?",
        },
    ]);

    useEffect(() => {
        if (!isOpen) return;

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const messageText = input.trim();

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                type: "text",
                text: messageText,
            },
        ]);

        setInput("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/chat",
                {
                    message: messageText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            // ==========================================
            // REQUESTS
            // ==========================================

            if (data.type === "requests") {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        type: "requests",
                        title: data.title || "My Waste Requests",
                        text:
                            data.message ||
                            "Here are your waste collection requests.",
                        requests: data.requests || [],
                    },
                ]);

                return;
            }

            // ==========================================
            // COMPLAINTS
            // ==========================================

            if (data.type === "complaints") {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        type: "complaints",
                        title: data.title || "My Complaints",
                        text:
                            data.message ||
                            "Here are your complaints.",
                        complaints: data.complaints || [],
                    },
                ]);

                return;
            }

            // ==========================================
            // NOTIFICATIONS
            // ==========================================

            if (data.type === "notifications") {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        type: "notifications",
                        title:
                            data.title || "My Notifications",
                        text:
                            data.message ||
                            "Here are your latest notifications.",
                        notifications:
                            data.notifications || [],
                    },
                ]);

                return;
            }

            // ==========================================
            // PROFILE
            // ==========================================

            if (data.type === "profile") {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        type: "profile",
                        title: data.title || "My Profile",
                        profile: data.profile || {},
                    },
                ]);

                return;
            }

            // ==========================================
            // RECYCLING
            // ==========================================

            if (data.type === "recycling") {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "bot",
                        type: "recycling",
                        title:
                            data.title ||
                            "EcoWaste Recycling Guide",
                        categories:
                            data.categories || [],
                        tip: data.tip,
                    },
                ]);

                return;
            }

            // ==========================================
            // NORMAL TEXT
            // ==========================================

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    type: "text",
                    text:
                        data.reply ||
                        "Sorry, I couldn't understand that.",
                },
            ]);
        } catch (error) {
            console.error("Chatbot error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    type: "text",
                    text:
                        "Sorry, I could not connect to the server. Please try again.",
                },
            ]);
        }
    };

    const getStatusClass = (status: string) => {
        const value = status?.toLowerCase();

        if (value === "completed") {
            return "bg-green-100 text-green-700";
        }

        if (value === "accepted") {
            return "bg-blue-100 text-blue-700";
        }

        if (value === "scheduled") {
            return "bg-purple-100 text-purple-700";
        }

        if (value === "collected") {
            return "bg-teal-100 text-teal-700";
        }

        if (
            value === "rejected" ||
            value === "cancelled"
        ) {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };

    const formatDate = (date?: string) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            {/* FLOATING BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700"
                aria-label="Open EcoWaste Assistant"
            >
                {isOpen ? (
                    <X size={26} />
                ) : (
                    <MessageCircle size={26} />
                )}
            </button>

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 flex h-[650px] max-h-[calc(100vh-120px)] w-[400px] max-w-[calc(100vw-32px)] min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                    {/* HEADER */}
                    <div className="bg-green-600 px-5 py-4 text-white">
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                                <MessageCircle size={24} />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    EcoWaste Assistant
                                </h2>

                                <p className="text-sm text-green-100">
                                    How can I help you?
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-gray-50 p-4">

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className={`flex ${
                                    message.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >

                                {/* TEXT */}
                                {message.type === "text" && (
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                            message.sender === "user"
                                                ? "bg-green-600 text-white"
                                                : "bg-white text-gray-800 shadow-sm"
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                )}

                                {/* REQUESTS */}
                                {message.type === "requests" && (
                                    <div className="w-full">

                                        <div className="mb-2 rounded-xl bg-white p-3 shadow-sm">

                                            <div className="flex items-center gap-2">
                                                <ClipboardList
                                                    size={18}
                                                    className="text-green-600"
                                                />

                                                <span className="font-semibold text-gray-800">
                                                    {message.title}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {message.text}
                                            </p>
                                        </div>

                                        <div className="space-y-3">

                                            {message.requests?.map(
                                                (request) => (
                                                    <div
                                                        key={request.id}
                                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                                    >

                                                        <div className="mb-3 flex items-center justify-between">

                                                            <span className="text-sm font-bold text-gray-800">
                                                                {request.requestId}
                                                            </span>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                                    request.status
                                                                )}`}
                                                            >
                                                                {request.status}
                                                            </span>

                                                        </div>

                                                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                                                            <Package
                                                                size={16}
                                                                className="text-green-600"
                                                            />

                                                            <span>
                                                                <strong>
                                                                    Waste:
                                                                </strong>{" "}
                                                                {request.wasteType}
                                                            </span>
                                                        </div>

                                                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                                                            <ClipboardList
                                                                size={16}
                                                                className="text-green-600"
                                                            />

                                                            <span>
                                                                <strong>
                                                                    Quantity:
                                                                </strong>{" "}
                                                                {request.quantity}
                                                            </span>
                                                        </div>

                                                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                                                            <Calendar
                                                                size={16}
                                                                className="text-green-600"
                                                            />

                                                            <span>
                                                                <strong>
                                                                    Pickup:
                                                                </strong>{" "}
                                                                {formatDate(
                                                                    request.scheduledDate ||
                                                                        request.preferredDate
                                                                )}
                                                            </span>
                                                        </div>

                                                        {request.address && (
                                                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                                                <MapPin
                                                                    size={16}
                                                                    className="mt-0.5 text-green-600"
                                                                />

                                                                <span>
                                                                    <strong>
                                                                        Address:
                                                                    </strong>{" "}
                                                                    {
                                                                        request.address
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {request.adminResponse && (
                                                            <div className="mt-3 rounded-lg bg-green-50 p-2 text-xs text-green-800">
                                                                <strong>
                                                                    Admin:
                                                                </strong>{" "}
                                                                {
                                                                    request.adminResponse
                                                                }
                                                            </div>
                                                        )}

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    </div>
                                )}

                                {/* COMPLAINTS */}
                                {message.type === "complaints" && (
                                    <div className="w-full">

                                        <div className="mb-2 rounded-xl bg-white p-3 shadow-sm">

                                            <div className="flex items-center gap-2">
                                                <ClipboardList
                                                    size={18}
                                                    className="text-green-600"
                                                />

                                                <span className="font-semibold text-gray-800">
                                                    {message.title}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {message.text}
                                            </p>

                                        </div>

                                        <div className="space-y-3">

                                            {message.complaints?.map(
                                                (complaint) => (
                                                    <div
                                                        key={complaint.id}
                                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                                    >

                                                        <div className="mb-3 flex items-center justify-between">

                                                            <span className="text-sm font-bold text-gray-800">
                                                                {complaint.complaintId ||
                                                                    "Complaint"}
                                                            </span>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                                    complaint.status
                                                                )}`}
                                                            >
                                                                {complaint.status}
                                                            </span>

                                                        </div>

                                                        {complaint.category && (
                                                            <p className="mb-2 text-sm text-gray-700">
                                                                <strong>
                                                                    Category:
                                                                </strong>{" "}
                                                                {
                                                                    complaint.category
                                                                }
                                                            </p>
                                                        )}

                                                        {complaint.description && (
                                                            <p className="mb-2 text-sm text-gray-700">
                                                                <strong>
                                                                    Complaint:
                                                                </strong>{" "}
                                                                {
                                                                    complaint.description
                                                                }
                                                            </p>
                                                        )}

                                                        {complaint.address && (
                                                            <div className="mb-2 flex items-start gap-2 text-sm text-gray-700">
                                                                <MapPin
                                                                    size={16}
                                                                    className="mt-0.5 text-green-600"
                                                                />

                                                                <span>
                                                                    <strong>
                                                                        Address:
                                                                    </strong>{" "}
                                                                    {
                                                                        complaint.address
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {complaint.adminResponse && (
                                                            <div className="mt-3 rounded-lg bg-green-50 p-2 text-xs text-green-800">
                                                                <strong>
                                                                    Admin Response:
                                                                </strong>{" "}
                                                                {
                                                                    complaint.adminResponse
                                                                }
                                                            </div>
                                                        )}

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    </div>
                                )}

                                {/* NOTIFICATIONS */}
                                {message.type === "notifications" && (
                                    <div className="w-full">

                                        <div className="mb-2 rounded-xl bg-white p-3 shadow-sm">

                                            <div className="flex items-center gap-2">
                                                <Bell
                                                    size={18}
                                                    className="text-green-600"
                                                />

                                                <span className="font-semibold text-gray-800">
                                                    {message.title}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {message.text}
                                            </p>

                                        </div>

                                        <div className="space-y-3">

                                            {message.notifications?.map(
                                                (notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`rounded-xl border p-4 shadow-sm ${
                                                            notification.isRead
                                                                ? "border-gray-200 bg-white"
                                                                : "border-green-200 bg-green-50"
                                                        }`}
                                                    >

                                                        <div className="flex items-start gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
                                                                <Bell
                                                                    size={17}
                                                                    className="text-green-600"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <div className="flex items-center gap-2">

                                                                    <h3 className="text-sm font-semibold text-gray-800">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </h3>

                                                                    {!notification.isRead && (
                                                                        <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                            New
                                                                        </span>
                                                                    )}

                                                                </div>

                                                                <p className="mt-1 text-sm text-gray-700">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <p className="mt-2 text-xs text-gray-400">
                                                                    {formatDate(
                                                                        notification.createdAt
                                                                    )}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    </div>
                                )}

                                {/* PROFILE */}
                                {message.type === "profile" && (
                                    <div className="w-full">

                                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                                            <div className="mb-4 flex items-center gap-3">

                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                                    <User
                                                        size={24}
                                                        className="text-green-600"
                                                    />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {message.profile?.name ||
                                                            "Citizen"}
                                                    </h3>

                                                    <p className="text-xs text-gray-500">
                                                        Citizen Profile
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="space-y-3">

                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Name
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {message.profile?.name ||
                                                            "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Email
                                                    </p>
                                                    <p className="break-all text-sm font-medium text-gray-800">
                                                        {message.profile?.email ||
                                                            "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Phone
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {message.profile?.phone ||
                                                            "-"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Address
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {message.profile?.address ||
                                                            "-"}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* RECYCLING GUIDE */}
                                {message.type === "recycling" && (
                                    <div className="w-full">

                                        <div className="mb-2 rounded-xl bg-white p-4 shadow-sm">

                                            <div className="mb-2 flex items-center gap-2">

                                                <Recycle
                                                    size={20}
                                                    className="text-green-600"
                                                />

                                                <h3 className="font-semibold text-gray-800">
                                                    {message.title}
                                                </h3>

                                            </div>

                                            <p className="text-xs text-gray-500">
                                                Learn how to properly
                                                segregate and recycle
                                                different types of waste.
                                            </p>

                                        </div>

                                        <div className="space-y-3">

                                            {message.categories?.map(
                                                (category, categoryIndex) => (
                                                    <div
                                                        key={categoryIndex}
                                                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                                    >

                                                        <h3 className="mb-1 text-sm font-semibold text-gray-800">
                                                            {category.name}
                                                        </h3>

                                                        <p className="text-xs text-gray-600">
                                                            <strong>
                                                                Examples:
                                                            </strong>{" "}
                                                            {category.items}
                                                        </p>

                                                        <div className="mt-2 rounded-lg bg-green-50 p-2">

                                                            <p className="text-xs text-green-800">
                                                                💡{" "}
                                                                <strong>
                                                                    Tip:
                                                                </strong>{" "}
                                                                {category.tip}
                                                            </p>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                        {message.tip && (
                                            <div className="mt-3 rounded-xl bg-green-600 p-4 text-sm text-white shadow-sm">

                                                <strong>
                                                    🌱 Eco Tip
                                                </strong>

                                                <p className="mt-1 text-green-50">
                                                    {message.tip}
                                                </p>

                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        ))}

                        <div ref={messagesEndRef} className="h-1" />

                    </div>

                    {/* INPUT */}
                    <div className="flex border-t bg-white p-3">

                        <input
                            type="text"
                            value={input}
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSend();
                                }
                            }}
                            placeholder="Ask EcoWaste..."
                            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-green-500"
                        />

                        <button
                            onClick={handleSend}
                            className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>

                    </div>

                </div>
            )}
        </>
    );
};

export default Chatbot;